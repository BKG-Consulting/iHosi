import { auth } from "@clerk/nextjs/server";
import db from "./db";
import { logAudit } from "./audit";

export enum ConsentType {
  HIPAA_PRIVACY = 'HIPAA_PRIVACY',
  TREATMENT = 'TREATMENT',
  PAYMENT = 'PAYMENT',
  OPERATIONS = 'OPERATIONS',
  MARKETING = 'MARKETING',
  RESEARCH = 'RESEARCH',
  DIRECTORY_LISTING = 'DIRECTORY_LISTING',
  EMERGENCY_CONTACT = 'EMERGENCY_CONTACT',
  TELEMEDICINE = 'TELEMEDICINE',
  DATA_SHARING = 'DATA_SHARING'
}

export enum ConsentStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING'
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
  grantedBy: string; // User ID who granted consent
  ipAddress: string;
  userAgent: string;
  digitalSignature?: string;
  witnessId?: string; // For minors or incompetent patients
  legalBasis: string;
  purposeOfUse: string[];
  dataCategories: string[];
  restrictions: string[];
  metadata: Record<string, any>;
}

export class ConsentManager {
  
  static async grantConsent(params: {
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
  }): Promise<{ success: boolean; consentId?: string; error?: string }> {
    
    try {
      const { userId } = await auth();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get request details for audit trail
      const ipAddress = await this.getClientIP();
      const userAgent = await this.getUserAgent();

      // Check if consent already exists and is active
      const existingConsent = await db.patientConsent.findFirst({
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
      const consent = await db.patientConsent.create({
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
      await logAudit({
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

    } catch (error) {
      console.error('Consent grant failed:', error);
      return { success: false, error: 'Failed to grant consent' };
    }
  }

  static async revokeConsent(params: {
    patientId: string;
    consentType: ConsentType;
    reason: string;
  }): Promise<{ success: boolean; error?: string }> {
    
    try {
      const { userId } = await auth();
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
      const activeConsent = await db.patientConsent.findFirst({
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
      await db.patientConsent.update({
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
      await logAudit({
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

    } catch (error) {
      console.error('Consent revocation failed:', error);
      return { success: false, error: 'Failed to revoke consent' };
    }
  }

  static async checkConsent(
    patientId: string, 
    consentType: ConsentType
  ): Promise<{ hasConsent: boolean; consent?: any; restrictions?: string[] }> {
    
    try {
      const consent = await db.patientConsent.findFirst({
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

    } catch (error) {
      console.error('Consent check failed:', error);
      return { hasConsent: false };
    }
  }

  static async getConsentHistory(patientId: string): Promise<ConsentRecord[]> {
    try {
      const consents = await db.patientConsent.findMany({
        where: { patient_id: patientId },
        orderBy: { granted_at: 'desc' }
      });

      // Audit log for consent history access
      await logAudit({
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
        consentType: consent.consent_type as ConsentType,
        status: consent.status as ConsentStatus,
        consentText: consent.consent_text,
        version: consent.version,
        grantedAt: consent.granted_at,
        revokedAt: consent.revoked_at,
        expiresAt: consent.expires_at,
        grantedBy: consent.granted_by,
        ipAddress: consent.ip_address,
        userAgent: consent.user_agent,
        digitalSignature: consent.digital_signature,
        witnessId: consent.witness_id,
        legalBasis: consent.legal_basis,
        purposeOfUse: JSON.parse(consent.purpose_of_use || '[]'),
        dataCategories: JSON.parse(consent.data_categories || '[]'),
        restrictions: JSON.parse(consent.restrictions || '[]'),
        metadata: JSON.parse(consent.metadata || '{}')
      }));

    } catch (error) {
      console.error('Consent history retrieval failed:', error);
      return [];
    }
  }

  static async validateDataAccess(
    patientId: string,
    dataCategory: string,
    purposeOfUse: string
  ): Promise<{ allowed: boolean; restrictions?: string[]; reason?: string }> {
    
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
      const specificConsent = await db.patientConsent.findFirst({
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

    } catch (error) {
      console.error('Data access validation failed:', error);
      return {
        allowed: false,
        reason: 'Failed to validate consent'
      };
    }
  }

  private static async createDigitalSignature(params: {
    patientId: string;
    consentType: ConsentType;
    timestamp: Date;
    userId: string;
  }): Promise<string> {
    const crypto = require('crypto');
    const data = `${params.patientId}:${params.consentType}:${params.timestamp.toISOString()}:${params.userId}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private static async isAuthorizedRepresentative(userId: string, patientId: string): Promise<boolean> {
    // Check if user is authorized representative (legal guardian, power of attorney, etc.)
    // This would be implemented based on your business logic
    return false;
  }

  private static async getClientIP(): Promise<string> {
    // This would be implemented to get actual client IP
    return 'unknown';
  }

  private static async getUserAgent(): Promise<string> {
    // This would be implemented to get actual user agent
    return 'unknown';
  }
}
