import crypto from 'crypto';

/**
 * Security utility functions for the healthcare management system
 */

export class SecurityUtils {
  /**
   * Generate a cryptographically secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random base32 string (for TOTP secrets)
   */
  static generateBase32Secret(length: number = 20): string {
    return crypto.randomBytes(length).toString('base64');
  }

  /**
   * Generate secure backup codes
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash a string using SHA-256
   */
  static hashString(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Generate a secure session ID
   */
  static generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate a secure token ID for refresh tokens
   */
  static generateTokenId(): string {
    return crypto.randomUUID();
  }

  /**
   * Create a secure hash for rate limiting keys
   */
  static createRateLimitKey(ip: string, userAgent: string, path: string): string {
    const combined = `${ip}:${userAgent}:${path}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 12) {
      feedback.push('Password must be at least 12 characters long');
    } else {
      score += 1;
    }

    // Character variety checks
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain uppercase letters');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain numbers');
    } else {
      score += 1;
    }

    if (!/[@$!%*?&]/.test(password)) {
      feedback.push('Password must contain special characters (@$!%*?&)');
    } else {
      score += 1;
    }

    // Common password patterns
    const commonPatterns = [
      /password/i,
      /123456/,
      /qwerty/i,
      /admin/i,
      /letmein/i
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      feedback.push('Password contains common patterns and is not secure');
      score = Math.max(0, score - 2);
    }

    return {
      isValid: score >= 4 && password.length >= 12,
      score,
      feedback
    };
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Generate a secure CSRF token
   */
  static generateCSRFToken(sessionId: string): string {
    return crypto
      .createHmac('sha256', sessionId)
      .update('csrf-token')
      .digest('hex');
  }

  /**
   * Verify CSRF token
   */
  static verifyCSRFToken(token: string, sessionId: string): boolean {
    const expectedToken = this.generateCSRFToken(sessionId);
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, ip: string): string {
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${userAgent}:${ip}`)
      .digest('hex');
    return fingerprint;
  }

  /**
   * Check if IP address is in private range
   */
  static isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Generate a secure password reset token
   */
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a secure email verification token
   */
  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Constant time string comparison to prevent timing attacks
   */
  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generate a secure nonce for CSP
   */
  static generateNonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Escape HTML to prevent XSS
   */
  static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Validate JWT token format
   */
  static isValidJWTFormat(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Generate a secure API key
   */
  static generateAPIKey(): string {
    const prefix = 'ihosi_';
    const randomPart = crypto.randomBytes(24).toString('base64url');
    return `${prefix}${randomPart}`;
  }

  /**
   * Validate API key format
   */
  static isValidAPIKeyFormat(key: string): boolean {
    const apiKeyRegex = /^ihosi_[A-Za-z0-9_-]{32}$/;
    return apiKeyRegex.test(key);
  }
}


