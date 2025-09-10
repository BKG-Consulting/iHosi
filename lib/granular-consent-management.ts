import { db } from "@/lib/db";
import { logAuditWithContext } from "@/lib/audit-server";
import { ConsentType, ConsentStatus } from "@/types/enums";

export enum DataCategory {
  DEMOGRAPHICS = 'DEMOGRAPHICS',
  CONTACT_INFO = 'CONTACT_INFO',
  MEDICAL_HISTORY = 'MEDICAL_HISTORY',
  ALLERGIES = 'ALLERGIES',
  MEDICATIONS = 'MEDICATIONS',
  VITAL_SIGNS = 'VITAL_SIGNS',
  LAB_RESULTS = 'LAB_RESULTS',
  IMAGING_RESULTS = 'IMAGING_RESULTS',
  DIAGNOSES = 'DIAGNOSES',
  TREATMENT_PLANS = 'TREATMENT_PLANS',
  PRESCRIPTIONS = 'PRESCRIPTIONS',
  BILLING_INFO = 'BILLING_INFO',
  INSURANCE_INFO = 'INSURANCE_INFO',
  EMERGENCY_CONTACTS = 'EMERGENCY_CONTACTS',
  FAMILY_HISTORY = 'FAMILY_HISTORY',
  SOCIAL_HISTORY = 'SOCIAL_HISTORY',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  SUBSTANCE_USE = 'SUBSTANCE_USE',
  SEXUAL_HEALTH = 'SEXUAL_HEALTH',
  GENETIC_INFO = 'GENETIC_INFO'
}

export enum MedicalActionType {
  VIEW_MEDICAL_RECORDS = 'VIEW_MEDICAL_RECORDS',
  WRITE_DIAGNOSIS = 'WRITE_DIAGNOSIS',
  PRESCRIBE_MEDICATION = 'PRESCRIBE_MEDICATION',
  ORDER_LAB_TESTS = 'ORDER_LAB_TESTS',
  ORDER_IMAGING = 'ORDER_IMAGING',
  REFER_TO_SPECIALIST = 'REFER_TO_SPECIALIST',
  SHARE_WITH_OTHER_DOCTORS = 'SHARE_WITH_OTHER_DOCTORS',
  USE_FOR_RESEARCH = 'USE_FOR_RESEARCH',
  MARKETING_COMMUNICATIONS = 'MARKETING_COMMUNICATIONS',
  EMERGENCY_ACCESS = 'EMERGENCY_ACCESS'
}

export interface GranularConsentRequest {
  patientId: string;
  doctorId?: string; // Optional for doctor-specific consent
  consentType: ConsentType;
  dataCategories: DataCategory[];
  medicalActions: MedicalActionType[];
  consentText: string;
  version: string;
  legalBasis: string;
  purposeOfUse: string[];
  restrictions?: string[];
  expirationDays?: number;
  autoRevokeAfterAppointment?: boolean;
  witnessId?: string;
}

export interface ConsentValidationResult {
  hasConsent: boolean;
  consentId?: string;
  missingCategories?: DataCategory[];
  missingActions?: MedicalActionType[];
  restrictions?: string[];
  expiresAt?: Date;
}

export class GranularConsentManager {
  
  /**
   * Grant granular consent for specific data categories and medical actions
   */
  static async grantGranularConsent(params: GranularConsentRequest): Promise<{
    success: boolean;
    consentId?: string;
    error?: string;
  }> {
    try {
      const userId = 'current-user-id'; // Get from session
      const ipAddress = '127.0.0.1'; // Get from request
      const userAgent = 'Mozilla/5.0...'; // Get from request
      
      const expiresAt = params.expirationDays 
        ? new Date(Date.now() + params.expirationDays * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

      // Create digital signature
      const digitalSignature = await this.createDigitalSignature({
        patientId: params.patientId,
        doctorId: params.doctorId,
        consentType: params.consentType,
        dataCategories: params.dataCategories,
        medicalActions: params.medicalActions,
        timestamp: new Date(),
        userId
      });

      // Store granular consent
      const consent = await db.granularConsent.create({
        data: {
          patient_id: params.patientId,
          doctor_id: params.doctorId,
          consent_type: params.consentType,
          data_categories: params.dataCategories,
          medical_actions: params.medicalActions,
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
          purpose_of_use: params.purposeOfUse,
          restrictions: params.restrictions || [],
          auto_revoke_after_appointment: params.autoRevokeAfterAppointment || false,
          auto_revoke_days: params.expirationDays,
          metadata: {
            consentMethod: 'granular_digital_form',
            timestamp: new Date().toISOString(),
            dataCategoriesCount: params.dataCategories.length,
            medicalActionsCount: params.medicalActions.length
          }
        }
      });

      // Create doctor-patient consent relationship if doctor-specific
      if (params.doctorId) {
        await db.doctorPatientConsent.upsert({
          where: {
            patient_id_doctor_id: {
              patient_id: params.patientId,
              doctor_id: params.doctorId
            }
          },
          update: {
            consent_granted_at: new Date(),
            consent_expires_at: expiresAt,
            status: 'active',
            data_categories_allowed: params.dataCategories,
            medical_actions_allowed: params.medicalActions,
            restrictions: params.restrictions || []
          },
          create: {
            patient_id: params.patientId,
            doctor_id: params.doctorId,
            consent_granted_at: new Date(),
            consent_expires_at: expiresAt,
            status: 'active',
            data_categories_allowed: params.dataCategories,
            medical_actions_allowed: params.medicalActions,
            restrictions: params.restrictions || []
          }
        });
      }

      // Audit log
      await logAuditWithContext({
        action: 'CREATE',
        resourceType: 'PATIENT',
        resourceId: consent.id,
        patientId: params.patientId,
        reason: 'Granular consent granted',
        phiAccessed: ['consent_records'],
        metadata: {
          consentType: params.consentType,
          dataCategories: params.dataCategories,
          medicalActions: params.medicalActions,
          doctorId: params.doctorId,
          digitalSignature
        }
      });

      return { success: true, consentId: consent.id };

    } catch (error) {
      console.error('Granular consent grant failed:', error);
      return { success: false, error: 'Failed to grant granular consent' };
    }
  }

  /**
   * Validate if doctor has consent for specific data access
   */
  static async validateDataAccess(params: {
    patientId: string;
    doctorId: string;
    dataCategory: DataCategory;
    medicalAction?: MedicalActionType;
    accessReason: string;
  }): Promise<ConsentValidationResult> {
    try {
      // Check for active doctor-patient consent
      const doctorConsent = await db.doctorPatientConsent.findFirst({
        where: {
          patient_id: params.patientId,
          doctor_id: params.doctorId,
          status: 'active',
          consent_expires_at: {
            gt: new Date()
          }
        }
      });

      if (!doctorConsent) {
        return {
          hasConsent: false,
          missingCategories: [params.dataCategory],
          missingActions: params.medicalAction ? [params.medicalAction] : []
        };
      }

      // Check data category consent
      const hasDataCategoryConsent = doctorConsent.data_categories_allowed.includes(params.dataCategory);
      
      // Check medical action consent
      const hasMedicalActionConsent = !params.medicalAction || 
        doctorConsent.medical_actions_allowed.includes(params.medicalAction);

      if (!hasDataCategoryConsent || !hasMedicalActionConsent) {
        return {
          hasConsent: false,
          missingCategories: hasDataCategoryConsent ? [] : [params.dataCategory],
          missingActions: hasMedicalActionConsent ? [] : (params.medicalAction ? [params.medicalAction] : []),
          restrictions: doctorConsent.restrictions
        };
      }

      // Log access
      await this.logConsentAccess({
        patientId: params.patientId,
        doctorId: params.doctorId,
        consentId: doctorConsent.id,
        accessType: 'view',
        dataCategory: params.dataCategory,
        medicalAction: params.medicalAction,
        accessReason: params.accessReason,
        success: true
      });

      return {
        hasConsent: true,
        consentId: doctorConsent.id,
        expiresAt: doctorConsent.consent_expires_at || undefined,
        restrictions: doctorConsent.restrictions
      };

    } catch (error) {
      console.error('Consent validation failed:', error);
      return { hasConsent: false };
    }
  }

  /**
   * Revoke consent for specific doctor or all doctors
   */
  static async revokeConsent(params: {
    patientId: string;
    doctorId?: string; // If not provided, revokes all consents
    reason: string;
    revokedBy: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const whereClause = {
        patient_id: params.patientId,
        ...(params.doctorId && { doctor_id: params.doctorId })
      };

      // Update granular consents
      await db.granularConsent.updateMany({
        where: {
          ...whereClause,
          status: ConsentStatus.GRANTED
        },
        data: {
          status: ConsentStatus.REVOKED,
          revoked_at: new Date()
        }
      });

      // Update doctor-patient consents
      await db.doctorPatientConsent.updateMany({
        where: {
          ...whereClause,
          status: 'active'
        },
        data: {
          status: 'revoked'
        }
      });

      // Audit log
      await logAuditWithContext({
        action: 'UPDATE',
        resourceType: 'PATIENT',
        resourceId: 'bulk_revoke',
        patientId: params.patientId,
        reason: `Consent revoked: ${params.reason}`,
        phiAccessed: ['consent_records'],
        metadata: {
          doctorId: params.doctorId,
          revokedBy: params.revokedBy,
          reason: params.reason
        }
      });

      return { success: true };

    } catch (error) {
      console.error('Consent revocation failed:', error);
      return { success: false, error: 'Failed to revoke consent' };
    }
  }

  /**
   * Auto-revoke consent after appointment completion
   */
  static async autoRevokeAfterAppointment(appointmentId: number): Promise<void> {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, doctor: true }
      });

      if (!appointment) return;

      // Find consents that should be auto-revoked
      const consentsToRevoke = await db.granularConsent.findMany({
        where: {
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          auto_revoke_after_appointment: true,
          status: ConsentStatus.GRANTED
        }
      });

      for (const consent of consentsToRevoke) {
        await this.revokeConsent({
          patientId: appointment.patient_id,
          doctorId: appointment.doctor_id,
          reason: 'Auto-revoked after appointment completion',
          revokedBy: 'system'
        });
      }

    } catch (error) {
      console.error('Auto-revoke after appointment failed:', error);
    }
  }

  /**
   * Get patient's consent dashboard data
   */
  static async getPatientConsentDashboard(patientId: string): Promise<{
    activeConsents: any[];
    expiredConsents: any[];
    revokedConsents: any[];
    doctorRelationships: any[];
  }> {
    try {
      const [activeConsents, expiredConsents, revokedConsents, doctorRelationships] = await Promise.all([
        db.granularConsent.findMany({
          where: {
            patient_id: patientId,
            status: ConsentStatus.GRANTED,
            expires_at: { gt: new Date() }
          },
          include: { doctor: true }
        }),
        db.granularConsent.findMany({
          where: {
            patient_id: patientId,
            status: ConsentStatus.EXPIRED
          },
          include: { doctor: true }
        }),
        db.granularConsent.findMany({
          where: {
            patient_id: patientId,
            status: ConsentStatus.REVOKED
          },
          include: { doctor: true }
        }),
        db.doctorPatientConsent.findMany({
          where: { patient_id: patientId },
          include: { doctor: true }
        })
      ]);

      return {
        activeConsents,
        expiredConsents,
        revokedConsents,
        doctorRelationships
      };

    } catch (error) {
      console.error('Failed to get patient consent dashboard:', error);
      return {
        activeConsents: [],
        expiredConsents: [],
        revokedConsents: [],
        doctorRelationships: []
      };
    }
  }

  /**
   * Log consent access for audit purposes
   */
  private static async logConsentAccess(params: {
    patientId: string;
    doctorId: string;
    consentId: string;
    accessType: string;
    dataCategory: DataCategory;
    medicalAction?: MedicalActionType;
    accessReason: string;
    success: boolean;
    denialReason?: string;
  }): Promise<void> {
    try {
      await db.consentAccessLog.create({
        data: {
          patient_id: params.patientId,
          doctor_id: params.doctorId,
          consent_id: params.consentId,
          access_type: params.accessType,
          data_category: params.dataCategory,
          medical_action: params.medicalAction,
          access_reason: params.accessReason,
          ip_address: '127.0.0.1', // Get from request
          user_agent: 'Mozilla/5.0...', // Get from request
          success: params.success,
          denial_reason: params.denialReason
        }
      });
    } catch (error) {
      console.error('Failed to log consent access:', error);
    }
  }

  /**
   * Create digital signature for consent
   */
  private static async createDigitalSignature(params: {
    patientId: string;
    doctorId?: string;
    consentType: ConsentType;
    dataCategories: DataCategory[];
    medicalActions: MedicalActionType[];
    timestamp: Date;
    userId: string;
  }): Promise<string> {
    // In a real implementation, this would use cryptographic signing
    const signatureData = {
      patientId: params.patientId,
      doctorId: params.doctorId,
      consentType: params.consentType,
      dataCategories: params.dataCategories,
      medicalActions: params.medicalActions,
      timestamp: params.timestamp.toISOString(),
      userId: params.userId
    };

    // For now, return a hash of the signature data
    return Buffer.from(JSON.stringify(signatureData)).toString('base64');
  }
}

