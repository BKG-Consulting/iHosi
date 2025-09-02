export declare enum MFARequirement {
    NONE = "NONE",
    OPTIONAL = "OPTIONAL",
    REQUIRED = "REQUIRED",
    ENFORCED = "ENFORCED"
}
export interface MFAConfig {
    roles: Record<string, MFARequirement>;
    gracePeriodDays: number;
    backupCodeCount: number;
    allowedMethods: string[];
}
export declare const HIPAA_MFA_CONFIG: MFAConfig;
export declare class MFAManager {
    /**
     * Check if user needs MFA based on their role
     */
    static checkMFARequirement(userId: string, userRole: string): Promise<{
        required: boolean;
        enforced: boolean;
        gracePeriodEnds?: Date;
        methods: string[];
        hasValidMFA: boolean;
    }>;
    /**
     * Enforce MFA requirements in middleware/auth flow
     */
    static enforceMFARequirements(): Promise<{
        allowed: boolean;
        redirectTo?: string;
        reason?: string;
    }>;
    /**
     * Generate backup codes for user
     */
    static generateBackupCodes(userId: string): Promise<{
        success: boolean;
        codes?: string[];
        error?: string;
    }>;
    /**
     * Validate MFA setup for healthcare staff
     */
    static validateMFASetup(userId: string): Promise<{
        valid: boolean;
        issues: string[];
        recommendations: string[];
    }>;
    /**
     * Monitor and report MFA compliance across the organization
     */
    static generateMFAComplianceReport(): Promise<{
        totalUsers: number;
        mfaEnabled: number;
        complianceByRole: Record<string, {
            total: number;
            compliant: number;
            percentage: number;
        }>;
        nonCompliantUsers: Array<{
            userId: string;
            role: string;
            gracePeriodEnds?: Date;
        }>;
    }>;
    /**
     * Send MFA setup reminders to non-compliant users
     */
    static sendMFAReminders(): Promise<{
        remindersSent: number;
        errors: number;
    }>;
}
