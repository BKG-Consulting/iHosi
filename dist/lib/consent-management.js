"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentManager = exports.ConsentStatus = exports.ConsentType = void 0;
const server_1 = require("@clerk/nextjs/server");
const db_1 = __importDefault(require("./db"));
const audit_1 = require("./audit");
var ConsentType;
(function (ConsentType) {
    ConsentType["HIPAA_PRIVACY"] = "HIPAA_PRIVACY";
    ConsentType["TREATMENT"] = "TREATMENT";
    ConsentType["PAYMENT"] = "PAYMENT";
    ConsentType["OPERATIONS"] = "OPERATIONS";
    ConsentType["MARKETING"] = "MARKETING";
    ConsentType["RESEARCH"] = "RESEARCH";
    ConsentType["DIRECTORY_LISTING"] = "DIRECTORY_LISTING";
    ConsentType["EMERGENCY_CONTACT"] = "EMERGENCY_CONTACT";
    ConsentType["TELEMEDICINE"] = "TELEMEDICINE";
    ConsentType["DATA_SHARING"] = "DATA_SHARING";
})(ConsentType || (exports.ConsentType = ConsentType = {}));
var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus["GRANTED"] = "GRANTED";
    ConsentStatus["DENIED"] = "DENIED";
    ConsentStatus["REVOKED"] = "REVOKED";
    ConsentStatus["EXPIRED"] = "EXPIRED";
    ConsentStatus["PENDING"] = "PENDING";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
class ConsentManager {
    static async grantConsent(params) {
        try {
            const { userId } = await (0, server_1.auth)();
            if (!userId) {
                return { success: false, error: 'User not authenticated' };
            }
            // Get request details for audit trail
            const ipAddress = await this.getClientIP();
            const userAgent = await this.getUserAgent();
            // Check if consent already exists and is active
            const existingConsent = await db_1.default.patientConsent.findFirst({
                where: {
                    patient_id: params.patientId,
                    consent_type: params.consentType,
                    status: ConsentStatus.GRANTED,
                    OR: [
                        { expires_at: null },
                        { expires_at: { gt: new Date() } }
                    ]
                }
            });
            if (existingConsent) {
                return { success: false, error: 'Active consent already exists' };
            }
            // Calculate expiration date
            const expiresAt = params.expirationDays
                ? new Date(Date.now() + params.expirationDays * 24 * 60 * 60 * 1000)
                : null;
            // Create digital signature
            const digitalSignature = await this.createDigitalSignature({
                patientId: params.patientId,
                consentType: params.consentType,
                timestamp: new Date(),
                userId
            });
            // Store consent record
            const consent = await db_1.default.patientConsent.create({
                data: {
                    patient_id: params.patientId,
                    consent_type: params.consentType,
                    status: ConsentStatus.GRANTED,
                    consent_text: params.consentText,
                    version: params.version,
                    granted_at: new Date(),
                    expires_at: expiresAt,
                    granted_by: userId,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    digital_signature: digitalSignature,
                    witness_id: params.witnessId,
                    legal_basis: params.legalBasis,
                    purpose_of_use: JSON.stringify(params.purposeOfUse),
                    data_categories: JSON.stringify(params.dataCategories),
                    restrictions: JSON.stringify(params.restrictions || []),
                    metadata: JSON.stringify({
                        consentMethod: 'digital_form',
                        timestamp: new Date().toISOString()
                    })
                }
            });
            // Audit log
            await (0, audit_1.logAudit)({
                action: 'CREATE',
                resourceType: 'PATIENT',
                resourceId: consent.id.toString(),
                patientId: params.patientId,
                reason: 'Patient consent granted',
                phiAccessed: ['consent_records'],
                metadata: {
                    consentType: params.consentType,
                    legalBasis: params.legalBasis,
                    digitalSignature
                }
            });
            return { success: true, consentId: consent.id.toString() };
        }
        catch (error) {
            console.error('Consent grant failed:', error);
            return { success: false, error: 'Failed to grant consent' };
        }
    }
    static async revokeConsent(params) {
        try {
            const { userId } = await (0, server_1.auth)();
            if (!userId) {
                return { success: false, error: 'User not authenticated' };
            }
            // Only patient or authorized representative can revoke
            if (userId !== params.patientId) {
                // Check if user is authorized representative
                const isAuthorized = await this.isAuthorizedRepresentative(userId, params.patientId);
                if (!isAuthorized) {
                    return { success: false, error: 'Not authorized to revoke consent' };
                }
            }
            // Find active consent
            const activeConsent = await db_1.default.patientConsent.findFirst({
                where: {
                    patient_id: params.patientId,
                    consent_type: params.consentType,
                    status: ConsentStatus.GRANTED
                }
            });
            if (!activeConsent) {
                return { success: false, error: 'No active consent found' };
            }
            // Update consent to revoked
            await db_1.default.patientConsent.update({
                where: { id: activeConsent.id },
                data: {
                    status: ConsentStatus.REVOKED,
                    revoked_at: new Date(),
                    metadata: JSON.stringify({
                        ...JSON.parse(activeConsent.metadata || '{}'),
                        revocationReason: params.reason,
                        revokedBy: userId,
                        revokedAt: new Date().toISOString()
                    })
                }
            });
            // Audit log
            await (0, audit_1.logAudit)({
                action: 'UPDATE',
                resourceType: 'PATIENT',
                resourceId: activeConsent.id.toString(),
                patientId: params.patientId,
                reason: `Consent revoked: ${params.reason}`,
                phiAccessed: ['consent_records'],
                metadata: {
                    consentType: params.consentType,
                    revocationReason: params.reason
                }
            });
            return { success: true };
        }
        catch (error) {
            console.error('Consent revocation failed:', error);
            return { success: false, error: 'Failed to revoke consent' };
        }
    }
    static async checkConsent(patientId, consentType) {
        try {
            const consent = await db_1.default.patientConsent.findFirst({
                where: {
                    patient_id: patientId,
                    consent_type: consentType,
                    status: ConsentStatus.GRANTED,
                    OR: [
                        { expires_at: null },
                        { expires_at: { gt: new Date() } }
                    ]
                },
                orderBy: { granted_at: 'desc' }
            });
            if (!consent) {
                return { hasConsent: false };
            }
            const restrictions = JSON.parse(consent.restrictions || '[]');
            return {
                hasConsent: true,
                consent,
                restrictions
            };
        }
        catch (error) {
            console.error('Consent check failed:', error);
            return { hasConsent: false };
        }
    }
    static async getConsentHistory(patientId) {
        try {
            const consents = await db_1.default.patientConsent.findMany({
                where: { patient_id: patientId },
                orderBy: { granted_at: 'desc' }
            });
            // Audit log for consent history access
            await (0, audit_1.logAudit)({
                action: 'READ',
                resourceType: 'PATIENT',
                resourceId: 'consent_history',
                patientId,
                reason: 'Consent history review',
                phiAccessed: ['consent_records']
            });
            return consents.map(consent => ({
                id: consent.id.toString(),
                patientId: consent.patient_id,
                consentType: consent.consent_type,
                status: consent.status,
                consentText: consent.consent_text,
                version: consent.version,
                grantedAt: consent.granted_at || undefined,
                revokedAt: consent.revoked_at || undefined,
                expiresAt: consent.expires_at || undefined,
                grantedBy: consent.granted_by,
                ipAddress: consent.ip_address,
                userAgent: consent.user_agent,
                digitalSignature: consent.digital_signature || undefined,
                witnessId: consent.witness_id || undefined,
                legalBasis: consent.legal_basis,
                purposeOfUse: JSON.parse(consent.purpose_of_use || '[]'),
                dataCategories: JSON.parse(consent.data_categories || '[]'),
                restrictions: JSON.parse(consent.restrictions || '[]'),
                metadata: JSON.parse(consent.metadata || '{}')
            }));
        }
        catch (error) {
            console.error('Consent history retrieval failed:', error);
            return [];
        }
    }
    static async validateDataAccess(patientId, dataCategory, purposeOfUse) {
        try {
            // Check HIPAA privacy consent
            const privacyConsent = await this.checkConsent(patientId, ConsentType.HIPAA_PRIVACY);
            if (!privacyConsent.hasConsent) {
                return {
                    allowed: false,
                    reason: 'No valid HIPAA privacy consent on file'
                };
            }
            // Check specific consent for data category and purpose
            const specificConsent = await db_1.default.patientConsent.findFirst({
                where: {
                    patient_id: patientId,
                    status: ConsentStatus.GRANTED,
                    OR: [
                        { expires_at: null },
                        { expires_at: { gt: new Date() } }
                    ]
                }
            });
            if (specificConsent) {
                const dataCategories = JSON.parse(specificConsent.data_categories || '[]');
                const purposesOfUse = JSON.parse(specificConsent.purpose_of_use || '[]');
                const restrictions = JSON.parse(specificConsent.restrictions || '[]');
                if (!dataCategories.includes(dataCategory)) {
                    return {
                        allowed: false,
                        reason: `No consent for data category: ${dataCategory}`
                    };
                }
                if (!purposesOfUse.includes(purposeOfUse)) {
                    return {
                        allowed: false,
                        reason: `No consent for purpose: ${purposeOfUse}`
                    };
                }
                return {
                    allowed: true,
                    restrictions
                };
            }
            return { allowed: true };
        }
        catch (error) {
            console.error('Data access validation failed:', error);
            return {
                allowed: false,
                reason: 'Failed to validate consent'
            };
        }
    }
    static async createDigitalSignature(params) {
        const crypto = require('crypto');
        const data = `${params.patientId}:${params.consentType}:${params.timestamp.toISOString()}:${params.userId}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    static async isAuthorizedRepresentative(userId, patientId) {
        // Check if user is authorized representative (legal guardian, power of attorney, etc.)
        // This would be implemented based on your business logic
        return false;
    }
    static async getClientIP() {
        // This would be implemented to get actual client IP
        return 'unknown';
    }
    static async getUserAgent() {
        // This would be implemented to get actual user agent
        return 'unknown';
    }
}
exports.ConsentManager = ConsentManager;
