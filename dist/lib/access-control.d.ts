export declare enum AccessLevel {
    NONE = "NONE",
    READ = "READ",
    WRITE = "WRITE",
    FULL = "FULL"
}
export declare enum DataCategory {
    DEMOGRAPHICS = "DEMOGRAPHICS",
    CONTACT_INFO = "CONTACT_INFO",
    MEDICAL_HISTORY = "MEDICAL_HISTORY",
    DIAGNOSIS = "DIAGNOSIS",
    TREATMENT_PLAN = "TREATMENT_PLAN",
    PRESCRIPTIONS = "PRESCRIPTIONS",
    LAB_RESULTS = "LAB_RESULTS",
    VITAL_SIGNS = "VITAL_SIGNS",
    BILLING_INFO = "BILLING_INFO",
    INSURANCE_INFO = "INSURANCE_INFO",
    EMERGENCY_CONTACTS = "EMERGENCY_CONTACTS"
}
export interface AccessControlContext {
    userId: string;
    userRole: string;
    patientId: string;
    dataCategory: DataCategory;
    operation: 'READ' | 'WRITE' | 'DELETE';
    businessJustification?: string;
    emergencyOverride?: boolean;
}
export declare class HIPAAAccessControl {
    /**
     * Main access control gate - checks if user can access patient data
     */
    static checkAccess(context: AccessControlContext): Promise<{
        allowed: boolean;
        accessLevel: AccessLevel;
        restrictions: string[];
        reason: string;
        auditRequired: boolean;
    }>;
    /**
     * Check role-based permissions
     */
    private static checkRolePermissions;
    /**
     * Check patient-specific access (doctor assignments, etc.)
     */
    private static checkPatientAccess;
    /**
     * Check consent requirements for data access
     */
    private static checkConsentRequirements;
    /**
     * Apply minimum necessary principle
     */
    private static checkMinimumNecessary;
    /**
     * Handle emergency (break-glass) access
     */
    private static handleEmergencyAccess;
    private static isPatientAssignedToDoctor;
    private static isPatientInNurseUnit;
    private static hasActiveLabOrders;
    private static getRoleAccessLevel;
    private static getAccessLevel;
    private static getDataRestrictions;
}
/**
 * Utility function to check access before data operations
 */
export declare function enforceAccess(patientId: string, dataCategory: DataCategory, operation: 'READ' | 'WRITE' | 'DELETE', businessJustification?: string): Promise<boolean>;
