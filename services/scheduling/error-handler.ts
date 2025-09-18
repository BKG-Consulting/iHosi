/**
 * Enterprise-Grade Error Handling System for Scheduling
 * 
 * Provides comprehensive error handling, logging, and recovery mechanisms
 * for the scheduling system with proper categorization and user-friendly messages.
 */

import { ScheduleError } from '@/types/schedule-types';
import { logAudit } from '@/lib/audit';

// Error Categories
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATABASE = 'DATABASE',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  SYSTEM = 'SYSTEM',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT'
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error Context
export interface ErrorContext {
  userId?: string;
  doctorId?: string;
  operation?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

// Comprehensive Error Class
export class ScheduleServiceError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;
  public readonly retryable: boolean;
  public readonly userMessage: string;

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    code: string,
    context: ErrorContext = {},
    originalError?: Error,
    retryable: boolean = false,
    userMessage?: string
  ) {
    super(message);
    this.name = 'ScheduleServiceError';
    this.category = category;
    this.severity = severity;
    this.code = code;
    this.context = context;
    this.originalError = originalError;
    this.retryable = retryable;
    this.userMessage = userMessage || this.getDefaultUserMessage();
  }

  private getDefaultUserMessage(): string {
    switch (this.category) {
      case ErrorCategory.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorCategory.AUTHENTICATION:
        return 'Please log in again to continue.';
      case ErrorCategory.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorCategory.DATABASE:
        return 'A temporary error occurred. Please try again.';
      case ErrorCategory.BUSINESS_LOGIC:
        return 'This action cannot be completed due to business rules.';
      case ErrorCategory.EXTERNAL_SERVICE:
        return 'External service is temporarily unavailable.';
      case ErrorCategory.SYSTEM:
        return 'A system error occurred. Please contact support.';
      case ErrorCategory.NETWORK:
        return 'Network error. Please check your connection.';
      case ErrorCategory.TIMEOUT:
        return 'Request timed out. Please try again.';
      default:
        return 'An unexpected error occurred.';
    }
  }

  public toScheduleError(): ScheduleError {
    return {
      field: this.context.operation || 'general',
      message: this.userMessage,
      code: this.code
    };
  }
}

// Error Handler Class
export class ScheduleErrorHandler {
  private static instance: ScheduleErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  private constructor() {}

  public static getInstance(): ScheduleErrorHandler {
    if (!ScheduleErrorHandler.instance) {
      ScheduleErrorHandler.instance = new ScheduleErrorHandler();
    }
    return ScheduleErrorHandler.instance;
  }

  /**
   * Handle and process errors with comprehensive logging and recovery
   */
  public async handleError(
    error: Error | ScheduleServiceError,
    context: ErrorContext = {}
  ): Promise<ScheduleServiceError> {
    let scheduleError: ScheduleServiceError;

    if (error instanceof ScheduleServiceError) {
      scheduleError = error;
    } else {
      // Convert generic error to ScheduleServiceError
      scheduleError = this.categorizeError(error, context);
    }

    // Log error
    await this.logError(scheduleError);

    // Track error counts
    this.trackError(scheduleError);

    // Check if error should trigger alerts
    await this.checkForAlerts(scheduleError);

    return scheduleError;
  }

  /**
   * Categorize generic errors into ScheduleServiceError
   */
  private categorizeError(error: Error, context: ErrorContext): ScheduleServiceError {
    const message = error.message;
    const stack = error.stack || '';

    // Database errors
    if (message.includes('Unique constraint') || message.includes('duplicate key')) {
      return new ScheduleServiceError(
        message,
        ErrorCategory.DATABASE,
        ErrorSeverity.MEDIUM,
        'DUPLICATE_ENTRY',
        context,
        error,
        false,
        'This record already exists.'
      );
    }

    if (message.includes('Foreign key constraint') || message.includes('referential integrity')) {
      return new ScheduleServiceError(
        message,
        ErrorCategory.DATABASE,
        ErrorSeverity.HIGH,
        'FOREIGN_KEY_VIOLATION',
        context,
        error,
        false,
        'Cannot perform this action due to related data.'
      );
    }

    if (message.includes('Connection') || message.includes('timeout')) {
      return new ScheduleServiceError(
        message,
        ErrorCategory.DATABASE,
        ErrorSeverity.HIGH,
        'CONNECTION_ERROR',
        context,
        error,
        true,
        'Database connection failed. Please try again.'
      );
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return new ScheduleServiceError(
        message,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        'VALIDATION_ERROR',
        context,
        error,
        false,
        'Please check your input and try again.'
      );
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return new ScheduleServiceError(
        message,
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.HIGH,
        'AUTH_ERROR',
        context,
        error,
        false,
        'Please log in again to continue.'
      );
    }

    // Authorization errors
    if (message.includes('forbidden') || message.includes('permission')) {
      return new ScheduleServiceError(
        message,
        ErrorCategory.AUTHORIZATION,
        ErrorSeverity.HIGH,
        'AUTHZ_ERROR',
        context,
        error,
        false,
        'You do not have permission to perform this action.'
      );
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return new ScheduleServiceError(
        message,
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM,
        'NETWORK_ERROR',
        context,
        error,
        true,
        'Network error. Please check your connection.'
      );
    }

    // Default to system error
    return new ScheduleServiceError(
      message,
      ErrorCategory.SYSTEM,
      ErrorSeverity.HIGH,
      'UNKNOWN_ERROR',
      context,
      error,
      false,
      'An unexpected error occurred.'
    );
  }

  /**
   * Log error with comprehensive details
   */
  private async logError(error: ScheduleServiceError): Promise<void> {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        category: error.category,
        severity: error.severity,
        code: error.code,
        stack: error.stack,
        originalError: error.originalError?.message
      },
      context: error.context,
      timestamp: new Date().toISOString(),
      retryable: error.retryable
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Schedule Service Error:', logData);
    }

    // Audit logging for production
    try {
      await logAudit({
        action: 'ERROR',
        resourceType: 'SCHEDULE_SERVICE',
        resourceId: error.context.doctorId || 'unknown',
        reason: `Error in ${error.context.operation || 'unknown operation'}`,
        metadata: logData
      });
    } catch (auditError) {
      console.error('Failed to log audit trail:', auditError);
    }
  }

  /**
   * Track error counts for monitoring
   */
  private trackError(error: ScheduleServiceError): void {
    const key = `${error.category}-${error.code}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
  }

  /**
   * Check if error should trigger alerts
   */
  private async checkForAlerts(error: ScheduleServiceError): Promise<void> {
    // Critical errors should always trigger alerts
    if (error.severity === ErrorSeverity.CRITICAL) {
      await this.sendAlert(error, 'CRITICAL_ERROR');
      return;
    }

    // High severity errors with high frequency should trigger alerts
    const key = `${error.category}-${error.code}`;
    const count = this.errorCounts.get(key) || 0;
    
    if (error.severity === ErrorSeverity.HIGH && count >= 5) {
      await this.sendAlert(error, 'HIGH_FREQUENCY_ERROR');
    }
  }

  /**
   * Send alert notification
   */
  private async sendAlert(error: ScheduleServiceError, alertType: string): Promise<void> {
    // In a real implementation, this would send to monitoring systems
    // like PagerDuty, Slack, or email notifications
    console.warn(`ALERT [${alertType}]:`, {
      error: error.message,
      category: error.category,
      severity: error.severity,
      code: error.code,
      context: error.context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Retry operation with exponential backoff
   */
  public async retryOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext = {},
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const scheduleError = await this.handleError(error as Error, context);

        if (!scheduleError.retryable || attempt === maxRetries) {
          throw scheduleError;
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Clear error statistics
   */
  public clearErrorStats(): void {
    this.errorCounts.clear();
  }
}

// Export singleton instance
export const errorHandler = ScheduleErrorHandler.getInstance();

// Utility functions for common error scenarios
export const createValidationError = (
  field: string,
  message: string,
  context: ErrorContext = {}
): ScheduleServiceError => {
  return new ScheduleServiceError(
    message,
    ErrorCategory.VALIDATION,
    ErrorSeverity.LOW,
    'VALIDATION_ERROR',
    { ...context, operation: field },
    undefined,
    false,
    message
  );
};

export const createDatabaseError = (
  message: string,
  context: ErrorContext = {},
  originalError?: Error
): ScheduleServiceError => {
  return new ScheduleServiceError(
    message,
    ErrorCategory.DATABASE,
    ErrorSeverity.HIGH,
    'DATABASE_ERROR',
    context,
    originalError,
    true,
    'A database error occurred. Please try again.'
  );
};

export const createBusinessLogicError = (
  message: string,
  context: ErrorContext = {}
): ScheduleServiceError => {
  return new ScheduleServiceError(
    message,
    ErrorCategory.BUSINESS_LOGIC,
    ErrorSeverity.MEDIUM,
    'BUSINESS_LOGIC_ERROR',
    context,
    undefined,
    false,
    message
  );
};
