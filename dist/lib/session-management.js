"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = exports.DEFAULT_SESSION_CONFIG = void 0;
exports.validateUserSession = validateUserSession;
const server_1 = require("@clerk/nextjs/server");
const headers_1 = require("next/headers");
const db_1 = __importDefault(require("./db"));
const audit_1 = require("./audit");
exports.DEFAULT_SESSION_CONFIG = {
    timeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30'),
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS || '5'),
    lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15'),
    requireMFA: true,
    allowConcurrentSessions: false,
    maxConcurrentSessions: 1
};
class SessionManager {
    /**
     * Initialize session tracking for authenticated user
     */
    static async createSession(userId, userRole) {
        try {
            const headersList = await (0, headers_1.headers)();
            const userAgent = headersList.get('user-agent') || 'Unknown';
            const forwardedFor = headersList.get('x-forwarded-for');
            const realIp = headersList.get('x-real-ip');
            const ipAddress = forwardedFor?.split(',')[0] || realIp || 'Unknown';
            // Check for existing active sessions if not allowing concurrent sessions
            if (!exports.DEFAULT_SESSION_CONFIG.allowConcurrentSessions) {
                await this.terminateExistingSessions(userId, 'New session created');
            }
            // Check concurrent session limit
            const activeSessions = await this.getActiveSessionCount(userId);
            if (activeSessions >= exports.DEFAULT_SESSION_CONFIG.maxConcurrentSessions) {
                throw new Error('Maximum concurrent sessions exceeded');
            }
            // Create session token
            const sessionToken = this.generateSessionToken();
            const expiresAt = new Date(Date.now() + exports.DEFAULT_SESSION_CONFIG.timeoutMinutes * 60 * 1000);
            // Store session in database
            await db_1.default.userSession.create({
                data: {
                    user_id: userId,
                    session_token: sessionToken,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    expires_at: expiresAt,
                    last_activity: new Date(),
                    is_active: true
                }
            });
            // Log session creation
            await (0, audit_1.logAudit)({
                action: 'LOGIN',
                resourceType: 'AUTH',
                resourceId: sessionToken,
                reason: 'User session created',
                metadata: {
                    userRole,
                    ipAddress,
                    userAgent,
                    sessionDuration: exports.DEFAULT_SESSION_CONFIG.timeoutMinutes
                }
            });
            return sessionToken;
        }
        catch (error) {
            console.error('Session creation failed:', error);
            throw new Error('Failed to create session');
        }
    }
    /**
     * Update session activity timestamp
     */
    static async updateActivity(sessionToken) {
        try {
            const session = await db_1.default.userSession.findUnique({
                where: { session_token: sessionToken }
            });
            if (!session || !session.is_active) {
                return false;
            }
            // Check if session has expired
            if (session.expires_at < new Date()) {
                await this.terminateSession(sessionToken, 'Session expired');
                return false;
            }
            // Update last activity and extend expiration
            const newExpiresAt = new Date(Date.now() + exports.DEFAULT_SESSION_CONFIG.timeoutMinutes * 60 * 1000);
            await db_1.default.userSession.update({
                where: { session_token: sessionToken },
                data: {
                    last_activity: new Date(),
                    expires_at: newExpiresAt
                }
            });
            return true;
        }
        catch (error) {
            console.error('Session activity update failed:', error);
            return false;
        }
    }
    /**
     * Validate session and check for timeout
     */
    static async validateSession(sessionToken) {
        try {
            const session = await db_1.default.userSession.findUnique({
                where: { session_token: sessionToken }
            });
            if (!session || !session.is_active) {
                return { valid: false };
            }
            const now = new Date();
            // Check if session has expired
            if (session.expires_at < now) {
                await this.terminateSession(sessionToken, 'Session expired');
                return { valid: false };
            }
            // Check for timeout warning (5 minutes before expiration)
            const minutesUntilTimeout = Math.floor((session.expires_at.getTime() - now.getTime()) / (1000 * 60));
            const timeoutWarning = minutesUntilTimeout <= 5;
            // Update activity
            await this.updateActivity(sessionToken);
            return {
                valid: true,
                userId: session.user_id,
                timeoutWarning,
                minutesUntilTimeout
            };
        }
        catch (error) {
            console.error('Session validation failed:', error);
            return { valid: false };
        }
    }
    /**
     * Terminate specific session
     */
    static async terminateSession(sessionToken, reason) {
        try {
            const session = await db_1.default.userSession.findUnique({
                where: { session_token: sessionToken }
            });
            if (!session) {
                return false;
            }
            await db_1.default.userSession.update({
                where: { session_token: sessionToken },
                data: {
                    is_active: false,
                    logout_reason: reason
                }
            });
            // Log session termination
            await (0, audit_1.logAudit)({
                action: 'LOGOUT',
                resourceType: 'AUTH',
                resourceId: sessionToken,
                reason: `Session terminated: ${reason}`,
                metadata: {
                    sessionDuration: Date.now() - session.created_at.getTime(),
                    terminationReason: reason
                }
            });
            return true;
        }
        catch (error) {
            console.error('Session termination failed:', error);
            return false;
        }
    }
    /**
     * Terminate all sessions for a user
     */
    static async terminateExistingSessions(userId, reason) {
        try {
            const activeSessions = await db_1.default.userSession.findMany({
                where: {
                    user_id: userId,
                    is_active: true
                }
            });
            await db_1.default.userSession.updateMany({
                where: {
                    user_id: userId,
                    is_active: true
                },
                data: {
                    is_active: false,
                    logout_reason: reason
                }
            });
            // Log mass session termination
            await (0, audit_1.logAudit)({
                action: 'LOGOUT',
                resourceType: 'AUTH',
                resourceId: `bulk_${userId}`,
                reason: `All sessions terminated: ${reason}`,
                metadata: {
                    terminatedSessions: activeSessions.length,
                    terminationReason: reason
                }
            });
            return activeSessions.length;
        }
        catch (error) {
            console.error('Bulk session termination failed:', error);
            return 0;
        }
    }
    /**
     * Handle failed login attempts and account lockout
     */
    static async recordLoginAttempt(email, userId, success, failureReason) {
        try {
            const headersList = await (0, headers_1.headers)();
            const userAgent = headersList.get('user-agent') || 'Unknown';
            const forwardedFor = headersList.get('x-forwarded-for');
            const realIp = headersList.get('x-real-ip');
            const ipAddress = forwardedFor?.split(',')[0] || realIp || 'Unknown';
            // Record the attempt
            await db_1.default.loginAttempt.create({
                data: {
                    email,
                    user_id: userId,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    success,
                    failure_reason: failureReason
                }
            });
            if (success) {
                // Clear any existing lockout
                await db_1.default.userLockout.deleteMany({
                    where: {
                        OR: [
                            { email },
                            { user_id: userId }
                        ]
                    }
                });
                return { locked: false };
            }
            // Check for existing lockout
            const existingLockout = await db_1.default.userLockout.findFirst({
                where: {
                    OR: [
                        { email },
                        { user_id: userId }
                    ],
                    unlock_at: { gt: new Date() }
                }
            });
            if (existingLockout) {
                return {
                    locked: true,
                    unlockAt: existingLockout.unlock_at
                };
            }
            // Count recent failed attempts (last 15 minutes)
            const recentAttempts = await db_1.default.loginAttempt.count({
                where: {
                    OR: [
                        { email },
                        { user_id: userId }
                    ],
                    success: false,
                    attempted_at: {
                        gte: new Date(Date.now() - 15 * 60 * 1000)
                    }
                }
            });
            const attemptsRemaining = exports.DEFAULT_SESSION_CONFIG.maxFailedAttempts - recentAttempts;
            // Check if lockout threshold reached
            if (recentAttempts >= exports.DEFAULT_SESSION_CONFIG.maxFailedAttempts) {
                const unlockAt = new Date(Date.now() + exports.DEFAULT_SESSION_CONFIG.lockoutDurationMinutes * 60 * 1000);
                await db_1.default.userLockout.create({
                    data: {
                        email,
                        user_id: userId,
                        ip_address: ipAddress,
                        unlock_at: unlockAt,
                        reason: 'Too many failed login attempts',
                        failed_attempts: recentAttempts
                    }
                });
                // Log security incident
                await (0, audit_1.logAudit)({
                    action: 'LOGIN',
                    resourceType: 'AUTH',
                    resourceId: email,
                    success: false,
                    errorMessage: 'Account locked due to failed attempts',
                    reason: 'Security lockout triggered',
                    metadata: {
                        failedAttempts: recentAttempts,
                        ipAddress,
                        lockoutDuration: exports.DEFAULT_SESSION_CONFIG.lockoutDurationMinutes
                    }
                });
                return {
                    locked: true,
                    unlockAt
                };
            }
            return {
                locked: false,
                attemptsRemaining
            };
        }
        catch (error) {
            console.error('Login attempt recording failed:', error);
            return { locked: false };
        }
    }
    /**
     * Check if user/IP is currently locked out
     */
    static async checkLockout(email, userId) {
        try {
            const lockout = await db_1.default.userLockout.findFirst({
                where: {
                    OR: [
                        { email },
                        { user_id: userId }
                    ],
                    unlock_at: { gt: new Date() }
                }
            });
            if (lockout) {
                return {
                    locked: true,
                    unlockAt: lockout.unlock_at,
                    reason: lockout.reason
                };
            }
            return { locked: false };
        }
        catch (error) {
            console.error('Lockout check failed:', error);
            return { locked: false };
        }
    }
    /**
     * Clean up expired sessions and lockouts
     */
    static async cleanupExpired() {
        try {
            const now = new Date();
            // Clean up expired sessions
            const expiredSessions = await db_1.default.userSession.updateMany({
                where: {
                    OR: [
                        { expires_at: { lt: now } },
                        { last_activity: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } // 24 hours old
                    ],
                    is_active: true
                },
                data: {
                    is_active: false,
                    logout_reason: 'Session expired'
                }
            });
            // Clean up expired lockouts
            const expiredLockouts = await db_1.default.userLockout.deleteMany({
                where: {
                    unlock_at: { lt: now }
                }
            });
            console.log(`Cleaned up ${expiredSessions.count} expired sessions and ${expiredLockouts.count} expired lockouts`);
        }
        catch (error) {
            console.error('Session cleanup failed:', error);
        }
    }
    // Helper methods
    static generateSessionToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }
    static async getActiveSessionCount(userId) {
        return await db_1.default.userSession.count({
            where: {
                user_id: userId,
                is_active: true,
                expires_at: { gt: new Date() }
            }
        });
    }
}
exports.SessionManager = SessionManager;
/**
 * Middleware helper for session validation
 */
async function validateUserSession() {
    try {
        const { userId } = await (0, server_1.auth)();
        if (!userId) {
            return { valid: false, shouldRedirect: true };
        }
        // For this implementation, we'll rely on Clerk's session management
        // but add our additional tracking
        // Check if user is locked out
        const client = await (0, server_1.clerkClient)();
        const user = await client.users.getUser(userId);
        if (!user.emailAddresses?.[0]?.emailAddress) {
            return { valid: false, shouldRedirect: true };
        }
        const lockoutCheck = await SessionManager.checkLockout(user.emailAddresses[0].emailAddress, userId);
        if (lockoutCheck.locked) {
            return {
                valid: false,
                shouldRedirect: true,
                sessionInfo: {
                    lockout: lockoutCheck
                }
            };
        }
        return { valid: true };
    }
    catch (error) {
        console.error('Session validation failed:', error);
        return { valid: false, shouldRedirect: true };
    }
}
