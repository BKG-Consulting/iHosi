import { NextRequest } from 'next/server';
import { logAudit } from '@/lib/audit';

/**
 * Fallback Rate Limiter for Development
 * Uses in-memory storage when Redis is not available
 */
export class FallbackRateLimiter {
  private static readonly rateLimitStore = new Map<string, {
    count: number;
    resetTime: number;
  }>();

  private static readonly RATE_LIMITS = {
    registration: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
    email_verification: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
    form_submission: { maxRequests: 10, windowMs: 5 * 60 * 1000 }, // 10 per 5 minutes
    suspicious_activity: { maxRequests: 1, windowMs: 60 * 60 * 1000 }, // 1 per hour
  };

  /**
   * Applies rate limiting using in-memory storage
   */
  static async checkRateLimit(
    request: NextRequest,
    type: 'registration' | 'email_verification' | 'form_submission' | 'suspicious_activity',
    identifier?: string
  ): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number; error?: string }> {
    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';
    const finalIdentifier = identifier || ipIdentifier;
    const key = `${type}:${finalIdentifier}`;
    
    const now = Date.now();
    const rateLimit = this.RATE_LIMITS[type];
    const windowMs = rateLimit.windowMs;
    const maxRequests = rateLimit.maxRequests;

    // Clean up expired entries
    this.cleanupExpiredEntries(now);

    // Get current rate limit data
    const currentData = this.rateLimitStore.get(key);
    
    if (!currentData || now > currentData.resetTime) {
      // First request or window expired
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });

      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: Math.ceil((now + windowMs) / 1000)
      };
    }

    if (currentData.count >= maxRequests) {
      // Rate limit exceeded
      await logAudit({
        action: 'RATE_LIMIT_EXCEEDED_FALLBACK',
        resourceType: 'SECURITY',
        resourceId: finalIdentifier,
        reason: `Rate limit exceeded for ${type} (fallback mode)`,
        success: false,
        errorMessage: `Too many requests for ${type}`,
        metadata: {
          ipAddress: ipIdentifier,
          limit: maxRequests,
          remaining: 0,
          reset: Math.ceil(currentData.resetTime / 1000),
          rateLimitType: type,
          mode: 'fallback'
        }
      });

      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        reset: Math.ceil(currentData.resetTime / 1000),
        error: `Too many requests for ${type}. Please try again later.`
      };
    }

    // Increment count
    currentData.count++;
    this.rateLimitStore.set(key, currentData);

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - currentData.count,
      reset: Math.ceil(currentData.resetTime / 1000)
    };
  }

  /**
   * Cleans up expired rate limit entries
   */
  private static cleanupExpiredEntries(now: number): void {
    for (const [key, data] of this.rateLimitStore.entries()) {
      if (now > data.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Gets rate limit status for a given identifier
   */
  static async getRateLimitStatus(
    request: NextRequest,
    type: 'registration' | 'email_verification' | 'form_submission' | 'suspicious_activity'
  ): Promise<{ limit: number; remaining: number; reset: number }> {
    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';
    const key = `${type}:${ipIdentifier}`;
    const now = Date.now();
    const rateLimit = this.RATE_LIMITS[type];
    const maxRequests = rateLimit.maxRequests;

    const currentData = this.rateLimitStore.get(key);
    
    if (!currentData || now > currentData.resetTime) {
      return {
        limit: maxRequests,
        remaining: maxRequests,
        reset: Math.ceil((now + rateLimit.windowMs) / 1000)
      };
    }

    return {
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - currentData.count),
      reset: Math.ceil(currentData.resetTime / 1000)
    };
  }

  /**
   * Resets rate limit for a specific identifier
   */
  static resetRateLimit(
    request: NextRequest,
    type: 'registration' | 'email_verification' | 'form_submission' | 'suspicious_activity',
    identifier?: string
  ): void {
    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';
    const finalIdentifier = identifier || ipIdentifier;
    const key = `${type}:${finalIdentifier}`;
    
    this.rateLimitStore.delete(key);
  }

  /**
   * Gets all current rate limit entries (for debugging)
   */
  static getAllEntries(): Record<string, { count: number; resetTime: number }> {
    const entries: Record<string, { count: number; resetTime: number }> = {};
    for (const [key, data] of this.rateLimitStore.entries()) {
      entries[key] = { ...data };
    }
    return entries;
  }
}




