// Comprehensive Scheduling System Type Definitions
import { 
  AppointmentStatus, 
  AvailabilityStatus, 
  LeaveType, 
  LeaveStatus, 
  AvailabilityUpdateType,
  JOBTYPE 
} from "@prisma/client";

// ===== CORE SCHEDULING TYPES =====

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  isAvailable: boolean;
  isBreak?: boolean;
  maxAppointments?: number;
  currentAppointments?: number;
}

export interface DaySchedule {
  day: string; // "Monday", "Tuesday", etc.
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments?: number;
  timeSlots: TimeSlot[];
}

export interface WeeklySchedule {
  doctorId: string;
  weekStart: Date;
  weekEnd: Date;
  days: DaySchedule[];
  totalWorkingHours: number;
  totalAvailableSlots: number;
}

// ===== APPOINTMENT TYPES =====

export interface AppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  time: string;
  type: string;
  reason?: string;
  note?: string;
  serviceId?: number;
  duration?: number; // in minutes
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}

export interface RecurringPattern {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number; // every N days/weeks/months
  endDate?: Date;
  maxOccurrences?: number;
  daysOfWeek?: string[]; // for weekly patterns
  dayOfMonth?: number;   // for monthly patterns
}

export interface AppointmentDetails {
  id: number;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  time: string;
  status: AppointmentStatus;
  type: string;
  note?: string;
  reason?: string;
  serviceId?: number;
  duration: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  calendarEventId?: string;
  calendarSyncedAt?: Date;
  
  // Relations
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    img?: string;
    colorCode?: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    img?: string;
    colorCode?: string;
  };
  service?: {
    id: number;
    service_name: string;
    duration_minutes: number;
    price: number;
  };
  
  created_at: Date;
  updated_at: Date;
}

// ===== AVAILABILITY TYPES =====

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  status: AvailabilityStatus;
  workingDays: WorkingDayDetails[];
  leaveRequests: LeaveRequestDetails[];
  availabilityUpdates: AvailabilityUpdateDetails[];
  currentSchedule: WeeklySchedule;
  nextAvailableSlot?: Date;
  isCurrentlyAvailable: boolean;
}

export interface WorkingDayDetails {
  id: number;
  doctorId: string;
  day: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments?: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequestDetails {
  id: string;
  doctorId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AvailabilityUpdateDetails {
  id: string;
  doctorId: string;
  updateType: AvailabilityUpdateType;
  effectiveDate: Date;
  endDate?: Date;
  reason?: string;
  isTemporary: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===== SCHEDULING CONFLICTS =====

export interface SchedulingConflict {
  type: 'DOUBLE_BOOKING' | 'UNAVAILABLE_TIME' | 'BREAK_TIME' | 'LEAVE_PERIOD' | 'CAPACITY_EXCEEDED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  conflictingAppointmentId?: number;
  conflictingTimeSlot?: TimeSlot;
  suggestedAlternatives?: TimeSlot[];
  canAutoResolve: boolean;
}

export interface ConflictResolution {
  conflictId: string;
  resolution: 'ACCEPT' | 'RESCHEDULE' | 'CANCEL' | 'WAITLIST';
  newTimeSlot?: TimeSlot;
  notes?: string;
  resolvedBy: string;
  resolvedAt: Date;
}

// ===== CALENDAR INTEGRATION =====

export interface CalendarIntegration {
  id: string;
  doctorId: string;
  provider: 'GOOGLE_CALENDAR' | 'OUTLOOK' | 'APPLE_CALENDAR';
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  isActive: boolean;
  lastSyncAt?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CalendarEvent {
  id: string;
  integrationId: string;
  providerEventId: string;
  appointmentId?: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  attendees?: string[];
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  eventType: 'APPOINTMENT' | 'BREAK' | 'BLOCKED' | 'PERSONAL';
  lastSyncedAt: Date;
  created_at: Date;
  updated_at: Date;
}

// ===== NOTIFICATIONS =====

export interface ScheduleNotification {
  id: string;
  doctorId: string;
  appointmentId?: number;
  type: 'REMINDER' | 'CONFIRMATION' | 'CANCELLATION' | 'RESCHEDULE' | 'BREAK_REMINDER';
  recipientType: 'PATIENT' | 'DOCTOR' | 'BOTH';
  sendTime: Date;
  isSent: boolean;
  sentAt?: Date;
  deliveryStatus: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  templateId?: string;
  customMessage?: string;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationTemplate {
  id: string;
  type: 'REMINDER' | 'CONFIRMATION' | 'CANCELLATION' | 'RESCHEDULE';
  subject: string;
  body: string;
  isActive: boolean;
  variables: string[]; // Available template variables
  created_at: Date;
  updated_at: Date;
}

// ===== SCHEDULING RULES =====

export interface SchedulingRule {
  id: string;
  doctorId: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number; // Higher number = higher priority
  
  // Time constraints
  minAdvanceBooking?: number; // hours
  maxAdvanceBooking?: number; // days
  workingHoursOnly?: boolean;
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;
  
  // Duration constraints
  minAppointmentDuration?: number; // minutes
  maxAppointmentDuration?: number; // minutes
  defaultDuration?: number; // minutes
  
  // Capacity constraints
  maxAppointmentsPerDay?: number;
  maxAppointmentsPerSlot?: number;
  bufferTimeBetweenAppointments?: number; // minutes
  
  // Patient constraints
  allowNewPatients?: boolean;
  allowExistingPatients?: boolean;
  requireInsuranceVerification?: boolean;
  
  // Service constraints
  allowedServiceTypes?: string[];
  requiredServices?: number[];
  
  created_at: Date;
  updated_at: Date;
}

// ===== SCHEDULING ANALYTICS =====

export interface SchedulingMetrics {
  doctorId: string;
  period: {
    start: Date;
    end: Date;
  };
  
  // Appointment metrics
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  rescheduledAppointments: number;
  
  // Time metrics
  totalScheduledHours: number;
  totalWorkingHours: number;
  utilizationRate: number; // percentage
  
  // Revenue metrics
  totalRevenue: number;
  averageAppointmentValue: number;
  
  // Patient metrics
  uniquePatients: number;
  newPatients: number;
  returningPatients: number;
  
  // Efficiency metrics
  averageAppointmentDuration: number;
  averageWaitTime: number;
  onTimeStartRate: number; // percentage
  
  // Availability metrics
  totalAvailableSlots: number;
  bookedSlots: number;
  bookingRate: number; // percentage
  peakHours: string[];
  lowUtilizationHours: string[];
}

// ===== API REQUEST/RESPONSE TYPES =====

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO string
  time: string;
  type: string;
  reason?: string;
  note?: string;
  serviceId?: number;
  duration?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}

export interface UpdateAppointmentRequest {
  appointmentId: number;
  appointmentDate?: string;
  time?: string;
  type?: string;
  reason?: string;
  note?: string;
  serviceId?: number;
  duration?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: AppointmentStatus;
}

export interface RescheduleAppointmentRequest {
  appointmentId: number;
  newAppointmentDate: string;
  newTime: string;
  reason: string;
  notifyPatient?: boolean;
  notifyDoctor?: boolean;
}

export interface CancelAppointmentRequest {
  appointmentId: number;
  reason: string;
  refundAmount?: number;
  notifyPatient?: boolean;
  notifyDoctor?: boolean;
}

export interface GetAvailabilityRequest {
  doctorId: string;
  startDate: string;
  endDate: string;
  includeBreaks?: boolean;
  includeLeave?: boolean;
  serviceId?: number;
  duration?: number;
}

export interface GetAvailableSlotsRequest {
  doctorId: string;
  date: string;
  duration?: number;
  serviceId?: number;
  excludeAppointmentId?: number;
}

export interface BulkScheduleRequest {
  doctorId: string;
  appointments: Omit<CreateAppointmentRequest, 'doctorId'>[];
  validateConflicts?: boolean;
  sendNotifications?: boolean;
}

// ===== API RESPONSE TYPES =====

export interface SchedulingApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  conflicts?: SchedulingConflict[];
  warnings?: string[];
}

export interface AppointmentListResponse {
  appointments: AppointmentDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: AppointmentStatus[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    doctorId?: string;
    patientId?: string;
  };
}

export interface AvailabilityResponse {
  doctorId: string;
  availability: DoctorAvailability;
  availableSlots: TimeSlot[];
  conflicts: SchedulingConflict[];
  nextAvailableSlot?: Date;
}

// ===== UI COMPONENT TYPES =====

export interface CalendarViewProps {
  doctorId: string;
  view: 'day' | 'week' | 'month';
  date: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: AppointmentDetails) => void;
  onTimeSlotClick: (timeSlot: TimeSlot, date: Date) => void;
  onAppointmentCreate: (appointment: CreateAppointmentRequest) => void;
  onAppointmentUpdate: (appointment: UpdateAppointmentRequest) => void;
  onAppointmentDelete: (appointmentId: number) => void;
}

export interface AppointmentFormProps {
  appointment?: AppointmentDetails;
  doctorId: string;
  patientId?: string;
  onSubmit: (appointment: CreateAppointmentRequest | UpdateAppointmentRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  errors?: string[];
}

export interface AvailabilityManagerProps {
  doctorId: string;
  onScheduleUpdate: (schedule: WeeklySchedule) => void;
  onLeaveRequest: (leaveRequest: Omit<LeaveRequestDetails, 'id' | 'created_at' | 'updated_at'>) => void;
  onAvailabilityUpdate: (update: Omit<AvailabilityUpdateDetails, 'id' | 'created_at' | 'updated_at'>) => void;
}

// ===== UTILITY TYPES =====

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type TimeFormat = '12h' | '24h';

export type AppointmentType = 
  | 'CONSULTATION' 
  | 'FOLLOW_UP' 
  | 'EMERGENCY' 
  | 'ROUTINE_CHECKUP' 
  | 'SPECIALIST_REFERRAL' 
  | 'LAB_WORK' 
  | 'IMAGING' 
  | 'PROCEDURE' 
  | 'THERAPY' 
  | 'VACCINATION';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

// ===== CONSTANTS =====

export const APPOINTMENT_TYPES: AppointmentType[] = [
  'CONSULTATION',
  'FOLLOW_UP', 
  'EMERGENCY',
  'ROUTINE_CHECKUP',
  'SPECIALIST_REFERRAL',
  'LAB_WORK',
  'IMAGING',
  'PROCEDURE',
  'THERAPY',
  'VACCINATION'
];

export const PRIORITY_LEVELS: PriorityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const DEFAULT_APPOINTMENT_DURATION = 30; // minutes
export const DEFAULT_BUFFER_TIME = 15; // minutes between appointments
export const MAX_ADVANCE_BOOKING_DAYS = 90;
export const MIN_ADVANCE_BOOKING_HOURS = 2;

// ===== ADDITIONAL TYPES FOR SCHEDULE SETUP =====

export interface WorkingHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments?: number;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  workingHours: WorkingHours[];
  appointmentDuration: number;
  bufferTime: number;
  isDefault?: boolean;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'CONFERENCE' | 'OTHER';
}

export interface ScheduleConflict {
  id: string;
  type: 'OVERLAP' | 'BREAK_VIOLATION' | 'WORKING_HOURS' | 'LEAVE_CONFLICT' | 'DOUBLE_BOOKING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedSlots: string[];
  suggestedFix: string;
  autoFixable: boolean;
}

export interface DetailedTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
  type: 'REGULAR' | 'EMERGENCY' | 'FOLLOW_UP' | 'CONSULTATION';
  price?: number;
  notes?: string;
}

