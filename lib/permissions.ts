// Enterprise-grade Permission Registry and RBAC Engine
export type Permission =
  // Patient Management
  | 'PATIENT_CREATE' | 'PATIENT_READ' | 'PATIENT_UPDATE' | 'PATIENT_DELETE'
  | 'PATIENT_BILL_VIEW' | 'PATIENT_BILL_MANAGE'

  // User Management
  | 'USER_CREATE' | 'USER_READ' | 'USER_UPDATE' | 'USER_DELETE'
  | 'USER_ROLE_ASSIGN' | 'USER_PERMISSION_GRANT'

  // Department Management
  | 'DEPARTMENT_CREATE' | 'DEPARTMENT_READ' | 'DEPARTMENT_UPDATE' | 'DEPARTMENT_DELETE'
  | 'DEPARTMENT_STAFF_MANAGE'

  // Ward & Bed Management
  | 'WARD_CREATE' | 'WARD_READ' | 'WARD_UPDATE' | 'WARD_DELETE'
  | 'BED_CREATE' | 'BED_READ' | 'BED_UPDATE' | 'BED_DELETE'
  | 'BED_ASSIGNMENT_MANAGE'

  // Doctor Management
  | 'DOCTOR_CREATE' | 'DOCTOR_READ' | 'DOCTOR_UPDATE' | 'DOCTOR_DELETE'
  | 'DOCTOR_SCHEDULE_MANAGE' | 'DOCTOR_AVAILABILITY_UPDATE'

  // Staff Management
  | 'STAFF_CREATE' | 'STAFF_READ' | 'STAFF_UPDATE' | 'STAFF_DELETE'
  | 'STAFF_SCHEDULE_MANAGE'

  // Appointment Management
  | 'APPOINTMENT_CREATE' | 'APPOINTMENT_READ' | 'APPOINTMENT_UPDATE' | 'APPOINTMENT_DELETE'
  | 'APPOINTMENT_RESCHEDULE' | 'APPOINTMENT_CANCEL'

  // Medical Records
  | 'MEDICAL_RECORD_CREATE' | 'MEDICAL_RECORD_READ' | 'MEDICAL_RECORD_UPDATE'
  | 'MEDICAL_RECORD_DELETE' | 'MEDICAL_RECORD_EXPORT'

  // Lab & Diagnostics
  | 'LAB_TEST_CREATE' | 'LAB_TEST_READ' | 'LAB_TEST_UPDATE' | 'LAB_TEST_DELETE'
  | 'LAB_RESULT_MANAGE' | 'LAB_REPORT_GENERATE'

  // Financial Operations
  | 'BILL_CREATE' | 'BILL_READ' | 'BILL_UPDATE' | 'BILL_DELETE'
  | 'PAYMENT_PROCESS' | 'PAYMENT_REFUND' | 'FINANCIAL_REPORT_VIEW'

  // Equipment Management
  | 'EQUIPMENT_CREATE' | 'EQUIPMENT_READ' | 'EQUIPMENT_UPDATE' | 'EQUIPMENT_DELETE'
  | 'EQUIPMENT_MAINTENANCE_SCHEDULE' | 'EQUIPMENT_STATUS_UPDATE'

  // Audit & Security
  | 'AUDIT_LOG_VIEW' | 'AUDIT_LOG_EXPORT' | 'SECURITY_ALERT_VIEW'
  | 'PERMISSION_AUDIT' | 'ACCESS_CONTROL_MANAGE'

  // System Administration
  | 'SYSTEM_CONFIG_VIEW' | 'SYSTEM_CONFIG_UPDATE' | 'BACKUP_MANAGE'
  | 'BULK_IMPORT_EXECUTE' | 'SYSTEM_HEALTH_MONITOR';

export type Role = 'admin' | 'doctor' | 'nurse' | 'lab_technician' | 'cashier' | 'patient';

export interface PermissionSet {
  role: Role;
  permissions: Permission[];
  description: string;
  level: 'SUPER_ADMIN' | 'ADMIN' | 'PROFESSIONAL' | 'STAFF' | 'USER';
}

// Role-Based Permission Sets
export const ROLE_PERMISSIONS: PermissionSet[] = [
  {
    role: 'admin',
    level: 'SUPER_ADMIN',
    description: 'Full system access with all permissions',
    permissions: [
      'PATIENT_CREATE', 'PATIENT_READ', 'PATIENT_UPDATE', 'PATIENT_DELETE',
      'PATIENT_BILL_VIEW', 'PATIENT_BILL_MANAGE', 'USER_CREATE', 'USER_READ',
      'USER_UPDATE', 'USER_DELETE', 'USER_ROLE_ASSIGN', 'USER_PERMISSION_GRANT',
      'DEPARTMENT_CREATE', 'DEPARTMENT_READ', 'DEPARTMENT_UPDATE', 'DEPARTMENT_DELETE',
      'DEPARTMENT_STAFF_MANAGE', 'WARD_CREATE', 'WARD_READ', 'WARD_UPDATE',
      'WARD_DELETE', 'BED_CREATE', 'BED_READ', 'BED_UPDATE', 'BED_DELETE',
      'BED_ASSIGNMENT_MANAGE', 'DOCTOR_CREATE', 'DOCTOR_READ', 'DOCTOR_UPDATE',
      'DOCTOR_DELETE', 'DOCTOR_SCHEDULE_MANAGE', 'DOCTOR_AVAILABILITY_UPDATE',
      'STAFF_CREATE', 'STAFF_READ', 'STAFF_UPDATE', 'STAFF_DELETE',
      'STAFF_SCHEDULE_MANAGE', 'APPOINTMENT_CREATE', 'APPOINTMENT_READ',
      'APPOINTMENT_UPDATE', 'APPOINTMENT_DELETE', 'APPOINTMENT_RESCHEDULE',
      'APPOINTMENT_CANCEL', 'MEDICAL_RECORD_CREATE', 'MEDICAL_RECORD_READ',
      'MEDICAL_RECORD_UPDATE', 'MEDICAL_RECORD_DELETE', 'MEDICAL_RECORD_EXPORT',
      'LAB_TEST_CREATE', 'LAB_TEST_READ', 'LAB_TEST_UPDATE', 'LAB_TEST_DELETE',
      'LAB_RESULT_MANAGE', 'LAB_REPORT_GENERATE', 'BILL_CREATE', 'BILL_READ',
      'BILL_UPDATE', 'BILL_DELETE', 'PAYMENT_PROCESS', 'PAYMENT_REFUND',
      'FINANCIAL_REPORT_VIEW', 'EQUIPMENT_CREATE', 'EQUIPMENT_READ',
      'EQUIPMENT_UPDATE', 'EQUIPMENT_DELETE', 'EQUIPMENT_MAINTENANCE_SCHEDULE',
      'EQUIPMENT_STATUS_UPDATE', 'AUDIT_LOG_VIEW', 'AUDIT_LOG_EXPORT',
      'SECURITY_ALERT_VIEW', 'PERMISSION_AUDIT', 'ACCESS_CONTROL_MANAGE',
      'SYSTEM_CONFIG_VIEW', 'SYSTEM_CONFIG_UPDATE', 'BACKUP_MANAGE',
      'BULK_IMPORT_EXECUTE', 'SYSTEM_HEALTH_MONITOR'
    ]
  },
  {
    role: 'doctor',
    level: 'PROFESSIONAL',
    description: 'Medical professional with patient care and record management permissions',
    permissions: [
      'PATIENT_READ', 'PATIENT_UPDATE', 'PATIENT_BILL_VIEW',
      'APPOINTMENT_CREATE', 'APPOINTMENT_READ', 'APPOINTMENT_UPDATE', 'APPOINTMENT_DELETE', 'APPOINTMENT_RESCHEDULE', 'APPOINTMENT_CANCEL',
      'MEDICAL_RECORD_CREATE', 'MEDICAL_RECORD_READ', 'MEDICAL_RECORD_UPDATE',
      'LAB_TEST_CREATE', 'LAB_TEST_READ', 'LAB_TEST_UPDATE', 'LAB_RESULT_MANAGE', 'LAB_REPORT_GENERATE',
      'DOCTOR_READ', 'DOCTOR_UPDATE', 'DOCTOR_SCHEDULE_MANAGE', 'DOCTOR_AVAILABILITY_UPDATE',
      'EQUIPMENT_READ', 'EQUIPMENT_STATUS_UPDATE'
    ]
  },
  {
    role: 'nurse',
    level: 'STAFF',
    description: 'Patient care staff with patient management and basic medical record permissions',
    permissions: [
      'PATIENT_CREATE', 'PATIENT_READ', 'PATIENT_UPDATE', 'PATIENT_BILL_VIEW',
      'APPOINTMENT_CREATE', 'APPOINTMENT_READ', 'APPOINTMENT_UPDATE', 'APPOINTMENT_RESCHEDULE',
      'MEDICAL_RECORD_CREATE', 'MEDICAL_RECORD_READ', 'MEDICAL_RECORD_UPDATE',
      'LAB_TEST_CREATE', 'LAB_TEST_READ', 'LAB_RESULT_MANAGE',
      'WARD_READ', 'BED_READ', 'BED_ASSIGNMENT_MANAGE',
      'STAFF_READ', 'STAFF_UPDATE'
    ]
  },
  {
    role: 'lab_technician',
    level: 'STAFF',
    description: 'Laboratory staff with diagnostic and equipment management permissions',
    permissions: [
      'PATIENT_READ', 'PATIENT_BILL_VIEW',
      'LAB_TEST_CREATE', 'LAB_TEST_READ', 'LAB_TEST_UPDATE', 'LAB_TEST_DELETE', 'LAB_RESULT_MANAGE', 'LAB_REPORT_GENERATE',
      'EQUIPMENT_READ', 'EQUIPMENT_UPDATE', 'EQUIPMENT_STATUS_UPDATE',
      'WARD_READ', 'BED_READ'
    ]
  },
  {
    role: 'cashier',
    level: 'STAFF',
    description: 'Financial staff with billing and payment processing permissions',
    permissions: [
      'PATIENT_READ', 'PATIENT_BILL_VIEW', 'PATIENT_BILL_MANAGE',
      'BILL_CREATE', 'BILL_READ', 'BILL_UPDATE', 'BILL_DELETE',
      'PAYMENT_PROCESS', 'PAYMENT_REFUND', 'FINANCIAL_REPORT_VIEW',
      'APPOINTMENT_READ'
    ]
  },
  {
    role: 'patient',
    level: 'USER',
    description: 'End user with limited access to own information',
    permissions: [
      'PATIENT_READ', 'PATIENT_UPDATE',
      'APPOINTMENT_CREATE', 'APPOINTMENT_READ', 'APPOINTMENT_UPDATE', 'APPOINTMENT_CANCEL',
      'MEDICAL_RECORD_READ', 'PATIENT_BILL_VIEW'
    ]
  }
];

// Utility functions for permission checking
export const hasPermission = (userRole: Role, permission: Permission): boolean => {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userRole);
  return rolePermissions?.permissions.includes(permission) ?? false;
};

export const hasAnyPermission = (userRole: Role, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: Role, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

export const getRolePermissions = (role: Role): Set<Permission> => {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === role);
  return new Set(rolePermissions?.permissions ?? []);
};
