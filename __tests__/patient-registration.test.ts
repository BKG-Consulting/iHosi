import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PatientFormSchema } from '@/lib/schema';
import { PHIEncryption } from '@/lib/encryption';
import { createNewPatient, updatePatient } from '@/app/actions/patient';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  patient: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
}));

jest.mock('@clerk/nextjs/server', () => ({
  clerkClient: jest.fn(() => ({
    users: {
      createUser: jest.fn(),
      updateUser: jest.fn(),
    },
  })),
}));

jest.mock('@/lib/audit', () => ({
  logAudit: jest.fn(),
}));

describe('Patient Registration System', () => {
  const mockPatientData = {
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: new Date('1990-01-01'),
    gender: 'MALE' as const,
    phone: '1234567890', // Exactly 10 characters
    email: 'john.doe@example.com',
    address: '123 Main St',
    marital_status: 'single' as const,
    emergency_contact_name: 'Jane Doe',
    emergency_contact_number: '0987654321', // Exactly 10 characters
    relation: 'husband' as const, // Valid enum value
    blood_group: 'A+',
    allergies: 'Penicillin',
    medical_conditions: 'Hypertension',
    medical_history: 'None',
    insurance_provider: 'Blue Cross',
    insurance_number: 'BC123456',
    privacy_consent: true,
    service_consent: true,
    medical_consent: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks to default implementations
    const { patient } = require('@/lib/db');
    (patient.create as jest.Mock).mockResolvedValue({ id: 'user-123' });
    (patient.update as jest.Mock).mockResolvedValue({ id: 'user-123' });
    (patient.findUnique as jest.Mock).mockResolvedValue({ id: 'user-123' });
    
    const { clerkClient } = require('@clerk/nextjs/server');
    (clerkClient as jest.Mock).mockImplementation(() => ({
      users: {
        createUser: jest.fn().mockResolvedValue({ id: 'user-123' }),
        updateUser: jest.fn().mockResolvedValue({ id: 'user-123' }),
      },
    }));
  });

  describe('Data Validation', () => {
    it('should validate correct patient data', () => {
      const result = PatientFormSchema.safeParse(mockPatientData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = { ...mockPatientData, email: 'invalid-email' };
      const result = PatientFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('email'))).toBe(true);
      }
    });

    it('should reject invalid phone number', () => {
      const invalidData = { ...mockPatientData, phone: '123' }; // Too short
      const result = PatientFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const { first_name, ...incompleteData } = mockPatientData;
      const result = PatientFormSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });

    it('should accept valid date of birth', () => {
      const validDates = [
        new Date('1990-01-01'),
        new Date('2000-12-31'),
        new Date('1985-06-15'),
      ];

      validDates.forEach(date => {
        const data = { ...mockPatientData, date_of_birth: date };
        const result = PatientFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt sensitive PHI fields', () => {
      const encryptedData = PHIEncryption.encryptPatientData(mockPatientData);
      
      // Check that sensitive fields are encrypted
      expect(encryptedData.phone).not.toBe(mockPatientData.phone);
      expect(encryptedData.email).not.toBe(mockPatientData.email);
      expect(encryptedData.address).not.toBe(mockPatientData.address);
      expect(encryptedData.emergency_contact_number).not.toBe(mockPatientData.emergency_contact_number);
      expect(encryptedData.insurance_number).not.toBe(mockPatientData.insurance_number);
      expect(encryptedData.medical_history).not.toBe(mockPatientData.medical_history);
      expect(encryptedData.allergies).not.toBe(mockPatientData.allergies);
      expect(encryptedData.medical_conditions).not.toBe(mockPatientData.medical_conditions);

      // Check that non-sensitive fields remain unchanged
      expect(encryptedData.first_name).toBe(mockPatientData.first_name);
      expect(encryptedData.last_name).toBe(mockPatientData.last_name);
      expect(encryptedData.gender).toBe(mockPatientData.gender);
      expect(encryptedData.marital_status).toBe(mockPatientData.marital_status);
    });

    it('should handle null/undefined values gracefully', () => {
      const dataWithNulls = {
        ...mockPatientData,
        allergies: null,
        medical_conditions: undefined,
        insurance_number: '',
      };

      const encryptedData = PHIEncryption.encryptPatientData(dataWithNulls);
      expect(encryptedData.allergies).toBeNull();
      expect(encryptedData.medical_conditions).toBeNull();
      expect(encryptedData.insurance_number).toBeNull();
    });

    it('should produce valid JSON strings for encrypted data', () => {
      const encryptedData = PHIEncryption.encryptPatientData(mockPatientData);
      
      // All encrypted fields should be valid JSON strings
      const encryptedFields = [
        encryptedData.phone,
        encryptedData.email,
        encryptedData.address,
        encryptedData.emergency_contact_number,
        encryptedData.insurance_number,
        encryptedData.medical_history,
        encryptedData.allergies,
        encryptedData.medical_conditions,
      ];

      encryptedFields.forEach(field => {
        if (field) {
          expect(() => JSON.parse(field)).not.toThrow();
          const parsed = JSON.parse(field);
          expect(parsed).toHaveProperty('encrypted');
          expect(parsed).toHaveProperty('iv');
          expect(parsed).toHaveProperty('tag');
        }
      });
    });
  });

  describe('Data Decryption', () => {
    it('should decrypt encrypted data back to original values', () => {
      const encryptedData = PHIEncryption.encryptPatientData(mockPatientData);
      const decryptedData = PHIEncryption.decryptPatientData(encryptedData);

      // Check that decrypted values match original
      expect(decryptedData.phone).toBe(mockPatientData.phone);
      expect(decryptedData.email).toBe(mockPatientData.email);
      expect(decryptedData.address).toBe(mockPatientData.address);
      expect(decryptedData.emergency_contact_number).toBe(mockPatientData.emergency_contact_number);
      expect(decryptedData.insurance_number).toBe(mockPatientData.insurance_number);
      expect(decryptedData.medical_history).toBe(mockPatientData.medical_history);
      expect(decryptedData.allergies).toBe(mockPatientData.allergies);
      expect(decryptedData.medical_conditions).toBe(mockPatientData.medical_conditions);
    });

    it('should handle null/undefined encrypted values', () => {
      const dataWithNulls = {
        ...mockPatientData,
        phone: null,
        email: undefined,
        allergies: null,
      };

      const decryptedData = PHIEncryption.decryptPatientData(dataWithNulls);
      expect(decryptedData.phone).toBeNull();
      expect(decryptedData.email).toBeNull();
      expect(decryptedData.allergies).toBeNull();
    });

    it('should handle corrupted encrypted data gracefully', () => {
      const corruptedData = {
        ...mockPatientData,
        phone: 'invalid-encrypted-data',
        email: '{"invalid": "json"}',
      };

      const decryptedData = PHIEncryption.decryptPatientData(corruptedData);
      // Should return null for corrupted data
      expect(decryptedData.phone).toBeNull();
      expect(decryptedData.email).toBeNull();
    });
  });

  describe('Server Actions', () => {
    it('should handle test calls correctly', async () => {
      const testData = { test: true };
      const result = await createNewPatient(testData, 'test-id');
      
      expect(result).toEqual({
        success: true,
        error: false,
        msg: 'Test successful'
      });
    });

    it('should validate data before processing', async () => {
      const invalidData = { ...mockPatientData, email: 'invalid-email' };
      const result = await createNewPatient(invalidData, 'user-123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(true);
      expect(result.msg).toContain('Validation failed');
    });

    it('should handle date conversion correctly', async () => {
      const dataWithStringDate = {
        ...mockPatientData,
        date_of_birth: '1990-01-01T00:00:00.000Z'
      };

      // Mock successful database operation
      const { patient } = require('@/lib/db');
      patient.create.mockResolvedValue({ id: 'user-123' });

      const result = await createNewPatient(dataWithStringDate, 'user-123');
      
      // Should not fail due to date validation
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { patient } = require('@/lib/db');
      (patient.create as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const result = await createNewPatient(mockPatientData, 'user-123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(true);
      expect(result.msg).toContain('Database connection failed');
    });

    it('should handle Clerk API errors gracefully', async () => {
      const { clerkClient } = require('@clerk/nextjs/server');
      (clerkClient as jest.Mock).mockImplementation(() => ({
        users: {
          createUser: jest.fn().mockRejectedValue(new Error('Clerk API failed')),
        },
      }));

      const result = await createNewPatient(mockPatientData, 'new-patient');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(true);
      expect(result.msg).toContain('Clerk API failed');
    });

    it('should handle encryption errors gracefully', async () => {
      // Mock encryption to fail
      jest.spyOn(PHIEncryption, 'encryptPatientData').mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      const result = await createNewPatient(mockPatientData, 'user-123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(true);
      expect(result.msg).toContain('Encryption failed');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency through encryption/decryption cycle', () => {
      const originalData = { ...mockPatientData };
      const encryptedData = PHIEncryption.encryptPatientData(originalData);
      const decryptedData = PHIEncryption.decryptPatientData(encryptedData);

      // All fields should be preserved
      Object.keys(originalData).forEach(key => {
        if (key === 'date_of_birth') {
          // Date objects need special handling
          expect((decryptedData as any)[key].getTime()).toBe((originalData as any)[key].getTime());
        } else if (['phone', 'email', 'address', 'emergency_contact_number', 'insurance_number', 'medical_history', 'allergies', 'medical_conditions'].includes(key)) {
          // Encrypted fields should be decrypted back to original
          expect((decryptedData as any)[key]).toBe((originalData as any)[key]);
        } else {
          // Non-encrypted fields should remain unchanged
          expect((decryptedData as any)[key]).toBe((originalData as any)[key]);
        }
      });
    });

    it('should handle special characters and unicode in encrypted fields', () => {
      const dataWithSpecialChars = {
        ...mockPatientData,
        address: '123 Main St, Apt #4B, New York, NY 10001',
        medical_history: 'Patient has a history of heart disease (ICD-10: I25.1)',
        allergies: 'Penicillin, Sulfa drugs, Latex',
      };

      const encryptedData = PHIEncryption.encryptPatientData(dataWithSpecialChars);
      const decryptedData = PHIEncryption.decryptPatientData(encryptedData);

      expect(decryptedData.address).toBe(dataWithSpecialChars.address);
      expect(decryptedData.medical_history).toBe(dataWithSpecialChars.medical_history);
      expect(decryptedData.allergies).toBe(dataWithSpecialChars.allergies);
    });
  });

  describe('Performance and Security', () => {
    it('should generate unique IVs for each encryption', () => {
      const encrypted1 = PHIEncryption.encryptPatientData(mockPatientData);
      const encrypted2 = PHIEncryption.encryptPatientData(mockPatientData);

      // Same data encrypted twice should produce different results
      expect(encrypted1.phone).not.toBe(encrypted2.phone);
      expect(encrypted1.email).not.toBe(encrypted2.email);
    });

    it('should handle large data efficiently', () => {
      const largeData = {
        ...mockPatientData,
        medical_history: 'A'.repeat(10000), // 10KB of data
        allergies: 'B'.repeat(5000), // 5KB of data
      };

      const startTime = Date.now();
      const encryptedData = PHIEncryption.encryptPatientData(largeData);
      const encryptionTime = Date.now() - startTime;

      const startDecryptTime = Date.now();
      const decryptedData = PHIEncryption.decryptPatientData(encryptedData);
      const decryptionTime = Date.now() - startDecryptTime;

      // Should complete within reasonable time (less than 100ms)
      expect(encryptionTime).toBeLessThan(100);
      expect(decryptionTime).toBeLessThan(100);

      // Data should be preserved
      expect(decryptedData.medical_history).toBe(largeData.medical_history);
      expect(decryptedData.allergies).toBe(largeData.allergies);
    });
  });
});
