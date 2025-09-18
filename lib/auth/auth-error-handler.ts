/**
 * Comprehensive Authentication Error Handling System
 * Provides user-friendly error messages and proper error categorization
 */

export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  retryable: boolean;
}

export class AuthErrorHandler {
  private static errorMap: Map<string, AuthError> = new Map([
    // Authentication Errors
    ['INVALID_CREDENTIALS', {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      userMessage: 'The email or password you entered is incorrect. Please check your credentials and try again.',
      severity: 'medium',
      action: 'Please verify your email and password, or reset your password if needed.',
      retryable: true
    }],
    
    ['USER_NOT_FOUND', {
      code: 'USER_NOT_FOUND',
      message: 'User account not found',
      userMessage: 'No account found with this email address. Please check your email or create a new account.',
      severity: 'medium',
      action: 'Please verify your email address or contact support if you believe this is an error.',
      retryable: false
    }],
    
    ['ACCOUNT_LOCKED', {
      code: 'ACCOUNT_LOCKED',
      message: 'Account is temporarily locked',
      userMessage: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.',
      severity: 'high',
      action: 'Please wait 15 minutes before trying again, or contact support for immediate assistance.',
      retryable: true
    }],
    
    ['ACCOUNT_INACTIVE', {
      code: 'ACCOUNT_INACTIVE',
      message: 'Account is inactive',
      userMessage: 'Your account is currently inactive. Please contact your administrator to reactivate your account.',
      severity: 'high',
      action: 'Contact your system administrator or support team to reactivate your account.',
      retryable: false
    }],
    
    ['MFA_REQUIRED', {
      code: 'MFA_REQUIRED',
      message: 'Multi-factor authentication required',
      userMessage: 'Please complete multi-factor authentication to continue.',
      severity: 'low',
      action: 'Enter the verification code from your authenticator app.',
      retryable: true
    }],
    
    ['MFA_FAILED', {
      code: 'MFA_FAILED',
      message: 'MFA verification failed',
      userMessage: 'The verification code you entered is incorrect. Please try again.',
      severity: 'medium',
      action: 'Please check your authenticator app and enter the correct code.',
      retryable: true
    }],
    
    // Rate Limiting Errors
    ['RATE_LIMIT_EXCEEDED', {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts',
      userMessage: 'Too many login attempts. Please wait a few minutes before trying again.',
      severity: 'medium',
      action: 'Please wait 5-10 minutes before attempting to log in again.',
      retryable: true
    }],
    
    // Network and System Errors
    ['NETWORK_ERROR', {
      code: 'NETWORK_ERROR',
      message: 'Network connection error',
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      severity: 'medium',
      action: 'Check your internet connection and try again. If the problem persists, contact support.',
      retryable: true
    }],
    
    ['SERVER_ERROR', {
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      userMessage: 'A temporary server error occurred. Please try again in a few moments.',
      severity: 'high',
      action: 'Please try again in a few minutes. If the problem persists, contact support.',
      retryable: true
    }],
    
    ['DATABASE_ERROR', {
      code: 'DATABASE_ERROR',
      message: 'Database connection error',
      userMessage: 'Unable to access user data. Please try again or contact support if the problem persists.',
      severity: 'critical',
      action: 'Please try again in a few minutes. If the problem persists, contact support immediately.',
      retryable: true
    }],
    
    // Security Errors
    ['CSRF_TOKEN_MISSING', {
      code: 'CSRF_TOKEN_MISSING',
      message: 'Security token missing',
      userMessage: 'Security verification failed. Please refresh the page and try again.',
      severity: 'medium',
      action: 'Please refresh the page and try logging in again.',
      retryable: true
    }],
    
    ['SESSION_EXPIRED', {
      code: 'SESSION_EXPIRED',
      message: 'Session has expired',
      userMessage: 'Your session has expired. Please log in again to continue.',
      severity: 'low',
      action: 'Please log in again to continue.',
      retryable: true
    }],
    
    // Validation Errors
    ['INVALID_EMAIL_FORMAT', {
      code: 'INVALID_EMAIL_FORMAT',
      message: 'Invalid email format',
      userMessage: 'Please enter a valid email address.',
      severity: 'low',
      action: 'Please check your email format and try again.',
      retryable: true
    }],
    
    ['PASSWORD_TOO_SHORT', {
      code: 'PASSWORD_TOO_SHORT',
      message: 'Password too short',
      userMessage: 'Password must be at least 8 characters long.',
      severity: 'low',
      action: 'Please enter a password with at least 8 characters.',
      retryable: true
    }],
    
    ['MISSING_CREDENTIALS', {
      code: 'MISSING_CREDENTIALS',
      message: 'Email and password are required',
      userMessage: 'Please enter both your email and password.',
      severity: 'low',
      action: 'Please fill in all required fields.',
      retryable: true
    }]
  ]);

  /**
   * Parse error from various sources and return standardized AuthError
   */
  static parseError(error: any): AuthError {
    // Handle string errors
    if (typeof error === 'string') {
      const mappedError = this.errorMap.get(error);
      if (mappedError) return mappedError;
      
      // Try to extract error code from string
      const errorCode = this.extractErrorCode(error);
      if (errorCode) {
        const mappedError = this.errorMap.get(errorCode);
        if (mappedError) return mappedError;
      }
      
      // Default for unknown string errors
      return {
        code: 'UNKNOWN_ERROR',
        message: error,
        userMessage: 'An unexpected error occurred. Please try again.',
        severity: 'medium',
        action: 'Please try again or contact support if the problem persists.',
        retryable: true
      };
    }

    // Handle Error objects
    if (error instanceof Error) {
      const errorCode = this.extractErrorCode(error.message);
      if (errorCode) {
        const mappedError = this.errorMap.get(errorCode);
        if (mappedError) return mappedError;
      }

      // Handle specific error types
      if (error.message.includes('fetch')) {
        return this.errorMap.get('NETWORK_ERROR')!;
      }
      
      if (error.message.includes('database') || error.message.includes('prisma')) {
        return this.errorMap.get('DATABASE_ERROR')!;
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        userMessage: 'An unexpected error occurred. Please try again.',
        severity: 'medium',
        action: 'Please try again or contact support if the problem persists.',
        retryable: true
      };
    }

    // Handle API response errors
    if (error && typeof error === 'object') {
      if (error.error) {
        const mappedError = this.errorMap.get(error.error);
        if (mappedError) return mappedError;
      }
      
      if (error.message) {
        const errorCode = this.extractErrorCode(error.message);
        if (errorCode) {
          const mappedError = this.errorMap.get(errorCode);
          if (mappedError) return mappedError;
        }
      }
    }

    // Default fallback
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      userMessage: 'An unexpected error occurred. Please try again.',
      severity: 'medium',
      action: 'Please try again or contact support if the problem persists.',
      retryable: true
    };
  }

  /**
   * Extract error code from error message
   */
  private static extractErrorCode(message: string): string | null {
    const patterns = [
      /Invalid credentials/i,
      /User not found/i,
      /Account locked/i,
      /Account inactive/i,
      /MFA required/i,
      /MFA failed/i,
      /Rate limit/i,
      /Network error/i,
      /Server error/i,
      /Database error/i,
      /CSRF token/i,
      /Session expired/i,
      /Invalid email/i,
      /Password too short/i,
      /Missing credentials/i
    ];

    const codes = [
      'INVALID_CREDENTIALS',
      'USER_NOT_FOUND',
      'ACCOUNT_LOCKED',
      'ACCOUNT_INACTIVE',
      'MFA_REQUIRED',
      'MFA_FAILED',
      'RATE_LIMIT_EXCEEDED',
      'NETWORK_ERROR',
      'SERVER_ERROR',
      'DATABASE_ERROR',
      'CSRF_TOKEN_MISSING',
      'SESSION_EXPIRED',
      'INVALID_EMAIL_FORMAT',
      'PASSWORD_TOO_SHORT',
      'MISSING_CREDENTIALS'
    ];

    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].test(message)) {
        return codes[i];
      }
    }

    return null;
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: any): string {
    const authError = this.parseError(error);
    return authError.userMessage;
  }

  /**
   * Get suggested action for error
   */
  static getSuggestedAction(error: any): string | undefined {
    const authError = this.parseError(error);
    return authError.action;
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: any): boolean {
    const authError = this.parseError(error);
    return authError.retryable;
  }

  /**
   * Get error severity
   */
  static getSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    const authError = this.parseError(error);
    return authError.severity;
  }

  /**
   * Get error code
   */
  static getErrorCode(error: any): string {
    const authError = this.parseError(error);
    return authError.code;
  }

  /**
   * Check if error requires immediate attention
   */
  static requiresImmediateAttention(error: any): boolean {
    const severity = this.getSeverity(error);
    return severity === 'critical' || severity === 'high';
  }

  /**
   * Get all available error codes
   */
  static getAllErrorCodes(): string[] {
    return Array.from(this.errorMap.keys());
  }

  /**
   * Add custom error mapping
   */
  static addErrorMapping(code: string, error: AuthError): void {
    this.errorMap.set(code, error);
  }
}

