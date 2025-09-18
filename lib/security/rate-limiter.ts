import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import crypto from 'crypto';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds to wait before retry
}

export interface RateLimitRule {
  name: string;
  config: RateLimitConfig;
  paths: string[]; // Paths this rule applies to
  methods?: string[]; // HTTP methods this rule applies to
}

// Predefined rate limit rules
export const RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    name: 'auth_login',
    config: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 login attempts per 15 minutes
      skipSuccessfulRequests: true
    },
    paths: ['/api/auth/login'],
    methods: ['POST']
  },
  {
    name: 'auth_register',
    config: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 registrations per hour
      skipSuccessfulRequests: true
    },
    paths: ['/api/auth/register'],
    methods: ['POST']
  },
  {
    name: 'auth_password_reset',
    config: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 password reset requests per hour
      skipSuccessfulRequests: true
    },
    paths: ['/api/auth/forgot-password', '/api/auth/reset-password'],
    methods: ['POST']
  },
  {
    name: 'auth_mfa',
    config: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10, // 10 MFA attempts per 5 minutes
      skipSuccessfulRequests: true
    },
    paths: ['/api/auth/verify-mfa'],
    methods: ['POST']
  },
  {
    name: 'api_general',
    config: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requests per 15 minutes
      skipSuccessfulRequests: false
    },
    paths: ['/api/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  {
    name: 'api_sensitive',
    config: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 20, // 20 requests per 5 minutes
      skipSuccessfulRequests: false
    },
    paths: ['/api/patient/', '/api/doctor/', '/api/admin/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
];

export class RateLimiter {
  /**
   * Check if request is within rate limits
   */
  static async checkRateLimit(
    request: NextRequest,
    ruleName?: string
  ): Promise<RateLimitResult> {
    try {
      const { pathname } = request.nextUrl;
      const method = request.method;
      const ipAddress = this.getClientIP(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Find applicable rule
      const rule = ruleName 
        ? RATE_LIMIT_RULES.find(r => r.name === ruleName)
        : this.findApplicableRule(pathname, method);

      if (!rule) {
        // No rate limiting for this request
        return {
          allowed: true,
          limit: Infinity,
          remaining: Infinity,
          resetTime: new Date(Date.now() + 15 * 60 * 1000)
        };
      }

      // Generate rate limit key
      const key = this.generateKey(request, rule, ipAddress);
      const now = new Date();
      const windowStart = new Date(now.getTime() - rule.config.windowMs);

      // Get current request count
      const requestCount = await this.getRequestCount(key, windowStart);

      // Check if limit exceeded
      const allowed = requestCount < rule.config.maxRequests;
      const remaining = Math.max(0, rule.config.maxRequests - requestCount);
      const resetTime = new Date(now.getTime() + rule.config.windowMs);

      // Record this request
      await this.recordRequest(key, ipAddress, userAgent, pathname, method, now);

      // Log rate limit events
      if (!allowed) {
        await logAudit({
          action: 'READ',
          resourceType: 'RATE_LIMIT',
          resourceId: key,
          success: false,
          errorMessage: 'Rate limit exceeded',
          reason: `Rate limit exceeded for ${rule.name}`,
          metadata: {
            ruleName: rule.name,
            pathname,
            method,
            ipAddress,
            userAgent,
            requestCount,
            limit: rule.config.maxRequests,
            windowMs: rule.config.windowMs
          }
        });
      }

      return {
        allowed,
        limit: rule.config.maxRequests,
        remaining,
        resetTime,
        retryAfter: allowed ? undefined : Math.ceil(rule.config.windowMs / 1000)
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        limit: Infinity,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 15 * 60 * 1000)
      };
    }
  }

  /**
   * Apply rate limiting to a request
   */
  static async applyRateLimit(
    request: NextRequest,
    ruleName?: string
  ): Promise<{
    allowed: boolean;
    response?: Response;
    retryAfter?: number;
  }> {
    const result = await this.checkRateLimit(request, ruleName);

    if (!result.allowed) {
      return {
        allowed: false,
        response: new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: result.retryAfter,
            resetTime: result.resetTime
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString()
            }
          }
        ),
        retryAfter: result.retryAfter
      };
    }

    return { allowed: true };
  }

  /**
   * Get rate limit status for a client
   */
  static async getRateLimitStatus(
    request: NextRequest,
    ruleName?: string
  ): Promise<{
    ruleName: string;
    limit: number;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    const result = await this.checkRateLimit(request, ruleName);
    const rule = ruleName 
      ? RATE_LIMIT_RULES.find(r => r.name === ruleName)
      : this.findApplicableRule(request.nextUrl.pathname, request.method);

    return {
      ruleName: rule?.name || 'none',
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter: result.retryAfter
    };
  }

  /**
   * Reset rate limit for a specific client
   */
  static async resetRateLimit(
    request: NextRequest,
    ruleName?: string
  ): Promise<void> {
    try {
      const { pathname } = request.nextUrl;
      const method = request.method;
      const ipAddress = this.getClientIP(request);

      const rule = ruleName 
        ? RATE_LIMIT_RULES.find(r => r.name === ruleName)
        : this.findApplicableRule(pathname, method);

      if (!rule) return;

      const key = this.generateKey(request, rule, ipAddress);
      
      // Delete all rate limit records for this key
      await db.rateLimit.deleteMany({
        where: { rate_limit_key: key }
      });

      // Log reset
      await logAudit({
        action: 'DELETE',
        resourceType: 'RATE_LIMIT',
        resourceId: key,
        reason: 'Rate limit reset',
        metadata: {
          ruleName: rule.name,
          pathname,
          method,
          ipAddress
        }
      });
    } catch (error) {
      console.error('Rate limit reset failed:', error);
    }
  }

  /**
   * Clean up expired rate limit records
   */
  static async cleanupExpiredRecords(): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      const result = await db.rateLimit.deleteMany({
        where: {
          created_at: { lt: cutoffTime }
        }
      });

      // Log cleanup
      await logAudit({
        action: 'DELETE',
        resourceType: 'SYSTEM',
        resourceId: 'RATE_LIMIT_CLEANUP',
        reason: 'Expired rate limit records cleaned up',
        metadata: {
          recordsDeleted: result.count
        }
      });

      return result.count;
    } catch (error) {
      console.error('Rate limit cleanup failed:', error);
      return 0;
    }
  }

  // Private helper methods

  private static findApplicableRule(pathname: string, method: string): RateLimitRule | undefined {
    return RATE_LIMIT_RULES.find(rule => {
      const pathMatches = rule.paths.some(path => {
        if (path.endsWith('/')) {
          return pathname.startsWith(path);
        }
        return pathname === path;
      });

      const methodMatches = !rule.methods || rule.methods.includes(method);

      return pathMatches && methodMatches;
    });
  }

  private static generateKey(
    request: NextRequest,
    rule: RateLimitRule,
    ipAddress: string
  ): string {
    if (rule.config.keyGenerator) {
      return rule.config.keyGenerator(request);
    }

    // Default key generation: IP + User-Agent hash + path
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const userAgentHash = crypto.createHash('sha256')
      .update(userAgent)
      .digest('hex')
      .substring(0, 8);

    return `${rule.name}:${ipAddress}:${userAgentHash}:${request.nextUrl.pathname}`;
  }

  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return 'unknown';
  }

  private static async getRequestCount(key: string, windowStart: Date): Promise<number> {
    try {
      const count = await db.rateLimit.count({
        where: {
          rate_limit_key: key,
          created_at: { gte: windowStart }
        }
      });

      return count;
    } catch (error) {
      console.error('Failed to get request count:', error);
      return 0;
    }
  }

  private static async recordRequest(
    key: string,
    ipAddress: string,
    userAgent: string,
    pathname: string,
    method: string,
    timestamp: Date
  ): Promise<void> {
    try {
      await db.rateLimit.create({
        data: {
          rate_limit_key: key,
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: timestamp
        }
      });
    } catch (error) {
      console.error('Failed to record request:', error);
    }
  }
}

// Utility function for middleware
export async function rateLimitMiddleware(
  request: NextRequest,
  ruleName?: string
): Promise<Response | null> {
  const result = await RateLimiter.applyRateLimit(request, ruleName);
  
  if (!result.allowed && result.response) {
    return result.response;
  }
  
  return null;
}
