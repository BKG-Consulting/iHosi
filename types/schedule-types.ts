// Comprehensive TypeScript types for schedule management system
// Based on actual Prisma schema implementation

// Day of week type alias
export type DayOfWeekType = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Prisma-based WorkingDay interface matching schema exactly
export interface WorkingDay {
  id: number;
  doctor_id: string;
  day: DayOfWeekType;
  day_of_week: string;
  startTime: string; // Format: "HH:MM"
  start_time: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  end_time: string;   // Format: "HH:MM"
  isWorking: boolean;
  is_working: boolean;
  breakStart?: string | null;
  break_start_time?: string | null;
  breakEnd?: string | null;
  break_end_time?: string | null;
  maxAppointments: number;
  max_appointments: number;
  appointmentDuration: number;
  appointment_duration: number;
  bufferTime: number;
  buffer_time: number;
  recurrenceType: string;
  recurrence_type: string;
  recurrence_pattern?: Record<string, unknown> | null;
  effectiveFrom?: Date | null;
  effective_from?: Date | null;
  effectiveUntil?: Date | null;
  effective_until?: Date | null;
  timezone: string;
  isTemplate: boolean;
  is_template: boolean;
  created_at: Date;
  updated_at: Date;
}

// Frontend-friendly WorkingDay interface for components
export interface WorkingDayConfig {
  id?: number;
  day: DayOfWeekType;
  isWorking: boolean;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  breakStart?: string;
  breakEnd?: string;
  maxAppointments: number;
  appointmentDuration?: number;
  bufferTime?: number;
  timezone?: string;
  recurrenceType?: string;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
  isTemplate?: boolean;
}

// Prisma-based Appointment interface matching schema exactly
export interface Appointment {
  id: number;
  patient_id: string;
  doctor_id: string;
  appointment_date: Date;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED';
  type: string;
  note?: string | null;
  service_id?: number | null;
  reason?: string | null;
  calendar_event_id?: string | null;
  calendar_synced_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  // Relations
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    img?: string;
    colorCode?: string;
  };
  doctor?: {
    id: string;
    name: string;
    specialization: string;
    email: string;
    phone: string;
    img?: string;
    colorCode?: string;
  };
}

export interface ScheduleTemplate {
  id?: number;
  name: string;
  description?: string;
  templateType: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  isDefault: boolean;
  workingDays: WorkingDayConfig[];
  recurrenceRules?: any;
  timezone: string;
}

export interface ScheduleException {
  id?: number;
  exceptionType: 'HOLIDAY' | 'VACATION' | 'SICK_LEAVE' | 'EMERGENCY' | 'CUSTOM';
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  isRecurring: boolean;
  recurrencePattern?: any;
  affectsAppointments: boolean;
}

export interface CalendarIntegration {
  id?: number;
  provider: 'GOOGLE' | 'OUTLOOK' | 'APPLE' | 'CUSTOM';
  providerId: string;
  calendarId: string;
  syncEnabled: boolean;
  syncDirection: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
  lastSync?: Date;
  syncToken?: string;
  credentials?: any;
  settings?: any;
}

export interface ScheduleConflict {
  id?: number;
  conflictType: 'DOUBLE_BOOKING' | 'OVERLAP' | 'EXCEPTION_VIOLATION' | 'CALENDAR_SYNC';
  appointmentId?: number;
  conflictingAppointmentId?: number;
  conflictStart: Date;
  conflictEnd: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'RESOLVED' | 'IGNORED';
  resolutionMethod?: 'AUTO_RESCHEDULE' | 'MANUAL_RESOLUTION' | 'CANCEL_APPOINTMENT';
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ScheduleAnalytics {
  id?: number;
  date: Date;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  averageAppointmentDuration?: number;
  utilizationRate?: number;
  patientSatisfactionScore?: number;
  aiOptimizationScore?: number;
  peakHours?: any;
  lowUtilizationHours?: any;
  recommendations?: any;
}

export interface ScheduleNotification {
  id?: number;
  appointmentId?: number;
  notificationType: 'APPOINTMENT_REMINDER' | 'SCHEDULE_CONFLICT' | 'EXCEPTION_ALERT' | 'SYNC_ERROR';
  title: string;
  message: string;
  scheduledFor: Date;
  isSent: boolean;
  sentAt?: Date;
  deliveryMethod: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  metadata?: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Specific API response types for scheduling
export interface ScheduleApiResponse {
  success: boolean;
  data?: {
    workingDays: WorkingDay[];
    doctorId: string;
    hasSchedule: boolean;
    totalWorkingDays: number;
  };
  message?: string;
  error?: string;
}

export interface AvailabilityApiResponse {
  success: boolean;
  data?: {
    doctorId: string;
    status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
    hasWorkingSchedule: boolean;
    workingDays: number;
  };
  message?: string;
  error?: string;
}

export interface TimeSlotApiResponse {
  success: boolean;
  data?: {
    slots: TimeSlot[];
    date: string;
    doctorId: string;
    totalSlots: number;
    availableSlots: number;
  };
  message?: string;
  error?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  duration?: number;
  isAvailable: boolean;
  isBreak?: boolean;
  isWorking?: boolean;
  appointment?: Appointment;
  reason?: string;
}

export interface ScheduleData {
  workingHours: WorkingDayConfig[];
  templates: ScheduleTemplate[];
  exceptions: ScheduleException[];
  integrations: CalendarIntegration[];
  conflicts: ScheduleConflict[];
  analytics: ScheduleAnalytics[];
  notifications: ScheduleNotification[];
  recurrenceType?: string;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
  customPattern?: string;
  isTemplate?: boolean;
}

// Form Validation Types
export interface WorkingDayFormData {
  day: DayOfWeekType;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments: number;
  appointmentDuration?: number;
  bufferTime?: number;
  timezone?: string;
}

export interface ScheduleExceptionFormData {
  exceptionType: ScheduleException['exceptionType'];
  title: string;
  description?: string;
  startDate: string; // ISO string for form handling
  endDate: string;   // ISO string for form handling
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  isRecurring: boolean;
  affectsAppointments: boolean;
}

// Error Types
export interface ScheduleError {
  field?: string;
  message: string;
  code?: string;
}

export interface ValidationError {
  errors: ScheduleError[];
  message: string;
}

// Utility Types
export type DayOfWeek = DayOfWeekType;
export type ExceptionType = ScheduleException['exceptionType'];
export type ConflictType = ScheduleConflict['conflictType'];
export type NotificationType = ScheduleNotification['notificationType'];
export type ProviderType = CalendarIntegration['provider'];
