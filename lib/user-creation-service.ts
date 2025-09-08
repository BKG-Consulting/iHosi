/**
 * User Creation Service for HIPAA Authentication System
 * Handles creation of users in the database with proper password hashing
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '@/lib/db';
import { generateRandomColor } from '@/utils';
import { logAudit } from '@/lib/audit';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  department?: string;
  license_number?: string;
  specialization?: string;
  experience_years?: number;
  languages?: string[];
  consultation_fee?: number;
  max_patients_per_day?: number;
  emergency_contact?: string;
  emergency_phone?: string;
  qualifications?: string;
}

export interface CreateUserResult {
  success: boolean;
  userId?: string;
  message?: string;
  error?: string;
}

export class UserCreationService {
  /**
   * Create a new doctor user
   */
  static async createDoctor(data: CreateUserData): Promise<CreateUserResult> {
    try {
      // Validate required fields
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        return {
          success: false,
          error: 'Missing required fields: email, password, firstName, lastName'
        };
      }

      // Check if email already exists
      const existingUser = await this.findUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: 'A user with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Generate unique ID
      const userId = crypto.randomUUID();

      // Create doctor record
      const doctor = await db.doctor.create({
        data: {
          id: userId,
          email: data.email.toLowerCase().trim(),
          name: `${data.firstName} ${data.lastName}`,
          phone: data.phone || '',
          address: data.address || '',
          specialization: data.specialization || 'General Medicine',
          license_number: data.license_number || '',
          department: data.department || null,
          department_id: data.department || null,
          emergency_contact: data.emergency_contact || '',
          emergency_phone: data.emergency_phone || '',
          qualifications: data.qualifications || '',
          experience_years: data.experience_years || 0,
          languages: data.languages || ['English'],
          consultation_fee: data.consultation_fee || 0,
          max_patients_per_day: data.max_patients_per_day || 20,
          preferred_appointment_duration: 30,
          password: hashedPassword,
          mfa_enabled: false,
          colorCode: generateRandomColor(),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Log audit
      await logAudit({
        action: 'CREATE',
        resourceType: 'DOCTOR',
        resourceId: userId,
        reason: 'Doctor user created',
        success: true,
        metadata: {
          userRole: 'DOCTOR',
          email: data.email,
          createdBy: 'admin' // This should be the actual admin user ID
        }
      });

      return {
        success: true,
        userId: userId,
        message: 'Doctor created successfully'
      };

    } catch (error) {
      console.error('Error creating doctor:', error);
      
      await logAudit({
        action: 'CREATE',
        resourceType: 'DOCTOR',
        resourceId: 'unknown',
        reason: 'Failed to create doctor user',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: 'Failed to create doctor. Please try again.'
      };
    }
  }

  /**
   * Create a new staff user
   */
  static async createStaff(data: CreateUserData): Promise<CreateUserResult> {
    try {
      // Validate required fields
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        return {
          success: false,
          error: 'Missing required fields: email, password, firstName, lastName'
        };
      }

      // Check if email already exists
      const existingUser = await this.findUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: 'A user with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Generate unique ID
      const userId = crypto.randomUUID();

      // Create staff record
      const staff = await db.staff.create({
        data: {
          id: userId,
          email: data.email.toLowerCase().trim(),
          name: `${data.firstName} ${data.lastName}`,
          phone: data.phone || '',
          address: data.address || '',
          role: data.role as any,
          license_number: data.license_number || '',
          department: data.department || '',
          department_id: data.department || null,
          password: hashedPassword,
          mfa_enabled: false,
          status: 'ACTIVE',
          colorCode: generateRandomColor(),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Log audit
      await logAudit({
        action: 'CREATE',
        resourceType: 'STAFF',
        resourceId: userId,
        reason: 'Staff user created',
        success: true,
        metadata: {
          userRole: data.role,
          email: data.email,
          createdBy: 'admin' // This should be the actual admin user ID
        }
      });

      return {
        success: true,
        userId: userId,
        message: 'Staff member created successfully'
      };

    } catch (error) {
      console.error('Error creating staff:', error);
      
      await logAudit({
        action: 'CREATE',
        resourceType: 'STAFF',
        resourceId: 'unknown',
        reason: 'Failed to create staff user',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: 'Failed to create staff member. Please try again.'
      };
    }
  }

  /**
   * Create a new patient user
   */
  static async createPatient(data: CreateUserData): Promise<CreateUserResult> {
    try {
      // Validate required fields
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        return {
          success: false,
          error: 'Missing required fields: email, password, firstName, lastName'
        };
      }

      // Check if email already exists
      const existingUser = await this.findUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: 'A user with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Generate unique ID
      const userId = crypto.randomUUID();

      // Create patient record
      const patient = await db.patient.create({
        data: {
          id: userId,
          email: data.email.toLowerCase().trim(),
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: new Date('1990-01-01'), // Default date, should be updated later
          gender: 'MALE', // Default gender, should be updated later
          phone: data.phone || '',
          marital_status: 'SINGLE', // Default status, should be updated later
          address: data.address || '',
          emergency_contact_name: 'Emergency Contact', // Default, should be updated later
          emergency_contact_number: data.phone || '', // Use phone as default
          relation: 'OTHER', // Default relation, should be updated later
          privacy_consent: true, // Default to true for registration
          service_consent: true, // Default to true for registration
          medical_consent: true, // Default to true for registration
          password: hashedPassword,
          mfa_enabled: false,
          colorCode: generateRandomColor(),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Log audit
      await logAudit({
        action: 'CREATE',
        resourceType: 'PATIENT',
        resourceId: userId,
        reason: 'Patient user created',
        success: true,
        metadata: {
          userRole: 'PATIENT',
          email: data.email,
          createdBy: 'admin' // This should be the actual admin user ID
        }
      });

      return {
        success: true,
        userId: userId,
        message: 'Patient created successfully'
      };

    } catch (error) {
      console.error('Error creating patient:', error);
      
      await logAudit({
        action: 'CREATE',
        resourceType: 'PATIENT',
        resourceId: 'unknown',
        reason: 'Failed to create patient user',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: 'Failed to create patient. Please try again.'
      };
    }
  }

  /**
   * Find user by email across all user tables
   */
  private static async findUserByEmail(email: string): Promise<any> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check in Patient table
    const patient = await db.patient.findUnique({
      where: { email: normalizedEmail }
    });
    if (patient) return patient;

    // Check in Doctor table
    const doctor = await db.doctor.findUnique({
      where: { email: normalizedEmail }
    });
    if (doctor) return doctor;

    // Check in Staff table
    const staff = await db.staff.findUnique({
      where: { email: normalizedEmail }
    });
    if (staff) return staff;

    return null;
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true };
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each required type
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
