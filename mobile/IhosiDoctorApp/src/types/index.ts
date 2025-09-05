// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'ADMIN' | 'NURSE' | 'PATIENT';
  imageUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  phone?: string;
  workingDays: WorkingDay[];
  availabilityStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'BUSY' | 'ON_BREAK' | 'ON_LEAVE';
}

export interface WorkingDay {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

// Appointment Types
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  time: string;
  type: string;
  status: 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  note?: string;
  patient: Patient;
  doctor: Doctor;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE';
  img?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Dashboard: undefined;
  Appointments: undefined;
  Calendar: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  appointment?: Appointment;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'APPOINTMENT' | 'REMINDER' | 'CANCELLATION' | 'SYSTEM';
  data?: any;
  timestamp: string;
  read: boolean;
}

