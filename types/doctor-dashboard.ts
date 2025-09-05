// Doctor Dashboard Type Definitions
export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  department?: string;
  phone: string;
  address: string;
  img?: string;
  colorCode?: string;
  availability_status?: string;
  working_days?: WorkingDay[];
  created_at: Date;
  updated_at: Date;
}

export interface WorkingDay {
  id: number;
  doctor_id: string;
  day: string;
  start_time: string;
  close_time: string;
  is_working: boolean;
  break_start?: string;
  break_end?: string;
  max_appointments?: number;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: Date;
  gender: 'MALE' | 'FEMALE';
  img?: string;
  colorCode?: string;
  last_visit?: Date;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Appointment {
  id: number;
  patient_id: string;
  doctor_id: string;
  appointment_date: Date;
  time: string;
  status: 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  type: string;
  note?: string;
  patient: Patient;
  doctor: Doctor;
  created_at: Date;
  updated_at: Date;
}

export interface UrgentAlert {
  id: number;
  type: 'CRITICAL' | 'URGENT' | 'WARNING';
  message: string;
  time: string;
  patientId?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isRead: boolean;
}

export interface PatientAlert {
  id: number;
  patient: string;
  type: 'MEDICATION' | 'FOLLOW_UP' | 'LAB_RESULTS' | 'APPOINTMENT';
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: Date;
  isResolved: boolean;
}

export interface DashboardAnalytics {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
  cancellationRate: number;
  averageAppointmentDuration: number;
  mostBusyDay?: Date;
  appointmentTrends: Array<{
    date: Date;
    count: number;
  }>;
  revenue?: number;
}

export interface VitalSigns {
  heartRate: number;
  temperature: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  weight: number;
  height?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  recordedAt: Date;
  patientId: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  result: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  date: Date;
  notes?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  disabled?: boolean;
}

export interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
  badge?: number;
}

export interface DashboardState {
  activeTab: string;
  urgentAlerts: UrgentAlert[];
  patientAlerts: PatientAlert[];
  todaySchedule: Appointment[];
  isLoading: boolean;
  error?: string;
}

export interface DashboardProps {
  doctor: Doctor;
  appointments: Appointment[];
  patients: Patient[];
  analytics: DashboardAnalytics;
  onTabChange?: (tabId: string) => void;
  onAlertAction?: (alertId: number, action: string) => void;
  onAppointmentAction?: (appointmentId: number, action: string) => void;
}

