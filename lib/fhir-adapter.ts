/**
 * FHIR Adapter for Ihosi Healthcare Management System
 * Provides conversion between internal data models and FHIR R4 resources
 */

import { Patient, Doctor, Appointment } from '@prisma/client';
import { PHIEncryption } from './encryption';

// FHIR Resource Types
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier?: Identifier[];
  name: HumanName[];
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  telecom?: ContactPoint[];
  address?: Address[];
  active?: boolean;
}

export interface FHIRPractitioner {
  resourceType: 'Practitioner';
  id: string;
  identifier?: Identifier[];
  name: HumanName[];
  telecom?: ContactPoint[];
  address?: Address[];
  active?: boolean;
  qualification?: Qualification[];
}

export interface FHIROrganization {
  resourceType: 'Organization';
  id: string;
  name: string;
  identifier?: Identifier[];
  telecom?: ContactPoint[];
  address?: Address[];
  active?: boolean;
}

export interface FHIRAppointment {
  resourceType: 'Appointment';
  id: string;
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist';
  serviceType?: CodeableConcept[];
  start: string;
  end: string;
  participant: AppointmentParticipant[];
  created?: string;
  comment?: string;
}

// FHIR Data Types
export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary';
  type?: CodeableConcept;
  system?: string;
  value: string;
  period?: Period;
}

export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: Period;
}

export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface Period {
  start?: string;
  end?: string;
}

export interface Qualification {
  identifier?: Identifier[];
  code: CodeableConcept;
  period?: Period;
  issuer?: Reference;
}

export interface Reference {
  reference?: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

export interface AppointmentParticipant {
  type?: CodeableConcept[];
  actor?: Reference;
  required?: 'required' | 'optional' | 'information-only';
  status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
}

/**
 * FHIR Adapter Class
 */
export class FHIRAdapter {
  private baseUrl: string;
  private organizationId: string;

  constructor(baseUrl: string, organizationId: string) {
    this.baseUrl = baseUrl;
    this.organizationId = organizationId;
  }

  /**
   * Convert internal Patient to FHIR Patient resource
   */
  public patientToFHIR(patient: Patient): FHIRPatient {
    // Decrypt patient data first
    const decryptedPatient = PHIEncryption.decryptPatientData(patient);

    return {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [
        {
          use: 'usual',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR',
                display: 'Medical Record Number'
              }
            ]
          },
          value: patient.id
        }
      ],
      name: [
        {
          use: 'official',
          family: decryptedPatient.last_name,
          given: [decryptedPatient.first_name]
        }
      ],
      gender: this.mapGender(decryptedPatient.gender),
      birthDate: decryptedPatient.date_of_birth.toISOString().split('T')[0],
      telecom: [
        {
          system: 'phone',
          value: decryptedPatient.phone,
          use: 'mobile'
        },
        {
          system: 'email',
          value: decryptedPatient.email,
          use: 'home'
        }
      ],
      address: decryptedPatient.address ? [
        {
          use: 'home',
          type: 'physical',
          line: [decryptedPatient.address],
          city: 'Nairobi', // Default city - should be configurable
          country: 'KE'
        }
      ] : undefined,
      active: true
    };
  }

  /**
   * Convert internal Doctor to FHIR Practitioner resource
   */
  public practitionerToFHIR(doctor: Doctor): FHIRPractitioner {
    // Decrypt doctor data first
    const decryptedDoctor = PHIEncryption.decryptDoctorData(doctor);

    return {
      resourceType: 'Practitioner',
      id: doctor.id,
      identifier: [
        {
          use: 'official',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MD',
                display: 'Medical License Number'
              }
            ]
          },
          value: decryptedDoctor.license_number
        }
      ],
      name: [
        {
          use: 'official',
          family: decryptedDoctor.name.split(' ').pop() || '',
          given: decryptedDoctor.name.split(' ').slice(0, -1)
        }
      ],
      telecom: [
        {
          system: 'phone',
          value: decryptedDoctor.phone,
          use: 'work'
        },
        {
          system: 'email',
          value: decryptedDoctor.email,
          use: 'work'
        }
      ],
      address: decryptedDoctor.address ? [
        {
          use: 'work',
          type: 'physical',
          line: [decryptedDoctor.address],
          city: 'Nairobi',
          country: 'KE'
        }
      ] : undefined,
      active: true,
      qualification: [
        {
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                code: 'MD',
                display: 'Doctor of Medicine'
              }
            ],
            text: decryptedDoctor.qualifications
          },
          period: {
            start: new Date().toISOString().split('T')[0]
          }
        }
      ]
    };
  }

  /**
   * Convert internal Appointment to FHIR Appointment resource
   */
  public appointmentToFHIR(appointment: Appointment & { patient?: Patient; doctor?: Doctor }): FHIRAppointment {
    return {
      resourceType: 'Appointment',
      id: appointment.id.toString(),
      status: this.mapAppointmentStatus(appointment.status),
      serviceType: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/service-type',
              code: 'general',
              display: 'General Practice'
            }
          ]
        }
      ],
      start: new Date(appointment.appointment_date).toISOString(),
      end: new Date(new Date(appointment.appointment_date).getTime() + 30 * 60000).toISOString(), // 30 minutes default
      participant: [
        {
          actor: {
            reference: `Patient/${appointment.patient_id}`,
            display: appointment.patient ? `${appointment.patient.first_name} ${appointment.patient.last_name}` : undefined
          },
          status: 'accepted'
        },
        {
          actor: {
            reference: `Practitioner/${appointment.doctor_id}`,
            display: appointment.doctor ? `Dr. ${appointment.doctor.name}` : undefined
          },
          status: 'accepted'
        }
      ],
      created: appointment.created_at.toISOString(),
      comment: appointment.note || undefined
    };
  }

  /**
   * Create FHIR Organization resource
   */
  public createOrganization(): FHIROrganization {
    return {
      resourceType: 'Organization',
      id: this.organizationId,
      name: 'Ihosi Healthcare Management System',
      identifier: [
        {
          use: 'official',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'XX',
                display: 'Organization identifier'
              }
            ]
          },
          value: this.organizationId
        }
      ],
      telecom: [
        {
          system: 'phone',
          value: '+254-700-000-000',
          use: 'work'
        },
        {
          system: 'email',
          value: 'info@ihosi.com',
          use: 'work'
        }
      ],
      address: [
        {
          use: 'work',
          type: 'physical',
          line: ['Nairobi, Kenya'],
          city: 'Nairobi',
          country: 'KE'
        }
      ],
      active: true
    };
  }

  /**
   * Map internal gender to FHIR gender
   */
  private mapGender(gender: string): 'male' | 'female' | 'other' | 'unknown' {
    switch (gender.toLowerCase()) {
      case 'male':
      case 'm':
        return 'male';
      case 'female':
      case 'f':
        return 'female';
      case 'other':
      case 'o':
        return 'other';
      default:
        return 'unknown';
    }
  }

  /**
   * Map internal appointment status to FHIR status
   */
  private mapAppointmentStatus(status: string): FHIRAppointment['status'] {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'proposed';
      case 'SCHEDULED':
        return 'booked';
      case 'COMPLETED':
        return 'fulfilled';
      case 'CANCELLED':
        return 'cancelled';
      case 'NOSHOW':
        return 'noshow';
      default:
        return 'proposed';
    }
  }

  /**
   * Generate FHIR Bundle for multiple resources
   */
  public createBundle(resources: any[]): any {
    return {
      resourceType: 'Bundle',
      type: 'collection',
      total: resources.length,
      entry: resources.map(resource => ({
        resource,
        fullUrl: `${this.baseUrl}/${resource.resourceType}/${resource.id}`
      }))
    };
  }

  /**
   * Validate FHIR resource against basic structure
   */
  public validateResource(resource: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!resource.resourceType) {
      errors.push('Missing resourceType');
    }

    if (!resource.id) {
      errors.push('Missing id');
    }

    // Add more validation rules as needed

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * FHIR Client for external API calls
 */
export class FHIRClient {
  private baseUrl: string;
  private accessToken?: string;

  constructor(baseUrl: string, accessToken?: string) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  /**
   * Set access token for authenticated requests
   */
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Make authenticated FHIR API request
   */
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
      ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`FHIR API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search for FHIR resources
   */
  public async search<T>(resourceType: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams(params);
    const endpoint = `${resourceType}?${searchParams.toString()}`;
    
    return this.request<T>(endpoint);
  }

  /**
   * Create or update FHIR resource
   */
  public async createOrUpdate<T>(resource: any): Promise<T> {
    const endpoint = `${resource.resourceType}/${resource.id}`;
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(resource)
    });
  }

  /**
   * Delete FHIR resource
   */
  public async delete(resourceType: string, id: string): Promise<void> {
    const endpoint = `${resourceType}/${id}`;
    
    await this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Export utility functions
export const FHIRUtils = {
  /**
   * Generate FHIR ID from internal ID
   */
  generateFHIRId: (prefix: string, id: string): string => `${prefix}-${id}`,

  /**
   * Extract internal ID from FHIR ID
   */
  extractInternalId: (fhirId: string): string => fhirId.split('-').pop() || fhirId,

  /**
   * Format date for FHIR
   */
  formatFHIRDate: (date: Date): string => date.toISOString().split('T')[0],

  /**
   * Parse FHIR date to Date object
   */
  parseFHIRDate: (dateString: string): Date => new Date(dateString)
};
