import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { logAudit } from '@/lib/audit';

/**
 * CSRF Protection Service
 * Implements double-submit cookie pattern for CSRF protection
 */
export class CSRFProtection {
  private static readonly CSRF_TOKEN_LENGTH = 32;
  private static readonly CSRF_COOKIE_NAME = 'csrf-token';
  private static readonly CSRF_HEADER_NAME = 'x-csrf-token';
  private static readonly CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

  /**
   * Generates a CSRF token
   */
  static generateToken(): string {
    return crypto.randomBytes(this.CSRF_TOKEN_LENGTH).toString('hex');
  }

  /**
   * Creates a signed CSRF token
   */
  static createSignedToken(token: string): string {
    const signature = crypto
      .createHmac('sha256', this.CSRF_SECRET)
      .update(token)
      .digest('hex');
    
    return `${token}.${signature}`;
  }

  /**
   * Verifies a signed CSRF token
   */
  static verifySignedToken(signedToken: string): { valid: boolean; token?: string; error?: string } {
    if (!signedToken || typeof signedToken !== 'string') {
      return { valid: false, error: 'No CSRF token provided' };
    }

    const parts = signedToken.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid CSRF token format' };
    }

    const [token, signature] = parts;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', this.CSRF_SECRET)
      .update(token)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      return { valid: false, error: 'Invalid CSRF token signature' };
    }

    return { valid: true, token };
  }

  /**
   * Generates and sets CSRF token in cookie
   */
  static async setCSRFToken(): Promise<string> {
    const token = this.generateToken();
    const signedToken = this.createSignedToken(token);
    
    const cookieStore = await cookies();
    cookieStore.set(this.CSRF_COOKIE_NAME, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    });

    return token;
  }

  /**
   * Gets CSRF token from cookie
   */
  static async getCSRFToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const signedToken = cookieStore.get(this.CSRF_COOKIE_NAME)?.value;
    
    if (!signedToken) {
      return null;
    }

    const verification = this.verifySignedToken(signedToken);
    return verification.valid ? (verification.token || null) : null;
  }

  /**
   * Validates CSRF token from request
   */
  static async validateCSRFToken(request: NextRequest): Promise<{
    valid: boolean;
    error?: string;
    token?: string;
  }> {
    try {
      // Get token from header
      const headerToken = request.headers.get(this.CSRF_HEADER_NAME);
      
      // Get token from cookie
      const cookieToken = await this.getCSRFToken();

      if (!headerToken) {
        return { valid: false, error: 'CSRF token missing from header' };
      }

      if (!cookieToken) {
        return { valid: false, error: 'CSRF token missing from cookie' };
      }

      // Verify tokens match (double-submit cookie pattern)
      if (!crypto.timingSafeEqual(
        Buffer.from(headerToken, 'hex'),
        Buffer.from(cookieToken, 'hex')
      )) {
        await logAudit({
          action: 'CSRF_TOKEN_MISMATCH',
          resourceType: 'SECURITY',
          resourceId: 'N/A',
          reason: 'CSRF token mismatch between header and cookie',
          success: false,
          errorMessage: 'CSRF token mismatch',
          metadata: {
            headerToken: headerToken.substring(0, 8) + '...',
            cookieToken: cookieToken.substring(0, 8) + '...',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        });

        return { valid: false, error: 'CSRF token mismatch' };
      }

      // Verify cookie token signature
      const cookieStore = await cookies();
      const signedCookieToken = cookieStore.get(this.CSRF_COOKIE_NAME)?.value;
      
      if (!signedCookieToken) {
        return { valid: false, error: 'CSRF token cookie not found' };
      }

      const verification = this.verifySignedToken(signedCookieToken);
      if (!verification.valid) {
        await logAudit({
          action: 'CSRF_TOKEN_INVALID_SIGNATURE',
          resourceType: 'SECURITY',
          resourceId: 'N/A',
          reason: 'CSRF token has invalid signature',
          success: false,
          errorMessage: 'CSRF token invalid signature',
          metadata: {
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        });

        return { valid: false, error: 'CSRF token invalid signature' };
      }

      return { valid: true, token: headerToken };

    } catch (error) {
      console.error('CSRF validation error:', error);
      return { valid: false, error: 'CSRF validation failed' };
    }
  }

  /**
   * Middleware to add CSRF protection to API routes
   */
  static async protectRoute(request: NextRequest): Promise<{
    allowed: boolean;
    error?: string;
    token?: string;
  }> {
    // Skip CSRF protection for GET requests
    if (request.method === 'GET') {
      return { allowed: true };
    }

    // Skip CSRF protection for public endpoints that don't need it
    const publicEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password'
    ];

    const url = new URL(request.url);
    if (publicEndpoints.some(endpoint => url.pathname.startsWith(endpoint))) {
      return { allowed: true };
    }

    // Validate CSRF token
    const validation = await this.validateCSRFToken(request);
    
    if (!validation.valid) {
      await logAudit({
        action: 'CSRF_PROTECTION_BLOCKED',
        resourceType: 'SECURITY',
        resourceId: 'N/A',
        reason: 'CSRF protection blocked request',
        success: false,
        errorMessage: validation.error,
        metadata: {
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          method: request.method,
          url: url.pathname
        }
      });

      return { allowed: false, error: validation.error };
    }

    return { allowed: true, token: validation.token };
  }

  /**
   * Generates CSRF token for frontend forms
   */
  static async generateFormToken(): Promise<{
    token: string;
    cookieName: string;
    headerName: string;
  }> {
    const token = await this.setCSRFToken();
    
    return {
      token,
      cookieName: this.CSRF_COOKIE_NAME,
      headerName: this.CSRF_HEADER_NAME
    };
  }

  /**
   * Clears CSRF token (for logout)
   */
  static async clearCSRFToken(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.CSRF_COOKIE_NAME);
  }

  /**
   * Refreshes CSRF token (for long-running sessions)
   */
  static async refreshCSRFToken(): Promise<string> {
    await this.clearCSRFToken();
    return await this.setCSRFToken();
  }
}

/**
 * CSRF Protection Middleware for Next.js API routes
 */
export async function withCSRFProtection(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const protection = await CSRFProtection.protectRoute(request);
    
    if (!protection.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'CSRF protection failed', 
          details: protection.error 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request);
  };
}
