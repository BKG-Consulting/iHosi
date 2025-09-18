import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * Comprehensive input sanitization and validation service
 * Protects against XSS, injection attacks, and data integrity issues
 */
export class InputSanitizer {
  /**
   * Sanitizes text input to prevent XSS attacks
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    }).trim();
  }

  /**
   * Sanitizes HTML content while preserving safe formatting
   */
  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  /**
   * Validates and sanitizes phone numbers
   */
  static validatePhoneNumber(phone: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, sanitized: '', error: 'Phone number is required' };
    }

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Validate format: +1XXXXXXXXXX or XXXXXXXXXX
    const phoneRegex = /^(\+?1?)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    
    if (!phoneRegex.test(cleaned)) {
      return { 
        isValid: false, 
        sanitized: cleaned, 
        error: 'Invalid phone number format. Use format: +1XXXXXXXXXX or XXXXXXXXXX' 
      };
    }

    return { isValid: true, sanitized: cleaned };
  }

  /**
   * Validates and sanitizes email addresses
   */
  static validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, sanitized: '', error: 'Email is required' };
    }

    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitized)) {
      return { 
        isValid: false, 
        sanitized, 
        error: 'Invalid email format' 
      };
    }

    // Check for common malicious patterns
    const maliciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /<script/i,
      /<iframe/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(sanitized))) {
      return { 
        isValid: false, 
        sanitized, 
        error: 'Email contains potentially malicious content' 
      };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validates and sanitizes names
   */
  static validateName(name: string, fieldName: string = 'Name'): { isValid: boolean; sanitized: string; error?: string } {
    if (!name || typeof name !== 'string') {
      return { isValid: false, sanitized: '', error: `${fieldName} is required` };
    }

    const sanitized = this.sanitizeText(name);
    
    if (sanitized.length < 2) {
      return { 
        isValid: false, 
        sanitized, 
        error: `${fieldName} must be at least 2 characters long` 
      };
    }

    if (sanitized.length > 50) {
      return { 
        isValid: false, 
        sanitized, 
        error: `${fieldName} must be less than 50 characters` 
      };
    }

    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(sanitized)) {
      return { 
        isValid: false, 
        sanitized, 
        error: `${fieldName} contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed` 
      };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validates and sanitizes addresses
   */
  static validateAddress(address: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!address || typeof address !== 'string') {
      return { isValid: false, sanitized: '', error: 'Address is required' };
    }

    const sanitized = this.sanitizeText(address);
    
    if (sanitized.length < 5) {
      return { 
        isValid: false, 
        sanitized, 
        error: 'Address must be at least 5 characters long' 
      };
    }

    if (sanitized.length > 500) {
      return { 
        isValid: false, 
        sanitized, 
        error: 'Address must be less than 500 characters' 
      };
    }

    // Check for potentially malicious content
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(sanitized))) {
      return { 
        isValid: false, 
        sanitized, 
        error: 'Address contains potentially malicious content' 
      };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validates date of birth
   */
  static validateDateOfBirth(dob: Date | string): { isValid: boolean; sanitized: Date | null; error?: string } {
    let date: Date;
    
    if (typeof dob === 'string') {
      date = new Date(dob);
    } else {
      date = dob;
    }

    if (isNaN(date.getTime())) {
      return { 
        isValid: false, 
        sanitized: null, 
        error: 'Invalid date format' 
      };
    }

    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    
    if (age < 0) {
      return { 
        isValid: false, 
        sanitized: null, 
        error: 'Date of birth cannot be in the future' 
      };
    }

    if (age > 150) {
      return { 
        isValid: false, 
        sanitized: null, 
        error: 'Date of birth is not realistic' 
      };
    }

    if (age < 0) {
      return { 
        isValid: false, 
        sanitized: null, 
        error: 'Date of birth cannot be in the future' 
      };
    }

    return { isValid: true, sanitized: date };
  }

  /**
   * Validates and sanitizes medical information
   */
  static validateMedicalInfo(info: string, fieldName: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!info || typeof info !== 'string') {
      return { isValid: true, sanitized: '' }; // Medical info is optional
    }

    const sanitized = this.sanitizeText(info);
    
    if (sanitized.length > 1000) {
      return { 
        isValid: false, 
        sanitized, 
        error: `${fieldName} must be less than 1000 characters` 
      };
    }

    // Check for potentially malicious content
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(sanitized))) {
      return { 
        isValid: false, 
        sanitized, 
        error: `${fieldName} contains potentially malicious content` 
      };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validates and sanitizes insurance information
   */
  static validateInsuranceInfo(info: string, fieldName: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!info || typeof info !== 'string') {
      return { isValid: true, sanitized: '' }; // Insurance info is optional
    }

    const sanitized = this.sanitizeText(info);
    
    if (sanitized.length > 100) {
      return { 
        isValid: false, 
        sanitized, 
        error: `${fieldName} must be less than 100 characters` 
      };
    }

    // Check for potentially malicious content
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(sanitized))) {
      return { 
        isValid: false, 
        sanitized, 
        error: `${fieldName} contains potentially malicious content` 
      };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Comprehensive validation for patient registration data
   */
  static validatePatientRegistrationData(data: any): {
    isValid: boolean;
    sanitizedData: any;
    errors: string[];
  } {
    const errors: string[] = [];
    const sanitizedData: any = {};

    // Validate first name
    const firstNameResult = this.validateName(data.first_name, 'First name');
    if (!firstNameResult.isValid) {
      errors.push(firstNameResult.error!);
    } else {
      sanitizedData.first_name = firstNameResult.sanitized;
    }

    // Validate last name
    const lastNameResult = this.validateName(data.last_name, 'Last name');
    if (!lastNameResult.isValid) {
      errors.push(lastNameResult.error!);
    } else {
      sanitizedData.last_name = lastNameResult.sanitized;
    }

    // Validate email
    const emailResult = this.validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.push(emailResult.error!);
    } else {
      sanitizedData.email = emailResult.sanitized;
    }

    // Validate phone
    const phoneResult = this.validatePhoneNumber(data.phone);
    if (!phoneResult.isValid) {
      errors.push(phoneResult.error!);
    } else {
      sanitizedData.phone = phoneResult.sanitized;
    }

    // Validate address
    const addressResult = this.validateAddress(data.address);
    if (!addressResult.isValid) {
      errors.push(addressResult.error!);
    } else {
      sanitizedData.address = addressResult.sanitized;
    }

    // Validate date of birth
    const dobResult = this.validateDateOfBirth(data.date_of_birth);
    if (!dobResult.isValid) {
      errors.push(dobResult.error!);
    } else {
      sanitizedData.date_of_birth = dobResult.sanitized;
    }

    // Validate emergency contact name
    const emergencyNameResult = this.validateName(data.emergency_contact_name, 'Emergency contact name');
    if (!emergencyNameResult.isValid) {
      errors.push(emergencyNameResult.error!);
    } else {
      sanitizedData.emergency_contact_name = emergencyNameResult.sanitized;
    }

    // Validate emergency contact phone
    const emergencyPhoneResult = this.validatePhoneNumber(data.emergency_contact_number);
    if (!emergencyPhoneResult.isValid) {
      errors.push(emergencyPhoneResult.error!);
    } else {
      sanitizedData.emergency_contact_number = emergencyPhoneResult.sanitized;
    }

    // Validate medical information (optional fields)
    if (data.allergies) {
      const allergiesResult = this.validateMedicalInfo(data.allergies, 'Allergies');
      if (!allergiesResult.isValid) {
        errors.push(allergiesResult.error!);
      } else {
        sanitizedData.allergies = allergiesResult.sanitized;
      }
    }

    if (data.medical_conditions) {
      const conditionsResult = this.validateMedicalInfo(data.medical_conditions, 'Medical conditions');
      if (!conditionsResult.isValid) {
        errors.push(conditionsResult.error!);
      } else {
        sanitizedData.medical_conditions = conditionsResult.sanitized;
      }
    }

    if (data.medical_history) {
      const historyResult = this.validateMedicalInfo(data.medical_history, 'Medical history');
      if (!historyResult.isValid) {
        errors.push(historyResult.error!);
      } else {
        sanitizedData.medical_history = historyResult.sanitized;
      }
    }

    if (data.insurance_provider) {
      const providerResult = this.validateInsuranceInfo(data.insurance_provider, 'Insurance provider');
      if (!providerResult.isValid) {
        errors.push(providerResult.error!);
      } else {
        sanitizedData.insurance_provider = providerResult.sanitized;
      }
    }

    if (data.insurance_number) {
      const numberResult = this.validateInsuranceInfo(data.insurance_number, 'Insurance number');
      if (!numberResult.isValid) {
        errors.push(numberResult.error!);
      } else {
        sanitizedData.insurance_number = numberResult.sanitized;
      }
    }

    // Copy other fields that don't need sanitization
    sanitizedData.gender = data.gender;
    sanitizedData.marital_status = data.marital_status;
    sanitizedData.relation = data.relation;
    sanitizedData.blood_group = data.blood_group;
    sanitizedData.privacy_consent = data.privacy_consent;
    sanitizedData.service_consent = data.service_consent;
    sanitizedData.medical_consent = data.medical_consent;

    return {
      isValid: errors.length === 0,
      sanitizedData,
      errors
    };
  }
}

/**
 * Enhanced Zod schema with sanitization
 */
export const SanitizedPatientFormSchema = z.object({
  first_name: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .refine((val) => InputSanitizer.validateName(val, 'First name').isValid, {
      message: "First name contains invalid characters"
    }),
  last_name: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .refine((val) => InputSanitizer.validateName(val, 'Last name').isValid, {
      message: "Last name contains invalid characters"
    }),
  email: z.string()
    .email("Invalid email format")
    .refine((val) => InputSanitizer.validateEmail(val).isValid, {
      message: "Email contains invalid content"
    }),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .refine((val) => InputSanitizer.validatePhoneNumber(val).isValid, {
      message: "Invalid phone number format"
    }),
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be less than 500 characters")
    .refine((val) => InputSanitizer.validateAddress(val).isValid, {
      message: "Address contains invalid content"
    }),
  date_of_birth: z.coerce.date()
    .refine((val) => InputSanitizer.validateDateOfBirth(val).isValid, {
      message: "Invalid date of birth"
    }),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
  marital_status: z.enum(
    ["married", "single", "divorced", "widowed", "separated"],
    { message: "Marital status is required." }
  ),
  emergency_contact_name: z.string()
    .min(2, "Emergency contact name is required.")
    .max(50, "Emergency contact name must be less than 50 characters")
    .refine((val) => InputSanitizer.validateName(val, 'Emergency contact name').isValid, {
      message: "Emergency contact name contains invalid characters"
    }),
  emergency_contact_number: z.string()
    .min(10, "Emergency contact phone must be at least 10 digits")
    .max(15, "Emergency contact phone must be less than 15 digits")
    .refine((val) => InputSanitizer.validatePhoneNumber(val).isValid, {
      message: "Invalid emergency contact phone format"
    }),
  relation: z.enum(["mother", "father", "husband", "wife", "spouse", "other"], {
    message: "Relation with contact person is required",
  }),
  blood_group: z.string().optional(),
  allergies: z.string().optional()
    .refine((val) => !val || InputSanitizer.validateMedicalInfo(val, 'Allergies').isValid, {
      message: "Allergies field contains invalid content"
    }),
  medical_conditions: z.string().optional()
    .refine((val) => !val || InputSanitizer.validateMedicalInfo(val, 'Medical conditions').isValid, {
      message: "Medical conditions field contains invalid content"
    }),
  medical_history: z.string().optional()
    .refine((val) => !val || InputSanitizer.validateMedicalInfo(val, 'Medical history').isValid, {
      message: "Medical history field contains invalid content"
    }),
  insurance_provider: z.string().optional()
    .refine((val) => !val || InputSanitizer.validateInsuranceInfo(val, 'Insurance provider').isValid, {
      message: "Insurance provider field contains invalid content"
    }),
  insurance_number: z.string().optional()
    .refine((val) => !val || InputSanitizer.validateInsuranceInfo(val, 'Insurance number').isValid, {
      message: "Insurance number field contains invalid content"
    }),
  privacy_consent: z.boolean()
    .refine((val) => val === true, {
      message: "You must agree to the privacy policy.",
    }),
  service_consent: z.boolean()
    .refine((val) => val === true, {
      message: "You must agree to the terms of service.",
    }),
  medical_consent: z.boolean()
    .refine((val) => val === true, {
      message: "You must agree to the medical consent.",
    }),
});


