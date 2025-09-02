import { auth } from "@clerk/nextjs/server";
import db from "./db";
import { logAudit } from "./audit";
import { ConsentManager, ConsentType } from "./consent-management";

export enum AccessLevel {
  NONE = 'NONE',
  READ = 'READ',
  WRITE = 'WRITE',
  FULL = 'FULL'
}

export enum DataCategory {
  DEMOGRAPHICS = 'DEMOGRAPHICS',
  CONTACT_INFO = 'CONTACT_INFO',
  MEDICAL_HISTORY = 'MEDICAL_HISTORY',
  DIAGNOSIS = 'DIAGNOSIS',
  TREATMENT_PLAN = 'TREATMENT_PLAN',
  PRESCRIPTIONS = 'PRESCRIPTIONS',
  LAB_RESULTS = 'LAB_RESULTS',
  VITAL_SIGNS = 'VITAL_SIGNS',
  BILLING_INFO = 'BILLING_INFO',
  INSURANCE_INFO = 'INSURANCE_INFO',
  EMERGENCY_CONTACTS = 'EMERGENCY_CONTACTS'
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

export class HIPAAAccessControl {

  /**
   * Main access control gate - checks if user can access patient data
   */
  static async checkAccess(context: AccessControlContext): Promise<{
    allowed: boolean;
    accessLevel: AccessLevel;
    restrictions: string[];
    reason: string;
    auditRequired: boolean;
  }> {
    
    try {
      // Emergency override (break-glass) access
      if (context.emergencyOverride) {
        return await this.handleEmergencyAccess(context);
      }

      // Check basic role permissions
      const rolePermission = await this.checkRolePermissions(context);
      if (!rolePermission.allowed) {
        return rolePermission;
      }

      // Check patient-specific access rights
      const patientAccess = await this.checkPatientAccess(context);
      if (!patientAccess.allowed) {
        return patientAccess;
      }

      // Check consent requirements
      const consentCheck = await this.checkConsentRequirements(context);
      if (!consentCheck.allowed) {
        return consentCheck;
      }

      // Check minimum necessary principle
      const minimumNecessary = await this.checkMinimumNecessary(context);
      if (!minimumNecessary.allowed) {
        return minimumNecessary;
      }

      // Determine final access level and restrictions
      return {
        allowed: true,
        accessLevel: this.getAccessLevel(context),
        restrictions: this.getDataRestrictions(context),
        reason: 'Access granted based on role, patient assignment, and consent',
        auditRequired: true
      };

    } catch (error) {
      console.error('Access control check failed:', error);
      
      // Fail secure - deny access on error
      return {
        allowed: false,
        accessLevel: AccessLevel.NONE,
        restrictions: [],
        reason: 'Access control system error',
        auditRequired: true
      };
    }
  }

  /**
   * Check role-based permissions
   */
  private static async checkRolePermissions(context: AccessControlContext): Promise<{
    allowed: boolean;
    accessLevel: AccessLevel;
    restrictions: string[];
    reason: string;
    auditRequired: boolean;
  }> {
    
    const { userRole, patientId, userId, dataCategory, operation } = context;

    // Patient accessing their own data
    if (userRole === 'PATIENT' || userRole === 'patient') {
      if (userId === patientId) {
        return {
          allowed: true,
          accessLevel: operation === 'READ' ? AccessLevel.READ : AccessLevel.WRITE,
          restrictions: ['OWN_DATA_ONLY'],
          reason: 'Patient accessing own data',
          auditRequired: true
        };
      } else {
        return {
          allowed: false,
          accessLevel: AccessLevel.NONE,
          restrictions: [],
          reason: 'Patients can only access their own data',
          auditRequired: true
        };
      }
    }

    // Admin access - requires business justification
    if (userRole === 'ADMIN' || userRole === 'admin') {
      if (!context.businessJustification) {
        return {
          allowed: false,
          accessLevel: AccessLevel.NONE,
          restrictions: [],
          reason: 'Admin access requires business justification',
          auditRequired: true
        };
      }
      
      return {
        allowed: true,
        accessLevel: AccessLevel.FULL,
        restrictions: ['ADMIN_ACCESS', 'REQUIRES_JUSTIFICATION'],
        reason: 'Admin access with business justification',
        auditRequired: true
      };
    }

    // Healthcare provider roles
    const healthcareRoles = ['DOCTOR', 'doctor', 'NURSE', 'nurse', 'LAB_TECHNICIAN', 'lab_technician'];
    if (healthcareRoles.includes(userRole)) {
      return {
        allowed: true, // Further checks will determine specifics
        accessLevel: this.getRoleAccessLevel(userRole, operation),
        restrictions: ['TREATMENT_PURPOSE_ONLY'],
        reason: 'Healthcare provider role',
        auditRequired: true
      };
    }

    // Cashier/billing roles - limited access
    if (userRole === 'CASHIER' || userRole === 'cashier') {
      const allowedCategories = [DataCategory.DEMOGRAPHICS, DataCategory.BILLING_INFO, DataCategory.INSURANCE_INFO];
      
      if (!allowedCategories.includes(dataCategory)) {
        return {
          allowed: false,
          accessLevel: AccessLevel.NONE,
          restrictions: [],
          reason: 'Cashier role has limited data access',
          auditRequired: true
        };
      }

      return {
        allowed: true,
        accessLevel: AccessLevel.READ,
        restrictions: ['BILLING_PURPOSE_ONLY', 'LIMITED_DATA_ACCESS'],
        reason: 'Cashier accessing billing-related data',
        auditRequired: true
      };
    }

    // Default deny
    return {
      allowed: false,
      accessLevel: AccessLevel.NONE,
      restrictions: [],
      reason: 'Unknown or unauthorized role',
      auditRequired: true
    };
  }

  /**
   * Check patient-specific access (doctor assignments, etc.)
   */
  private static async checkPatientAccess(context: AccessControlContext): Promise<{
    allowed: boolean;
    accessLevel: AccessLevel;
    restrictions: string[];
    reason: string;
    auditRequired: boolean;
  }> {
    
    const { userId, userRole, patientId } = context;

    // Doctors - check if patient is assigned to them
    if (userRole === 'DOCTOR' || userRole === 'doctor') {
      const isAssigned = await this.isPatientAssignedToDoctor(patientId, userId);
      
      if (!isAssigned) {
        return {
          allowed: false,
          accessLevel: AccessLevel.NONE,
          restrictions: [],
          reason: 'Patient not assigned to this doctor',
          auditRequired: true
        };
      }
    }

    // Nurses - check department/unit assignment
    if (userRole === 'NURSE' || userRole === 'nurse') {
      const isInUnit = await this.isPatientInNurseUnit(patientId, userId);
      
      if (!isInUnit) {
        return {
          allowed: false,
          accessLevel: AccessLevel.NONE,
          restrictions: [],
          reason: 'Patient not in nurse assigned unit',
          auditRequired: true
        };
      }
    }

    // Lab technicians - check if lab work is ordered
    if (userRole === 'LAB_TECHNICIAN' || userRole === 'lab_technician') {
      const hasLabOrders = await this.hasActiveLabOrders(patientId, userId);
      
      if (!hasLabOrders) {
        return {
          allowed: false,
          accessLevel: AccessLevel.NONE,
          restrictions: [],
          reason: 'No active lab orders for this patient',
          auditRequired: true
        };
      }
    }

    return {
      allowed: true,
      accessLevel: AccessLevel.READ, // Will be refined later
      restrictions: [],
      reason: 'Patient access validated',
      auditRequired: true
    };
  }

  /**
   * Check consent requirements for data access
   */
  private static async checkConsentRequirements(context: AccessControlContext): Promise<{
    allowed: boolean;
    accessLevel: AccessLevel;
    restrictions: string[];
    reason: string;
    auditRequired: boolean;
  }> {
    
    const { patientId, dataCategory, userRole } = context;

    // Check HIPAA privacy consent
    const privacyConsent = await ConsentManager.checkConsent(patientId, ConsentType.HIPAA_PRIVACY);
    
    if (!privacyConsent.hasConsent) {
      return {
        allowed: false,
        accessLevel: AccessLevel.NONE,
        restrictions: [],
        reason: 'No valid HIPAA privacy consent',
        auditRequired: true
      };
    }

    // Check specific consent for sensitive data
    const sensitiveCategories = [
      DataCategory.MEDICAL_HISTORY,
      DataCategory.DIAGNOSIS,
      DataCategory.PRESCRIPTIONS
    ];

    if (sensitiveCategories.includes(dataCategory)) {
      const treatmentConsent = await ConsentManager.checkConsent(patientId, ConsentType.TREATMENT);
      
      if (!treatmentConsent.hasConsent && userRole !== 'patient') {
        return {
          allowed: false,
          accessLevel: AccessLevel.NONE,
          restrictions: [],
          reason: 'No valid treatment consent for sensitive data',
          auditRequired: true
        };
      }
    }

    return {
      allowed: true,
      accessLevel: AccessLevel.READ,
      restrictions: privacyConsent.restrictions || [],
      reason: 'Consent requirements satisfied',
      auditRequired: true
    };
  }

  /**
   * Apply minimum necessary principle
   */
  private static async checkMinimumNecessary(context: AccessControlContext): Promise<{
    allowed: boolean;
    accessLevel: AccessLevel;
    restrictions: string[];
    reason: string;
    auditRequired: boolean;
  }> {
    
    const { userRole, dataCategory, operation } = context;

    // Define minimum necessary data for each role
    const roleDataAccess = {
      'DOCTOR': [
        DataCategory.DEMOGRAPHICS,
        DataCategory.MEDICAL_HISTORY,
        DataCategory.DIAGNOSIS,
        DataCategory.TREATMENT_PLAN,
        DataCategory.PRESCRIPTIONS,
        DataCategory.LAB_RESULTS,
        DataCategory.VITAL_SIGNS
      ],
      'NURSE': [
        DataCategory.DEMOGRAPHICS,
        DataCategory.CONTACT_INFO,
        DataCategory.VITAL_SIGNS,
        DataCategory.TREATMENT_PLAN,
        DataCategory.EMERGENCY_CONTACTS
      ],
      'LAB_TECHNICIAN': [
        DataCategory.DEMOGRAPHICS,
        DataCategory.LAB_RESULTS,
        DataCategory.VITAL_SIGNS
      ],
      'CASHIER': [
        DataCategory.DEMOGRAPHICS,
        DataCategory.BILLING_INFO,
        DataCategory.INSURANCE_INFO
      ]
    };

    const allowedData = roleDataAccess[userRole as keyof typeof roleDataAccess] || [];
    
    if (!allowedData.includes(dataCategory)) {
      return {
        allowed: false,
        accessLevel: AccessLevel.NONE,
        restrictions: [],
        reason: `${userRole} role does not have minimum necessary access to ${dataCategory}`,
        auditRequired: true
      };
    }

    return {
      allowed: true,
      accessLevel: AccessLevel.READ,
      restrictions: ['MINIMUM_NECESSARY'],
      reason: 'Minimum necessary access principle satisfied',
      auditRequired: true
    };
  }

  /**
   * Handle emergency (break-glass) access
   */
  private static async handleEmergencyAccess(context: AccessControlContext): Promise<{
    allowed: boolean;
    accessLevel: AccessLevel;
    restrictions: string[];
    reason: string;
    auditRequired: boolean;
  }> {
    
    // Log emergency access immediately
    await logAudit({
      action: 'READ',
      resourceType: 'PATIENT',
      resourceId: context.patientId,
      patientId: context.patientId,
      reason: `EMERGENCY ACCESS: ${context.businessJustification || 'Medical emergency'}`,
      phiAccessed: [context.dataCategory],
      metadata: {
        emergencyOverride: true,
        userId: context.userId,
        userRole: context.userRole,
        securityEvent: 'BREAK_GLASS_ACCESS'
      }
    });

    // Alert security team immediately
    console.warn('🚨 EMERGENCY ACCESS GRANTED', {
      userId: context.userId,
      userRole: context.userRole,
      patientId: context.patientId,
      dataCategory: context.dataCategory,
      justification: context.businessJustification,
      timestamp: new Date().toISOString()
    });

    return {
      allowed: true,
      accessLevel: AccessLevel.READ, // Emergency access is read-only by default
      restrictions: ['EMERGENCY_ACCESS', 'IMMEDIATE_AUDIT_REQUIRED'],
      reason: 'Emergency override access granted',
      auditRequired: true
    };
  }

  // Helper methods
  private static async isPatientAssignedToDoctor(patientId: string, doctorId: string): Promise<boolean> {
    try {
      const assignment = await db.appointment.findFirst({
        where: {
          patient_id: patientId,
          doctor_id: doctorId,
          status: {
            in: ['SCHEDULED', 'COMPLETED']
          }
        }
      });
      return !!assignment;
    } catch (error) {
      console.error('Error checking doctor assignment:', error);
      return false;
    }
  }

  private static async isPatientInNurseUnit(patientId: string, nurseId: string): Promise<boolean> {
    // This would check if patient is in the same unit/department as the nurse
    // For now, we'll return true - implement based on your unit/department structure
    return true;
  }

  private static async hasActiveLabOrders(patientId: string, labTechId: string): Promise<boolean> {
    try {
      const labOrder = await db.labTest.findFirst({
        where: {
          // Add additional conditions based on lab assignment logic
          // Note: patient_id field may not exist in LabTest model
        }
      });
      return !!labOrder;
    } catch (error) {
      console.error('Error checking lab orders:', error);
      return false;
    }
  }

  private static getRoleAccessLevel(role: string, operation: string): AccessLevel {
    const accessMatrix = {
      'DOCTOR': operation === 'READ' ? AccessLevel.FULL : AccessLevel.WRITE,
      'NURSE': operation === 'READ' ? AccessLevel.READ : AccessLevel.WRITE,
      'LAB_TECHNICIAN': AccessLevel.READ,
      'CASHIER': AccessLevel.READ
    };

    return accessMatrix[role as keyof typeof accessMatrix] || AccessLevel.NONE;
  }

  private static getAccessLevel(context: AccessControlContext): AccessLevel {
    const { userRole, operation } = context;
    
    if (userRole === 'PATIENT' || userRole === 'patient') {
      return operation === 'READ' ? AccessLevel.READ : AccessLevel.WRITE;
    }
    
    return this.getRoleAccessLevel(userRole, operation);
  }

  private static getDataRestrictions(context: AccessControlContext): string[] {
    const restrictions = ['MINIMUM_NECESSARY', 'AUDIT_REQUIRED'];
    
    if (context.userRole === 'ADMIN' || context.userRole === 'admin') {
      restrictions.push('REQUIRES_JUSTIFICATION');
    }
    
    if (context.userRole === 'CASHIER' || context.userRole === 'cashier') {
      restrictions.push('BILLING_PURPOSE_ONLY');
    }
    
    return restrictions;
  }
}

/**
 * Utility function to check access before data operations
 */
export async function enforceAccess(
  patientId: string,
  dataCategory: DataCategory,
  operation: 'READ' | 'WRITE' | 'DELETE',
  businessJustification?: string
): Promise<boolean> {
  
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const userRole = sessionClaims?.metadata?.role || 'unknown';

  const accessCheck = await HIPAAAccessControl.checkAccess({
    userId,
    userRole,
    patientId,
    dataCategory,
    operation,
    businessJustification
  });

  // Log access attempt
  await logAudit({
    action: operation.toUpperCase() as any,
    resourceType: 'PATIENT',
    resourceId: patientId,
    patientId,
    reason: businessJustification || `${operation} operation on ${dataCategory}`,
    success: accessCheck.allowed,
    errorMessage: accessCheck.allowed ? undefined : accessCheck.reason,
    phiAccessed: accessCheck.allowed ? [dataCategory] : undefined,
    metadata: {
      accessLevel: accessCheck.accessLevel,
      restrictions: accessCheck.restrictions,
      userRole
    }
  });

  if (!accessCheck.allowed) {
    throw new Error(`Access denied: ${accessCheck.reason}`);
  }

  return true;
}
