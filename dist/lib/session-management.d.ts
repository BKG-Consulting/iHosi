export interface SessionConfig {
    timeoutMinutes: number;
    maxFailedAttempts: number;
    lockoutDurationMinutes: number;
    requireMFA: boolean;
    allowConcurrentSessions: boolean;
    maxConcurrentSessions: number;
}
export declare const DEFAULT_SESSION_CONFIG: SessionConfig;
export declare class SessionManager {
    /**
     * Initialize session tracking for authenticated user
     */
    static createSession(userId: string, userRole: string): Promise<string>;
    /**
     * Update session activity timestamp
     */
    static updateActivity(sessionToken: string): Promise<boolean>;
    /**
     * Validate session and check for timeout
     */
    static validateSession(sessionToken: string): Promise<{
        valid: boolean;
        userId?: string;
        timeoutWarning?: boolean;
        minutesUntilTimeout?: number;
    }>;
    /**
     * Terminate specific session
     */
    static terminateSession(sessionToken: string, reason: string): Promise<boolean>;
    /**
     * Terminate all sessions for a user
     */
    static terminateExistingSessions(userId: string, reason: string): Promise<number>;
    /**
     * Handle failed login attempts and account lockout
     */
    static recordLoginAttempt(email: string, userId: string | null, success: boolean, failureReason?: string): Promise<{
        locked: boolean;
        attemptsRemaining?: number;
        unlockAt?: Date;
    }>;
    /**
     * Check if user/IP is currently locked out
     */
    static checkLockout(email: string, userId?: string): Promise<{
        locked: boolean;
        unlockAt?: Date;
        reason?: string;
    }>;
    /**
     * Clean up expired sessions and lockouts
     */
    static cleanupExpired(): Promise<void>;
    private static generateSessionToken;
    private static getActiveSessionCount;
}
/**
 * Middleware helper for session validation
 */
export declare function validateUserSession(): Promise<{
    valid: boolean;
    sessionInfo?: any;
    shouldRedirect?: boolean;
}>;
