export declare enum ConsentType {
    HIPAA_PRIVACY = "HIPAA_PRIVACY",
    TREATMENT = "TREATMENT",
    PAYMENT = "PAYMENT",
    OPERATIONS = "OPERATIONS",
    MARKETING = "MARKETING",
    RESEARCH = "RESEARCH",
    DIRECTORY_LISTING = "DIRECTORY_LISTING",
    EMERGENCY_CONTACT = "EMERGENCY_CONTACT",
    TELEMEDICINE = "TELEMEDICINE",
    DATA_SHARING = "DATA_SHARING"
}
export declare enum ConsentStatus {
    GRANTED = "GRANTED",
    DENIED = "DENIED",
    REVOKED = "REVOKED",
    EXPIRED = "EXPIRED",
    PENDING = "PENDING"
}
export interface ConsentRecord {
    id: string;
    patientId: string;
    consentType: ConsentType;
    status: ConsentStatus;
    consentText: string;
    version: string;
    grantedAt?: Date;
    revokedAt?: Date;
    expiresAt?: Date;
    grantedBy: string;
    ipAddress: string;
    userAgent: string;
    digitalSignature?: string;
    witnessId?: string;
    legalBasis: string;
    purposeOfUse: string[];
    dataCategories: string[];
    restrictions: string[];
    metadata: Record<string, any>;
}
export declare class ConsentManager {
    static grantConsent(params: {
        patientId: string;
        consentType: ConsentType;
        consentText: string;
        version: string;
        legalBasis: string;
        purposeOfUse: string[];
        dataCategories: string[];
        restrictions?: string[];
        expirationDays?: number;
        witnessId?: string;
    }): Promise<{
        success: boolean;
        consentId?: string;
        error?: string;
    }>;
    static revokeConsent(params: {
        patientId: string;
        consentType: ConsentType;
        reason: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    static checkConsent(patientId: string, consentType: ConsentType): Promise<{
        hasConsent: boolean;
        consent?: any;
        restrictions?: string[];
    }>;
    static getConsentHistory(patientId: string): Promise<ConsentRecord[]>;
    static validateDataAccess(patientId: string, dataCategory: string, purposeOfUse: string): Promise<{
        allowed: boolean;
        restrictions?: string[];
        reason?: string;
    }>;
    private static createDigitalSignature;
    private static isAuthorizedRepresentative;
    private static getClientIP;
    private static getUserAgent;
}
