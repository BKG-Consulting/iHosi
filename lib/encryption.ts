import crypto from 'crypto';

// HIPAA-compliant encryption utilities
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment (must be 32 bytes)
function getEncryptionKey(): Buffer {
  const key = process.env.PHI_ENCRYPTION_KEY;
  if (!key) {
    console.warn('PHI_ENCRYPTION_KEY not set, using development key');
    // Development fallback key - DO NOT use in production
    return Buffer.from('39d653047162e71ce614d357feffe818e6a2630602c29c0c85edb00401a56d67', 'hex');
  }
  
  // Convert hex string to buffer or derive from password
  if (key.length === 64) { // Hex string
    return Buffer.from(key, 'hex');
  } else {
    // Derive key from password using PBKDF2
    const salt = Buffer.from(process.env.PHI_ENCRYPTION_SALT || 'healthcare-system-salt', 'utf8');
    return crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256');
  }
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

export function encryptPHI(plaintext: string | null | undefined): string | null {
  if (!plaintext || plaintext.trim() === '') {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Use modern crypto methods for Node.js v22+
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    // Store as JSON string for database
    const result: EncryptedData = {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };

    return JSON.stringify(result);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt PHI data');
  }
}

export function decryptPHI(encryptedData: string | null | undefined): string | null {
  if (!encryptedData) {
    return null;
  }

  try {
    // First, try to parse as JSON (encrypted data)
    const data: EncryptedData = JSON.parse(encryptedData);
    
    // If it's valid JSON with encrypted structure, decrypt it
    if (data.encrypted && data.iv && data.tag) {
      const key = getEncryptionKey();
      
      // Use modern crypto methods for Node.js v22+
      const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(data.iv, 'hex'));
      decipher.setAuthTag(Buffer.from(data.tag, 'hex'));

      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } else {
      // If it's JSON but not encrypted, return as is
      return encryptedData;
    }
  } catch (error) {
    // If JSON parsing fails, it's likely plain text - return as is
    console.log('Data is not encrypted JSON, returning as plain text:', encryptedData);
    return encryptedData;
  }
}

// Utility functions for common PHI fields
export const PHIEncryption = {
  // Patient data encryption - only encrypt fields that exist in the schema
  encryptPatientData: (data: any) => ({
    ...data,
    // Encrypt sensitive PHI fields that exist in Patient schema
    phone: data.phone ? encryptPHI(data.phone) : null,
    email: data.email ? encryptPHI(data.email) : null,
    address: data.address ? encryptPHI(data.address) : null,
    emergency_contact_number: data.emergency_contact_number ? encryptPHI(data.emergency_contact_number) : null,
    insurance_number: data.insurance_number ? encryptPHI(data.insurance_number) : null,
    medical_history: data.medical_history ? encryptPHI(data.medical_history) : null,
    allergies: data.allergies ? encryptPHI(data.allergies) : null,
    medical_conditions: data.medical_conditions ? encryptPHI(data.medical_conditions) : null
  }),

  // Decrypt patient data - only decrypt fields that exist in the schema
  decryptPatientData: (data: any) => ({
    ...data,
    phone: decryptPHI(data.phone),
    email: decryptPHI(data.email),
    address: decryptPHI(data.address),
    emergency_contact_number: decryptPHI(data.emergency_contact_number),
    insurance_number: decryptPHI(data.insurance_number),
    medical_history: decryptPHI(data.medical_history),
    allergies: decryptPHI(data.allergies),
    medical_conditions: decryptPHI(data.medical_conditions)
  }),

  // Medical records encryption
  encryptMedicalRecord: (data: any) => ({
    ...data,
    treatment_plan: data.treatment_plan ? encryptPHI(data.treatment_plan) : null,
    prescriptions: data.prescriptions ? encryptPHI(data.prescriptions) : null,
    lab_request: data.lab_request ? encryptPHI(data.lab_request) : null,
    notes: data.notes ? encryptPHI(data.notes) : null
  }),

  // Decrypt medical records
  decryptMedicalRecord: (data: any) => ({
    ...data,
    treatment_plan: decryptPHI(data.treatment_plan),
    prescriptions: decryptPHI(data.prescriptions),
    lab_request: decryptPHI(data.lab_request),
    notes: decryptPHI(data.notes)
  }),

  // Diagnosis encryption
  encryptDiagnosis: (data: any) => ({
    ...data,
    symptoms: data.symptoms ? encryptPHI(data.symptoms) : null,
    diagnosis: data.diagnosis ? encryptPHI(data.diagnosis) : null,
    notes: data.notes ? encryptPHI(data.notes) : null,
    prescribed_medications: data.prescribed_medications ? encryptPHI(data.prescribed_medications) : null,
    follow_up_plan: data.follow_up_plan ? encryptPHI(data.follow_up_plan) : null
  }),

  // Decrypt diagnosis
  decryptDiagnosis: (data: any) => ({
    ...data,
    symptoms: decryptPHI(data.symptoms),
    diagnosis: decryptPHI(data.diagnosis),
    notes: decryptPHI(data.notes),
    prescribed_medications: decryptPHI(data.prescribed_medications),
    follow_up_plan: decryptPHI(data.follow_up_plan)
  }),

  // Doctor data encryption
  encryptDoctorData: (doctorData: any): any => {
    try {
      const encryptedData = { ...doctorData };
      
      // Encrypt sensitive doctor fields - including name
      const sensitiveFields = [
        'name', 'phone', 'email', 'address', 'license_number', 'specialization'
      ];
      
      sensitiveFields.forEach(field => {
        if (doctorData[field] && typeof doctorData[field] === 'string') {
          encryptedData[field] = encryptPHI(doctorData[field]);
        }
      });
      
      return encryptedData;
    } catch (error) {
      console.error('Error encrypting doctor data:', error);
      return doctorData;
    }
  },

  decryptDoctorData: (doctorData: any): any => {
    try {
      const decryptedData = { ...doctorData };
      
      // Decrypt sensitive doctor fields - including name if it was encrypted
      const sensitiveFields = [
        'name', 'phone', 'email', 'address', 'license_number', 'specialization'
      ];
      
      sensitiveFields.forEach(field => {
        if (doctorData[field] && typeof doctorData[field] === 'string') {
          try {
            decryptedData[field] = decryptPHI(doctorData[field]);
          } catch (decryptError) {
            // If decryption fails, keep original value
            decryptedData[field] = doctorData[field];
          }
        }
      });
      
      return decryptedData;
    } catch (error) {
      console.error('Error decrypting doctor data:', error);
      return doctorData;
    }
  },
};

// Key rotation utility (for enhanced security)
export async function rotateEncryptionKey() {
  // This would be implemented for production key rotation
  console.warn('Key rotation should be implemented for production use');
}

// Data integrity verification
export function createDataHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function verifyDataIntegrity(data: string, hash: string): boolean {
  const currentHash = createDataHash(data);
  return currentHash === hash;
}
