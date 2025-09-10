export interface PatientProfileData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
    bmi: number;
    oxygenSaturation: number;
    lastUpdated: string;
  };
  allergies: string[];
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescribedBy: string;
  }>;
  medicalHistory: Array<{
    condition: string;
    diagnosisDate: string;
    status: string;
    notes: string;
  }>;
  labResults: Array<{
    testName: string;
    result: string;
    normalRange: string;
    status: string;
    date: string;
    orderedBy: string;
  }>;
  imagingResults: Array<{
    type: string;
    result: string;
    date: string;
    orderedBy: string;
    status: string;
  }>;
  appointments: Array<{
    id: number;
    date: string;
    time: string;
    type: string;
    status: string;
    notes: string;
  }>;
  consentStatus: {
    hasConsent: boolean;
    dataCategories: string[];
    medicalActions: string[];
    expiresAt: string;
    restrictions: string[];
  };
  admissionStatus: {
    isAdmitted: boolean;
    ward: string;
    bed: string;
    admissionDate: string;
    admissionReason: string;
  };
}

export interface PatientProfileState {
  data: PatientProfileData | null;
  loading: boolean;
  error: string | null;
  consentRequired: boolean;
  showLimitedProfile: boolean;
}

export interface PatientProfileActions {
  fetchPatientData: () => Promise<void>;
  handleRequestConsent: () => Promise<void>;
  handleViewLimitedProfile: () => void;
  setActiveTab: (tab: string) => void;
}
