import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';
import { logAudit } from '@/lib/audit';
import { FallbackRateLimiter } from './fallback-rate-limiter';

// Initialize Redis client with fallback
let redis: Redis | null = null;
let redisAvailable = false;

try {
  redis = Redis.fromEnv();
  redisAvailable = true;
  console.log('✅ Redis connected successfully');
} catch (error) {
  console.warn('⚠️ Redis not available, using fallback rate limiter:', error);
  redisAvailable = false;
}

// Define rate limiters for different registration scenarios (only if Redis is available)
let registrationRateLimiter: Ratelimit | null = null;
let emailVerificationRateLimiter: Ratelimit | null = null;
let formSubmissionRateLimiter: Ratelimit | null = null;
let suspiciousActivityRateLimiter: Ratelimit | null = null;

if (redisAvailable && redis) {
  registrationRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 registrations per hour per IP
    analytics: true,
    prefix: 'ratelimit:registration',
  });

  emailVerificationRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 verification attempts per 15 minutes
    analytics: true,
    prefix: 'ratelimit:email_verification',
  });

  formSubmissionRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '5 m'), // 10 form submissions per 5 minutes
    analytics: true,
    prefix: 'ratelimit:form_submission',
  });

  suspiciousActivityRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(1, '1 h'), // 1 attempt per hour for suspicious activity
    analytics: true,
    prefix: 'ratelimit:suspicious_activity',
  });
}

export class RegistrationRateLimiter {
  /**
   * Applies rate limiting for patient registration
   */
  static async checkRegistrationLimit(
    request: NextRequest,
    identifier?: string
  ): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number; error?: string }> {
    // Use fallback if Redis is not available
    if (!redisAvailable || !registrationRateLimiter) {
      return await FallbackRateLimiter.checkRateLimit(request, 'registration', identifier);
    }

    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';
    const finalIdentifier = identifier || ipIdentifier;

    const { success, limit, reset, remaining } = await registrationRateLimiter.limit(finalIdentifier);

    if (!success) {
      await logAudit({
        action: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
        resourceType: 'SECURITY',
        resourceId: finalIdentifier,
        reason: 'Too many registration attempts',
        success: false,
        errorMessage: 'Registration rate limit exceeded',
        metadata: {
          ipAddress: ipIdentifier,
          limit,
          remaining,
          reset,
          rateLimitType: 'registration'
        }
      });

      return { 
        allowed: false, 
        limit, 
        remaining, 
        reset, 
        error: 'Too many registration attempts. Please try again later.' 
      };
    }

    return { allowed: true, limit, remaining, reset };
  }

  /**
   * Applies rate limiting for email verification
   */
  static async checkEmailVerificationLimit(
    request: NextRequest,
    email: string
  ): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number; error?: string }> {
    // Use fallback if Redis is not available
    if (!redisAvailable || !emailVerificationRateLimiter) {
      return await FallbackRateLimiter.checkRateLimit(request, 'email_verification', email);
    }

    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';
    const identifier = `${ipIdentifier}:${email}`;

    const { success, limit, reset, remaining } = await emailVerificationRateLimiter.limit(identifier);

    if (!success) {
      await logAudit({
        action: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
        resourceType: 'SECURITY',
        resourceId: identifier,
        reason: 'Too many email verification attempts',
        success: false,
        errorMessage: 'Email verification rate limit exceeded',
        metadata: {
          ipAddress: ipIdentifier,
          email,
          limit,
          remaining,
          reset,
          rateLimitType: 'email_verification'
        }
      });

      return { 
        allowed: false, 
        limit, 
        remaining, 
        reset, 
        error: 'Too many email verification attempts. Please try again later.' 
      };
    }

    return { allowed: true, limit, remaining, reset };
  }

  /**
   * Applies rate limiting for form submissions
   */
  static async checkFormSubmissionLimit(
    request: NextRequest,
    formType: string
  ): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number; error?: string }> {
    // Use fallback if Redis is not available
    if (!redisAvailable || !formSubmissionRateLimiter) {
      return await FallbackRateLimiter.checkRateLimit(request, 'form_submission', formType);
    }

    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';
    const identifier = `${ipIdentifier}:${formType}`;

    const { success, limit, reset, remaining } = await formSubmissionRateLimiter.limit(identifier);

    if (!success) {
      await logAudit({
        action: 'FORM_SUBMISSION_RATE_LIMIT_EXCEEDED',
        resourceType: 'SECURITY',
        resourceId: identifier,
        reason: 'Too many form submissions',
        success: false,
        errorMessage: 'Form submission rate limit exceeded',
        metadata: {
          ipAddress: ipIdentifier,
          formType,
          limit,
          remaining,
          reset,
          rateLimitType: 'form_submission'
        }
      });

      return { 
        allowed: false, 
        limit, 
        remaining, 
        reset, 
        error: 'Too many form submissions. Please try again later.' 
      };
    }

    return { allowed: true, limit, remaining, reset };
  }

  /**
   * Applies rate limiting for suspicious activity
   */
  static async checkSuspiciousActivityLimit(
    request: NextRequest,
    activityType: string
  ): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number; error?: string }> {
    // Use fallback if Redis is not available
    if (!redisAvailable || !suspiciousActivityRateLimiter) {
      return await FallbackRateLimiter.checkRateLimit(request, 'suspicious_activity', activityType);
    }

    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';
    const identifier = `${ipIdentifier}:${activityType}`;

    const { success, limit, reset, remaining } = await suspiciousActivityRateLimiter.limit(identifier);

    if (!success) {
      await logAudit({
        action: 'SUSPICIOUS_ACTIVITY_RATE_LIMIT_EXCEEDED',
        resourceType: 'SECURITY',
        resourceId: identifier,
        reason: 'Suspicious activity detected and rate limited',
        success: false,
        errorMessage: 'Suspicious activity rate limit exceeded',
        metadata: {
          ipAddress: ipIdentifier,
          activityType,
          limit,
          remaining,
          reset,
          rateLimitType: 'suspicious_activity'
        }
      });

      return { 
        allowed: false, 
        limit, 
        remaining, 
        reset, 
        error: 'Suspicious activity detected. Access temporarily restricted.' 
      };
    }

    return { allowed: true, limit, remaining, reset };
  }

  /**
   * Detects suspicious registration patterns
   */
  static async detectSuspiciousRegistration(
    request: NextRequest,
    registrationData: any
  ): Promise<{ isSuspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check for bot-like user agents
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i, /java/i
    ];
    
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      reasons.push('Bot-like user agent detected');
    }

    // Check for suspicious email patterns
    const email = registrationData.email;
    if (email) {
      // Check for disposable email domains
      const disposableEmailDomains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com'
      ];
      
      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (disposableEmailDomains.includes(emailDomain)) {
        reasons.push('Disposable email domain detected');
      }

      // Check for suspicious email patterns
      const suspiciousEmailPatterns = [
        /test/i, /fake/i, /dummy/i, /spam/i, /bot/i
      ];
      
      if (suspiciousEmailPatterns.some(pattern => pattern.test(email))) {
        reasons.push('Suspicious email pattern detected');
      }
    }

    // Check for suspicious name patterns
    const firstName = registrationData.first_name;
    const lastName = registrationData.last_name;
    
    if (firstName && lastName) {
      // Check for repeated characters
      if (/(.)\1{3,}/.test(firstName) || /(.)\1{3,}/.test(lastName)) {
        reasons.push('Repeated characters in name detected');
      }

      // Check for random character patterns
      if (/^[a-z]{1,3}[0-9]{3,}$/i.test(firstName) || /^[a-z]{1,3}[0-9]{3,}$/i.test(lastName)) {
        reasons.push('Random character pattern in name detected');
      }
    }

    // Check for suspicious phone patterns
    const phone = registrationData.phone;
    if (phone) {
      // Check for repeated digits
      if (/(\d)\1{4,}/.test(phone)) {
        reasons.push('Repeated digits in phone number detected');
      }

      // Check for sequential patterns
      if (/123456789|987654321/.test(phone)) {
        reasons.push('Sequential pattern in phone number detected');
      }
    }

    // Check for suspicious address patterns
    const address = registrationData.address;
    if (address) {
      // Check for test addresses
      const testAddressPatterns = [
        /test/i, /fake/i, /dummy/i, /123 main st/i, /sample/i
      ];
      
      if (testAddressPatterns.some(pattern => pattern.test(address))) {
        reasons.push('Test address pattern detected');
      }
    }

    // Check for rapid form submission (less than 5 seconds)
    const formSubmissionTime = Date.now();
    // This would need to be stored in Redis with a TTL
    // For now, we'll just check if the form data looks too perfect
    if (registrationData.privacy_consent && 
        registrationData.service_consent && 
        registrationData.medical_consent &&
        registrationData.first_name &&
        registrationData.last_name &&
        registrationData.email &&
        registrationData.phone &&
        registrationData.address) {
      // All required fields filled - could be suspicious if done too quickly
      reasons.push('All required fields filled - potential automated submission');
    }

    const isSuspicious = reasons.length > 0;

    if (isSuspicious) {
      await logAudit({
        action: 'SUSPICIOUS_REGISTRATION_DETECTED',
        resourceType: 'SECURITY',
        resourceId: ipIdentifier,
        reason: 'Suspicious registration pattern detected',
        success: false,
        errorMessage: 'Suspicious registration detected',
        metadata: {
          ipAddress: ipIdentifier,
          userAgent,
          reasons,
          registrationData: {
            email: registrationData.email,
            firstName: registrationData.first_name,
            lastName: registrationData.last_name,
            phone: registrationData.phone
          }
        }
      });
    }

    return { isSuspicious, reasons };
  }

  /**
   * Gets rate limit status for a given identifier
   */
  static async getRateLimitStatus(
    request: NextRequest,
    rateLimitType: 'registration' | 'email_verification' | 'form_submission' | 'suspicious_activity'
  ): Promise<{ limit: number; remaining: number; reset: number }> {
    const ipIdentifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown_ip';

    let limiter: Ratelimit | null;
    switch (rateLimitType) {
      case 'registration':
        limiter = registrationRateLimiter;
        break;
      case 'email_verification':
        limiter = emailVerificationRateLimiter;
        break;
      case 'form_submission':
        limiter = formSubmissionRateLimiter;
        break;
      case 'suspicious_activity':
        limiter = suspiciousActivityRateLimiter;
        break;
      default:
        limiter = registrationRateLimiter;
    }

    if (!limiter) {
      // Fallback to basic rate limiting if Redis is not available
      return { limit: 10, remaining: 9, reset: Date.now() + 3600000 };
    }

    const result = await limiter.limit(ipIdentifier);
    return { 
      limit: result.limit, 
      remaining: result.remaining, 
      reset: result.reset 
    };
  }
}
