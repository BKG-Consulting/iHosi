"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHIEncryption = void 0;
exports.encryptPHI = encryptPHI;
exports.decryptPHI = decryptPHI;
exports.rotateEncryptionKey = rotateEncryptionKey;
exports.createDataHash = createDataHash;
exports.verifyDataIntegrity = verifyDataIntegrity;
const crypto_1 = __importDefault(require("crypto"));
// HIPAA-compliant encryption utilities
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
// Get encryption key from environment (must be 32 bytes)
function getEncryptionKey() {
    const key = process.env.PHI_ENCRYPTION_KEY;
    if (!key) {
        console.warn('PHI_ENCRYPTION_KEY not set, using development key');
        // Development fallback key - DO NOT use in production
        return Buffer.from('39d653047162e71ce614d357feffe818e6a2630602c29c0c85edb00401a56d67', 'hex');
    }
    // Convert hex string to buffer or derive from password
    if (key.length === 64) { // Hex string
        return Buffer.from(key, 'hex');
    }
    else {
        // Derive key from password using PBKDF2
        const salt = Buffer.from(process.env.PHI_ENCRYPTION_SALT || 'healthcare-system-salt', 'utf8');
        return crypto_1.default.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256');
    }
}
function encryptPHI(plaintext) {
    if (!plaintext || plaintext.trim() === '') {
        return null;
    }
    try {
        const key = getEncryptionKey();
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        // Use modern crypto methods for Node.js v22+
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        // Store as JSON string for database
        const result = {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
        return JSON.stringify(result);
    }
    catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt PHI data');
    }
}
function decryptPHI(encryptedData) {
    if (!encryptedData) {
        return null;
    }
    try {
        const key = getEncryptionKey();
        const data = JSON.parse(encryptedData);
        // Use modern crypto methods for Node.js v22+
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, Buffer.from(data.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
        let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Decryption failed:', error);
        // Log security incident
        console.warn('🚨 SECURITY: PHI decryption failed - possible tampering');
        return null;
    }
}
// Utility functions for common PHI fields
exports.PHIEncryption = {
    // Patient data encryption - only encrypt fields that exist in the schema
    encryptPatientData: (data) => ({
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
    decryptPatientData: (data) => ({
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
    encryptMedicalRecord: (data) => ({
        ...data,
        treatment_plan: data.treatment_plan ? encryptPHI(data.treatment_plan) : null,
        prescriptions: data.prescriptions ? encryptPHI(data.prescriptions) : null,
        lab_request: data.lab_request ? encryptPHI(data.lab_request) : null,
        notes: data.notes ? encryptPHI(data.notes) : null
    }),
    // Decrypt medical records
    decryptMedicalRecord: (data) => ({
        ...data,
        treatment_plan: decryptPHI(data.treatment_plan),
        prescriptions: decryptPHI(data.prescriptions),
        lab_request: decryptPHI(data.lab_request),
        notes: decryptPHI(data.notes)
    }),
    // Diagnosis encryption
    encryptDiagnosis: (data) => ({
        ...data,
        symptoms: data.symptoms ? encryptPHI(data.symptoms) : null,
        diagnosis: data.diagnosis ? encryptPHI(data.diagnosis) : null,
        notes: data.notes ? encryptPHI(data.notes) : null,
        prescribed_medications: data.prescribed_medications ? encryptPHI(data.prescribed_medications) : null,
        follow_up_plan: data.follow_up_plan ? encryptPHI(data.follow_up_plan) : null
    }),
    // Decrypt diagnosis
    decryptDiagnosis: (data) => ({
        ...data,
        symptoms: decryptPHI(data.symptoms),
        diagnosis: decryptPHI(data.diagnosis),
        notes: decryptPHI(data.notes),
        prescribed_medications: decryptPHI(data.prescribed_medications),
        follow_up_plan: decryptPHI(data.follow_up_plan)
    })
};
// Key rotation utility (for enhanced security)
async function rotateEncryptionKey() {
    // This would be implemented for production key rotation
    console.warn('Key rotation should be implemented for production use');
}
// Data integrity verification
function createDataHash(data) {
    return crypto_1.default.createHash('sha256').update(data).digest('hex');
}
function verifyDataIntegrity(data, hash) {
    const currentHash = createDataHash(data);
    return currentHash === hash;
}
