import { PatientProfileData } from '@/types/patient-profile';

export class PatientProfileService {
  /**
   * Fetch patient data by ID
   */
  static async fetchPatientData(patientId: string): Promise<PatientProfileData> {
    const response = await fetch(`/api/doctor/patient/${patientId}`);
    const data = await response.json();
    
    if (response.status === 403 && data.consentRequired) {
      throw new Error('CONSENT_REQUIRED');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch patient data');
    }
    
    return data;
  }

  /**
   * Request consent from patient
   */
  static async requestConsent(patientId: string): Promise<void> {
    const response = await fetch(`/api/doctor/patient/${patientId}/request-consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to send consent request');
    }
  }

  /**
   * Validate patient data structure
   */
  static validatePatientData(data: any): data is PatientProfileData {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      typeof data.age === 'number' &&
      typeof data.gender === 'string' &&
      data.emergencyContact &&
      data.insurance &&
      data.vitals &&
      Array.isArray(data.allergies) &&
      Array.isArray(data.medications) &&
      Array.isArray(data.medicalHistory) &&
      Array.isArray(data.labResults) &&
      Array.isArray(data.imagingResults) &&
      Array.isArray(data.appointments) &&
      data.consentStatus &&
      data.admissionStatus
    );
  }

  /**
   * Transform raw patient data to PatientProfileData format
   */
  static transformPatientData(rawData: any): PatientProfileData {
    return {
      id: rawData.id,
      name: rawData.name,
      age: rawData.age,
      gender: rawData.gender,
      phone: rawData.phone || '',
      email: rawData.email || '',
      address: rawData.address || '',
      emergencyContact: rawData.emergencyContact || {
        name: 'Not provided',
        phone: '',
        relationship: 'Emergency Contact'
      },
      insurance: rawData.insurance || {
        provider: 'Not provided',
        policyNumber: 'N/A',
        groupNumber: 'N/A'
      },
      vitals: rawData.vitals || {
        bloodPressure: 'N/A',
        heartRate: 0,
        temperature: 0,
        weight: 0,
        height: 0,
        bmi: 0,
        oxygenSaturation: 0,
        lastUpdated: new Date().toISOString()
      },
      allergies: rawData.allergies || [],
      medications: rawData.medications || [],
      medicalHistory: rawData.medicalHistory || [],
      labResults: rawData.labResults || [],
      imagingResults: rawData.imagingResults || [],
      appointments: rawData.appointments || [],
      consentStatus: rawData.consentStatus || {
        hasConsent: false,
        dataCategories: [],
        medicalActions: [],
        expiresAt: new Date().toISOString(),
        restrictions: []
      },
      admissionStatus: rawData.admissionStatus || {
        isAdmitted: false,
        ward: '',
        bed: '',
        admissionDate: '',
        admissionReason: ''
      }
    };
  }

  /**
   * Get patient initials for avatar
   */
  static getPatientInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  /**
   * Format patient display info
   */
  static formatPatientInfo(patient: PatientProfileData) {
    return {
      initials: this.getPatientInitials(patient.name),
      displayInfo: `${patient.age} years • ${patient.gender}`,
      isAdmitted: patient.admissionStatus.isAdmitted,
    };
  }
}
