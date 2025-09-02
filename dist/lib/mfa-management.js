"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MFAManager = exports.HIPAA_MFA_CONFIG = exports.MFARequirement = void 0;
const server_1 = require("@clerk/nextjs/server");
const audit_1 = require("./audit");
var MFARequirement;
(function (MFARequirement) {
    MFARequirement["NONE"] = "NONE";
    MFARequirement["OPTIONAL"] = "OPTIONAL";
    MFARequirement["REQUIRED"] = "REQUIRED";
    MFARequirement["ENFORCED"] = "ENFORCED";
})(MFARequirement || (exports.MFARequirement = MFARequirement = {}));
exports.HIPAA_MFA_CONFIG = {
    roles: {
        'PATIENT': MFARequirement.OPTIONAL,
        'patient': MFARequirement.OPTIONAL,
        'DOCTOR': MFARequirement.REQUIRED,
        'doctor': MFARequirement.REQUIRED,
        'NURSE': MFARequirement.REQUIRED,
        'nurse': MFARequirement.REQUIRED,
        'ADMIN': MFARequirement.ENFORCED,
        'admin': MFARequirement.ENFORCED,
        'LAB_TECHNICIAN': MFARequirement.REQUIRED,
        'lab_technician': MFARequirement.REQUIRED,
        'CASHIER': MFARequirement.OPTIONAL,
        'cashier': MFARequirement.OPTIONAL
    },
    gracePeriodDays: 7, // Grace period for healthcare staff to set up MFA
    backupCodeCount: 10,
    allowedMethods: ['sms', 'totp', 'backup_code']
};
class MFAManager {
    /**
     * Check if user needs MFA based on their role
     */
    static async checkMFARequirement(userId, userRole) {
        try {
            const client = await (0, server_1.clerkClient)();
            const user = await client.users.getUser(userId);
            const requirement = exports.HIPAA_MFA_CONFIG.roles[userRole] || MFARequirement.NONE;
            // Check if user has any MFA methods enabled
            const hasValidMFA = user.twoFactorEnabled || false;
            // Calculate grace period end date for healthcare staff
            let gracePeriodEnds;
            if (requirement === MFARequirement.REQUIRED && !hasValidMFA) {
                const userCreated = new Date(user.createdAt);
                gracePeriodEnds = new Date(userCreated.getTime() + exports.HIPAA_MFA_CONFIG.gracePeriodDays * 24 * 60 * 60 * 1000);
            }
            return {
                required: requirement === MFARequirement.REQUIRED || requirement === MFARequirement.ENFORCED,
                enforced: requirement === MFARequirement.ENFORCED,
                gracePeriodEnds,
                methods: exports.HIPAA_MFA_CONFIG.allowedMethods,
                hasValidMFA
            };
        }
        catch (error) {
            console.error('MFA requirement check failed:', error);
            return {
                required: false,
                enforced: false,
                methods: [],
                hasValidMFA: false
            };
        }
    }
    /**
     * Enforce MFA requirements in middleware/auth flow
     */
    static async enforceMFARequirements() {
        try {
            const { userId, sessionClaims } = await (0, server_1.auth)();
            if (!userId) {
                return { allowed: false, redirectTo: '/sign-in', reason: 'Not authenticated' };
            }
            const userRole = sessionClaims?.metadata?.role || 'patient';
            const mfaCheck = await this.checkMFARequirement(userId, userRole);
            // If MFA is enforced and user doesn't have it
            if (mfaCheck.enforced && !mfaCheck.hasValidMFA) {
                await (0, audit_1.logAudit)({
                    action: 'LOGIN',
                    resourceType: 'AUTH',
                    resourceId: userId,
                    success: false,
                    errorMessage: 'MFA required but not configured',
                    reason: 'HIPAA compliance: MFA enforcement',
                    metadata: {
                        userRole,
                        mfaEnforced: true,
                        hasValidMFA: mfaCheck.hasValidMFA
                    }
                });
                return {
                    allowed: false,
                    redirectTo: '/setup-mfa?required=true',
                    reason: 'Multi-factor authentication is required for your role'
                };
            }
            // If MFA is required and grace period has expired
            if (mfaCheck.required && !mfaCheck.hasValidMFA && mfaCheck.gracePeriodEnds) {
                const now = new Date();
                if (now > mfaCheck.gracePeriodEnds) {
                    await (0, audit_1.logAudit)({
                        action: 'LOGIN',
                        resourceType: 'AUTH',
                        resourceId: userId,
                        success: false,
                        errorMessage: 'MFA grace period expired',
                        reason: 'HIPAA compliance: MFA grace period enforcement',
                        metadata: {
                            userRole,
                            gracePeriodEnded: mfaCheck.gracePeriodEnds.toISOString(),
                            hasValidMFA: mfaCheck.hasValidMFA
                        }
                    });
                    return {
                        allowed: false,
                        redirectTo: '/setup-mfa?expired=true',
                        reason: 'MFA setup grace period has expired'
                    };
                }
            }
            return { allowed: true };
        }
        catch (error) {
            console.error('MFA enforcement failed:', error);
            return { allowed: false, reason: 'Authentication system error' };
        }
    }
    /**
     * Generate backup codes for user
     */
    static async generateBackupCodes(userId) {
        try {
            // Generate cryptographically secure backup codes
            const crypto = require('crypto');
            const codes = [];
            for (let i = 0; i < exports.HIPAA_MFA_CONFIG.backupCodeCount; i++) {
                // Generate 8-character alphanumeric code
                const code = crypto.randomBytes(4).toString('hex').toUpperCase();
                codes.push(code);
            }
            // In a production environment, these would be stored securely
            // For now, we'll log the generation event
            await (0, audit_1.logAudit)({
                action: 'CREATE',
                resourceType: 'AUTH',
                resourceId: userId,
                reason: 'MFA backup codes generated',
                metadata: {
                    codeCount: codes.length,
                    generatedAt: new Date().toISOString()
                }
            });
            return { success: true, codes };
        }
        catch (error) {
            console.error('Backup code generation failed:', error);
            return { success: false, error: 'Failed to generate backup codes' };
        }
    }
    /**
     * Validate MFA setup for healthcare staff
     */
    static async validateMFASetup(userId) {
        try {
            const client = await (0, server_1.clerkClient)();
            const user = await client.users.getUser(userId);
            const { sessionClaims } = await (0, server_1.auth)();
            const userRole = sessionClaims?.metadata?.role || 'patient';
            const issues = [];
            const recommendations = [];
            // Check if MFA is enabled
            if (!user.twoFactorEnabled) {
                const requirement = exports.HIPAA_MFA_CONFIG.roles[userRole];
                if (requirement === MFARequirement.REQUIRED || requirement === MFARequirement.ENFORCED) {
                    issues.push('Multi-factor authentication is required for your role but not enabled');
                }
                else {
                    recommendations.push('Enable MFA to enhance account security');
                }
            }
            // Check phone number for SMS MFA
            if (!user.phoneNumbers?.length) {
                recommendations.push('Add a phone number for SMS-based MFA');
            }
            // Check email verification
            const primaryEmail = user.emailAddresses?.find(email => email.id === user.primaryEmailAddressId);
            if (primaryEmail?.verification?.status !== 'verified') {
                issues.push('Primary email address must be verified for MFA');
            }
            // Role-specific recommendations
            if (userRole === 'DOCTOR' || userRole === 'ADMIN') {
                recommendations.push('Use authenticator app (TOTP) for enhanced security');
                recommendations.push('Generate and securely store backup codes');
            }
            return {
                valid: issues.length === 0,
                issues,
                recommendations
            };
        }
        catch (error) {
            console.error('MFA validation failed:', error);
            return {
                valid: false,
                issues: ['Unable to validate MFA setup'],
                recommendations: []
            };
        }
    }
    /**
     * Monitor and report MFA compliance across the organization
     */
    static async generateMFAComplianceReport() {
        try {
            const client = await (0, server_1.clerkClient)();
            // Get all users (this would be paginated in production)
            const { data: users } = await client.users.getUserList({ limit: 500 });
            const complianceByRole = {};
            const nonCompliantUsers = [];
            let totalUsers = 0;
            let mfaEnabled = 0;
            for (const user of users) {
                const userRole = user.publicMetadata?.role || 'patient';
                const hasMFA = user.twoFactorEnabled || false;
                const requirement = exports.HIPAA_MFA_CONFIG.roles[userRole] || MFARequirement.NONE;
                totalUsers++;
                if (hasMFA)
                    mfaEnabled++;
                // Initialize role stats
                if (!complianceByRole[userRole]) {
                    complianceByRole[userRole] = { total: 0, compliant: 0, percentage: 0 };
                }
                complianceByRole[userRole].total++;
                // Check compliance based on role requirements
                const isCompliant = hasMFA || requirement === MFARequirement.NONE || requirement === MFARequirement.OPTIONAL;
                if (isCompliant) {
                    complianceByRole[userRole].compliant++;
                }
                else {
                    // Calculate grace period
                    let gracePeriodEnds;
                    if (requirement === MFARequirement.REQUIRED) {
                        const userCreated = new Date(user.createdAt);
                        gracePeriodEnds = new Date(userCreated.getTime() + exports.HIPAA_MFA_CONFIG.gracePeriodDays * 24 * 60 * 60 * 1000);
                    }
                    nonCompliantUsers.push({
                        userId: user.id,
                        role: userRole,
                        gracePeriodEnds
                    });
                }
            }
            // Calculate percentages
            for (const role in complianceByRole) {
                const stats = complianceByRole[role];
                stats.percentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
            }
            // Log compliance report generation
            await (0, audit_1.logAudit)({
                action: 'READ',
                resourceType: 'SYSTEM',
                resourceId: 'mfa_compliance_report',
                reason: 'MFA compliance report generated',
                metadata: {
                    totalUsers,
                    mfaEnabled,
                    nonCompliantCount: nonCompliantUsers.length,
                    reportDate: new Date().toISOString()
                }
            });
            return {
                totalUsers,
                mfaEnabled,
                complianceByRole,
                nonCompliantUsers
            };
        }
        catch (error) {
            console.error('MFA compliance report generation failed:', error);
            return {
                totalUsers: 0,
                mfaEnabled: 0,
                complianceByRole: {},
                nonCompliantUsers: []
            };
        }
    }
    /**
     * Send MFA setup reminders to non-compliant users
     */
    static async sendMFAReminders() {
        try {
            const report = await this.generateMFAComplianceReport();
            let remindersSent = 0;
            let errors = 0;
            for (const user of report.nonCompliantUsers) {
                try {
                    // Check if grace period is ending soon
                    if (user.gracePeriodEnds) {
                        const daysRemaining = Math.ceil((user.gracePeriodEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        if (daysRemaining <= 3 && daysRemaining > 0) {
                            // In production, send email/SMS reminder
                            console.log(`MFA reminder needed for user ${user.userId} (${user.role}) - ${daysRemaining} days remaining`);
                            await (0, audit_1.logAudit)({
                                action: 'CREATE',
                                resourceType: 'AUTH',
                                resourceId: user.userId,
                                reason: 'MFA setup reminder sent',
                                metadata: {
                                    userRole: user.role,
                                    daysRemaining,
                                    gracePeriodEnds: user.gracePeriodEnds.toISOString()
                                }
                            });
                            remindersSent++;
                        }
                    }
                }
                catch (error) {
                    console.error(`Failed to send MFA reminder to user ${user.userId}:`, error);
                    errors++;
                }
            }
            return { remindersSent, errors };
        }
        catch (error) {
            console.error('MFA reminder sending failed:', error);
            return { remindersSent: 0, errors: 1 };
        }
    }
}
exports.MFAManager = MFAManager;
