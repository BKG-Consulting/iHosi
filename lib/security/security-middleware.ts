import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from './rate-limiter';
import { logAudit } from '@/lib/audit';

/**
 * Security Middleware for applying security headers and policies
 */
export class SecurityMiddleware {
  /**
   * Apply comprehensive security headers to response
   */
  static applySecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.com https://clerk.dev https://*.clerk.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://clerk.com https://*.clerk.com https://clerk.dev https://*.clerk.dev wss://clerk.com wss://*.clerk.com",
      "frame-src 'self' https://clerk.com https://*.clerk.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');

    // Apply security headers
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // HSTS (HTTP Strict Transport Security)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Permissions Policy
    const permissionsPolicy = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', ');
    
    response.headers.set('Permissions-Policy', permissionsPolicy);
    
    // Additional security headers
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    
    return response;
  }

  /**
   * Apply basic security headers (for development)
   */
  static applyBasicSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }

  /**
   * Apply HIPAA-compliant security headers
   */
  static applyHIPAASecurityHeaders(response: NextResponse): NextResponse {
    // Apply standard security headers
    this.applySecurityHeaders(response);
    
    // Additional HIPAA-specific headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Prevent caching of sensitive data
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  }

  /**
   * Apply security headers for API responses
   */
  static applyAPISecurityHeaders(response: NextResponse): NextResponse {
    // Basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // API-specific headers
    response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3000'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // Prevent caching of API responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
  }

  /**
   * Apply security headers for authentication endpoints
   */
  static applyAuthSecurityHeaders(response: NextResponse): NextResponse {
    // Apply HIPAA security headers for auth endpoints
    this.applyHIPAASecurityHeaders(response);
    
    // Additional auth-specific headers
    response.headers.set('WWW-Authenticate', 'Bearer');
    response.headers.set('X-Auth-Required', 'true');
    
    return response;
  }

  /**
   * Apply security headers for file uploads
   */
  static applyFileUploadSecurityHeaders(response: NextResponse): NextResponse {
    // Basic security headers
    this.applyBasicSecurityHeaders(response);
    
    // File upload specific headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Download-Options', 'noopen');
    
    return response;
  }

  /**
   * Apply security headers for error responses
   */
  static applyErrorSecurityHeaders(response: NextResponse): NextResponse {
    // Basic security headers
    this.applyBasicSecurityHeaders(response);
    
    // Error response specific headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
  }

  /**
   * Get security headers as object (for testing)
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://clerk.com https://*.clerk.com; frame-src 'self' https://clerk.com https://*.clerk.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    };
  }

  /**
   * Protect registration endpoint with comprehensive security checks
   */
  static async protectRegistration(
    request: NextRequest, 
    registrationData: any
  ): Promise<{
    allowed: boolean;
    error?: string;
    response?: NextResponse;
    metadata?: any;
  }> {
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Rate limiting check
      const rateLimitResult = await RateLimiter.checkRateLimit(
        request,
        'registration'
      );

      if (!rateLimitResult.allowed) {
        await logAudit({
          action: 'RATE_LIMIT_EXCEEDED',
          resourceType: 'REGISTRATION',
          resourceId: 'N/A',
          reason: 'Registration rate limit exceeded',
          success: false,
          errorMessage: 'Too many registration attempts',
          metadata: {
            ipAddress,
            userAgent,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime
          }
        });

        return {
          allowed: false,
          error: 'Too many registration attempts. Please try again later.',
          response: NextResponse.json(
            { error: 'Too many registration attempts. Please try again later.' },
            { status: 429 }
          ),
          metadata: {
            rateLimitExceeded: true,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime
          }
        };
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /eval\(/i,
        /expression\(/i
      ];

      const dataString = JSON.stringify(registrationData);
      const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
        pattern.test(dataString)
      );

      if (hasSuspiciousContent) {
        await logAudit({
          action: 'SUSPICIOUS_REGISTRATION_ATTEMPT',
          resourceType: 'REGISTRATION',
          resourceId: 'N/A',
          reason: 'Suspicious content detected in registration data',
          success: false,
          errorMessage: 'Suspicious content detected',
          metadata: {
            ipAddress,
            userAgent,
            email: registrationData.email,
            suspiciousPatterns: suspiciousPatterns.filter(p => p.test(dataString))
          }
        });

        return {
          allowed: false,
          error: 'Suspicious content detected in registration data',
          response: NextResponse.json(
            { error: 'Invalid registration data' },
            { status: 400 }
          ),
          metadata: {
            suspiciousContent: true,
            detectedPatterns: suspiciousPatterns.filter(p => p.test(dataString))
          }
        };
      }

      // Check for duplicate email attempts from same IP
      const emailRateLimitResult = await RateLimiter.checkRateLimit(
        request,
        'registration_email'
      );

      if (!emailRateLimitResult.allowed) {
        await logAudit({
          action: 'DUPLICATE_EMAIL_REGISTRATION_ATTEMPT',
          resourceType: 'REGISTRATION',
          resourceId: 'N/A',
          reason: 'Too many registration attempts for same email from same IP',
          success: false,
          errorMessage: 'Too many attempts for this email',
          metadata: {
            ipAddress,
            userAgent,
            email: registrationData.email,
            limit: emailRateLimitResult.limit,
            remaining: emailRateLimitResult.remaining,
            resetTime: emailRateLimitResult.resetTime
          }
        });

        return {
          allowed: false,
          error: 'Too many registration attempts for this email. Please try again later.',
          response: NextResponse.json(
            { error: 'Too many registration attempts for this email. Please try again later.' },
            { status: 429 }
          ),
          metadata: {
            emailRateLimitExceeded: true,
            email: registrationData.email,
            limit: emailRateLimitResult.limit,
            remaining: emailRateLimitResult.remaining,
            resetTime: emailRateLimitResult.resetTime
          }
        };
      }

      // Log successful security check
      await logAudit({
        action: 'REGISTRATION_SECURITY_CHECK_PASSED',
        resourceType: 'REGISTRATION',
        resourceId: 'N/A',
        reason: 'Registration security checks passed',
        success: true,
        metadata: {
          ipAddress,
          userAgent,
          email: registrationData.email,
          rateLimitRemaining: rateLimitResult.remaining,
          emailRateLimitRemaining: emailRateLimitResult.remaining
        }
      });

      return {
        allowed: true,
        metadata: {
          ipAddress,
          userAgent,
          rateLimitRemaining: rateLimitResult.remaining,
          emailRateLimitRemaining: emailRateLimitResult.remaining,
          securityChecksPassed: true
        }
      };

    } catch (error) {
      console.error('Registration security check error:', error);
      
      await logAudit({
        action: 'REGISTRATION_SECURITY_CHECK_ERROR',
        resourceType: 'REGISTRATION',
        resourceId: 'N/A',
        reason: 'Error during registration security check',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          error: error instanceof Error ? error.stack : 'Unknown error'
        }
      });

      return {
        allowed: false,
        error: 'Security check failed',
        response: NextResponse.json(
          { error: 'Security check failed. Please try again.' },
          { status: 500 }
        ),
        metadata: {
          securityCheckError: true,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

/**
 * Security middleware factory for different response types
 */
export class SecurityMiddlewareFactory {
  /**
   * Create security middleware based on response type
   */
  static create(type: 'default' | 'api' | 'auth' | 'file' | 'error' | 'hipaa' = 'default') {
    switch (type) {
      case 'api':
        return SecurityMiddleware.applyAPISecurityHeaders;
      case 'auth':
        return SecurityMiddleware.applyAuthSecurityHeaders;
      case 'file':
        return SecurityMiddleware.applyFileUploadSecurityHeaders;
      case 'error':
        return SecurityMiddleware.applyErrorSecurityHeaders;
      case 'hipaa':
        return SecurityMiddleware.applyHIPAASecurityHeaders;
      default:
        return SecurityMiddleware.applySecurityHeaders;
    }
  }
}

/**
 * Utility function to apply security headers
 */
export function withSecurityHeaders(
  response: NextResponse,
  type: 'default' | 'api' | 'auth' | 'file' | 'error' | 'hipaa' = 'default'
): NextResponse {
  const middleware = SecurityMiddlewareFactory.create(type);
  return middleware(response);
}
