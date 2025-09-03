import { PHIEncryption } from "@/lib/encryption";

/**
 * Utility functions for handling encrypted data consistently across the application
 */

export interface DecryptedStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  license_number?: string;
  role: string;
  department_id?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface DecryptedDoctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  license_number: string;
  specialization: string;
  emergency_contact: string;
  emergency_phone: string;
  qualifications: string;
  department_id?: string;
  type: string;
  experience_years: number;
  consultation_fee: number;
  max_patients_per_day: number;
  preferred_appointment_duration: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Decrypts staff data from database format to display format
 */
export function decryptStaffData(staff: any[]): DecryptedStaff[] {
  return staff.map((member: any) => {
    const decryptedData = PHIEncryption.decryptDoctorData(member);
    return {
      ...member,
      name: decryptedData.name,
      email: decryptedData.email,
      phone: decryptedData.phone,
      address: decryptedData.address,
      license_number: decryptedData.license_number,
    };
  });
}

/**
 * Decrypts doctor data from database format to display format
 */
export function decryptDoctorData(doctors: any[]): DecryptedDoctor[] {
  return doctors.map((doctor: any) => {
    const decryptedData = PHIEncryption.decryptDoctorData(doctor);
    return {
      ...doctor,
      name: decryptedData.name,
      email: decryptedData.email,
      phone: decryptedData.phone,
      address: decryptedData.address,
      license_number: decryptedData.license_number,
      specialization: decryptedData.specialization,
      emergency_contact: decryptedData.emergency_contact,
      emergency_phone: decryptedData.emergency_phone,
      qualifications: decryptedData.qualifications,
    };
  });
}

/**
 * Decrypts a single staff member
 */
export function decryptSingleStaff(staff: any): DecryptedStaff {
  const decryptedData = PHIEncryption.decryptDoctorData(staff);
  return {
    ...staff,
    name: decryptedData.name,
    email: decryptedData.email,
    phone: decryptedData.phone,
    address: decryptedData.address,
    license_number: decryptedData.license_number,
  };
}

/**
 * Decrypts a single doctor
 */
export function decryptSingleDoctor(doctor: any): DecryptedDoctor {
  const decryptedData = PHIEncryption.decryptDoctorData(doctor);
  return {
    ...doctor,
    name: decryptedData.name,
    email: decryptedData.email,
    phone: decryptedData.phone,
    address: decryptedData.address,
    license_number: decryptedData.license_number,
    specialization: decryptedData.specialization,
    emergency_contact: decryptedData.emergency_contact,
    emergency_phone: decryptedData.emergency_phone,
    qualifications: decryptedData.qualifications,
  };
}

/**
 * Validates that data is properly decrypted (not showing encrypted format)
 */
export function isDataDecrypted(data: any): boolean {
  if (typeof data === 'string') {
    // Check if it looks like encrypted data (contains "encrypted", "iv", "tag")
    return !data.includes('"encrypted"') && !data.includes('"iv"') && !data.includes('"tag"');
  }
  return true;
}

/**
 * Ensures all sensitive fields in an object are decrypted
 */
export function ensureDecrypted<T extends Record<string, any>>(obj: T, sensitiveFields: string[]): T {
  const result = { ...obj };
  
  for (const field of sensitiveFields) {
    if (result[field] && !isDataDecrypted(result[field])) {
      console.warn(`Field ${field} appears to be encrypted and should be decrypted before display`);
    }
  }
  
  return result;
}
