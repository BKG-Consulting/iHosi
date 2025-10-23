/**
 * Enterprise-Grade Validation Service for Scheduling
 * 
 * Provides comprehensive validation with business rules, constraints,
 * and real-time validation for the scheduling system.
 */

import { z } from 'zod';
import { WorkingDay, ScheduleException, CalendarIntegration, DayOfWeekType } from '@/types/schedule-types';
import { ScheduleServiceError, createValidationError } from './error-handler';

// Validation Rules Configuration
export interface ValidationRules {
  maxAppointmentsPerDay: number;
  minAppointmentDuration: number;
  maxAppointmentDuration: number;
  minBufferTime: number;
  maxBufferTime: number;
  maxBreakDuration: number;
  minWorkingHours: number;
  maxWorkingHours: number;
  supportedTimezones: string[];
  businessHours: {
    earliestStart: string;
    latestEnd: string;
  };
  breakRules: {
    minDuration: number;
    maxDuration: number;
    maxBreaksPerDay: number;
  };
}

// Default validation rules
const DEFAULT_RULES: ValidationRules = {
  maxAppointmentsPerDay: 32,
  minAppointmentDuration: 15,
  maxAppointmentDuration: 480,
  minBufferTime: 0,
  maxBufferTime: 60,
  maxBreakDuration: 120,
  minWorkingHours: 1,
  maxWorkingHours: 16,
  supportedTimezones: ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
  businessHours: {
    earliestStart: '06:00',
    latestEnd: '22:00'
  },
  breakRules: {
    minDuration: 15,
    maxDuration: 120,
    maxBreaksPerDay: 3
  }
};

// Time validation utilities
const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
const dayOfWeekSchema = z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);

export class ValidationService {
  private rules: ValidationRules;

  constructor(rules: Partial<ValidationRules> = {}) {
    this.rules = { ...DEFAULT_RULES, ...rules };
  }

  /**
   * Helper to get day name from both camelCase (day) and snake_case (day_of_week) formats
   */
  private getDayName(day: any): string | undefined {
    return day.day || day.day_of_week;
  }

  /**
   * Validate working days with comprehensive business rules
   */
  public async validateWorkingDays(
    workingDays: WorkingDay[], 
    doctorId: string,
    context: Record<string, any> = {}
  ): Promise<{ isValid: boolean; errors: ScheduleServiceError[] }> {
    const errors: ScheduleServiceError[] = [];

    try {
      console.log('🔍 Validating working days:', {
        doctorId,
        count: workingDays?.length,
        days: workingDays?.map(d => d.day),
        sample: workingDays?.[0],
      });

      // Basic validation - check if we have working days
      if (!workingDays || workingDays.length === 0) {
        errors.push(createValidationError(
          'workingDays',
          'At least one working day must be configured',
          { doctorId, ...context }
        ));
        return { isValid: false, errors };
      }

      // Check for duplicate days (should have exactly 7 days, one for each day of the week)
      // Handle both camelCase (day) and snake_case (day_of_week) formats
      const days = workingDays.map(day => this.getDayName(day));
      const uniqueDays = new Set(days);
      const expectedDays: DayOfWeekType[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      console.log('🔍 Checking for duplicates:', {
        daysLength: days.length,
        uniqueDaysSize: uniqueDays.size,
        days: days,
        uniqueDaysArray: Array.from(uniqueDays),
        hasDuplicates: days.length !== uniqueDays.size,
      });
      
      if (days.length !== 7) {
        errors.push(createValidationError(
          'workingDays',
          'Schedule must include all 7 days of the week',
          { doctorId, ...context }
        ));
      } else if (days.length !== uniqueDays.size) {
        console.error('❌ DUPLICATES DETECTED:', {
          days,
          uniqueDays: Array.from(uniqueDays),
          duplicates: days.filter((day, index) => days.indexOf(day) !== index),
        });
        errors.push(createValidationError(
          'workingDays',
          'Duplicate days found in working schedule',
          { doctorId, ...context }
        ));
      } else {
        // Check if all expected days are present
        const missingDays = expectedDays.filter(day => !days.includes(day));
        if (missingDays.length > 0) {
          errors.push(createValidationError(
            'workingDays',
            `Missing days: ${missingDays.join(', ')}`,
            { doctorId, ...context }
          ));
        }
      }

      // Validate each working day
      workingDays.forEach((day, index) => {
        const dayName = this.getDayName(day);
        const isWorking = (day as any).isWorking ?? (day as any).is_working;
        const startTime = (day as any).startTime || (day as any).start_time;
        const endTime = (day as any).endTime || (day as any).end_time;
        const maxAppointments = (day as any).maxAppointments || (day as any).max_appointments;

        if (isWorking) {
          // Basic time validation
          if (!startTime || !endTime) {
            errors.push(createValidationError(
              `workingDays[${index}].time`,
              `${dayName}: Start time and end time are required`,
              { doctorId, ...context }
            ));
          }

          // Time format validation
          const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
          if (startTime && !timeRegex.test(startTime)) {
            errors.push(createValidationError(
              `workingDays[${index}].startTime`,
              `${dayName}: Invalid start time format`,
              { doctorId, ...context }
            ));
          }

          if (endTime && !timeRegex.test(endTime)) {
            errors.push(createValidationError(
              `workingDays[${index}].endTime`,
              `${dayName}: Invalid end time format`,
              { doctorId, ...context }
            ));
          }

          // Basic time logic validation
          if (startTime && endTime && startTime >= endTime) {
            errors.push(createValidationError(
              `workingDays[${index}].timeRange`,
              `${dayName}: Start time must be before end time`,
              { doctorId, ...context }
            ));
          }

          // Appointment limits validation
          if (maxAppointments && (maxAppointments < 1 || maxAppointments > 32)) {
            errors.push(createValidationError(
              `workingDays[${index}].maxAppointments`,
              `${dayName}: Max appointments must be between 1 and 32`,
              { doctorId, ...context }
            ));
          }
        }
      });

      return {
        isValid: errors.length === 0,
        errors
      };

    } catch (error) {
      const validationError = createValidationError(
        'workingDays',
        `Validation failed due to system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { doctorId, ...context }
      );
      return {
        isValid: false,
        errors: [validationError]
      };
    }
  }

  /**
   * Validate working days structure and format
   */
  private validateWorkingDaysStructure(workingDays: WorkingDay[]): ScheduleServiceError[] {
    const errors: ScheduleServiceError[] = [];

    // Check for empty array
    if (!workingDays || workingDays.length === 0) {
      errors.push(createValidationError(
        'workingDays',
        'At least one working day must be configured',
        { operation: 'structure' }
      ));
      return errors;
    }

    // Check for duplicate days
    const days = workingDays.map(day => this.getDayName(day));
    const uniqueDays = new Set(days);
    if (days.length !== uniqueDays.size) {
      errors.push(createValidationError(
        'workingDays',
        'Duplicate days found in working schedule',
        { operation: 'structure' }
      ));
    }

    // Validate each day
    workingDays.forEach((day, index) => {
      const dayErrors = this.validateSingleWorkingDay(day, index);
      errors.push(...dayErrors);
    });

    return errors;
  }

  /**
   * Validate a single working day
   */
  private validateSingleWorkingDay(day: WorkingDay, index: number): ScheduleServiceError[] {
    const errors: ScheduleServiceError[] = [];
    const fieldPrefix = `workingDays[${index}]`;

    // Validate day of week
    const dayName = this.getDayName(day);
    try {
      dayOfWeekSchema.parse(dayName);
    } catch {
      errors.push(createValidationError(
        `${fieldPrefix}.day`,
        `Invalid day of week: ${dayName}`,
        { operation: 'dayValidation' }
      ));
    }

    // Get time fields (handle both formats)
    const startTime = (day as any).startTime || (day as any).start_time;
    const endTime = (day as any).endTime || (day as any).end_time;
    const breakStart = (day as any).breakStart || (day as any).break_start_time;
    const breakEnd = (day as any).breakEnd || (day as any).break_end_time;

    // Validate time format
    if (startTime && !timeRegex.test(startTime)) {
      errors.push(createValidationError(
        `${fieldPrefix}.startTime`,
        `Invalid start time format: ${startTime}. Expected HH:MM format.`,
        { operation: 'timeFormat' }
      ));
    }

    if (endTime && !timeRegex.test(endTime)) {
      errors.push(createValidationError(
        `${fieldPrefix}.endTime`,
        `Invalid end time format: ${endTime}. Expected HH:MM format.`,
        { operation: 'timeFormat' }
      ));
    }

    // Validate break times if provided
    if (breakStart && !timeRegex.test(breakStart)) {
      errors.push(createValidationError(
        `${fieldPrefix}.breakStart`,
        `Invalid break start time format: ${breakStart}. Expected HH:MM format.`,
        { operation: 'timeFormat' }
      ));
    }

    if (breakEnd && !timeRegex.test(breakEnd)) {
      errors.push(createValidationError(
        `${fieldPrefix}.breakEnd`,
        `Invalid break end time format: ${breakEnd}. Expected HH:MM format.`,
        { operation: 'timeFormat' }
      ));
    }

    // Get numeric fields (handle both formats)
    const maxAppointments = (day as any).maxAppointments || (day as any).max_appointments || 0;
    const appointmentDuration = (day as any).appointmentDuration || (day as any).appointment_duration || 30;
    const bufferTime = (day as any).bufferTime || (day as any).buffer_time || 0;

    // Validate numeric fields
    if (maxAppointments && (maxAppointments < 1 || maxAppointments > this.rules.maxAppointmentsPerDay)) {
      errors.push(createValidationError(
        `${fieldPrefix}.maxAppointments`,
        `Max appointments must be between 1 and ${this.rules.maxAppointmentsPerDay}`,
        { operation: 'numericValidation' }
      ));
    }

    if (appointmentDuration && (appointmentDuration < this.rules.minAppointmentDuration || 
        appointmentDuration > this.rules.maxAppointmentDuration)) {
      errors.push(createValidationError(
        `${fieldPrefix}.appointmentDuration`,
        `Appointment duration must be between ${this.rules.minAppointmentDuration} and ${this.rules.maxAppointmentDuration} minutes`,
        { operation: 'numericValidation' }
      ));
    }

    if (bufferTime && (bufferTime < this.rules.minBufferTime || bufferTime > this.rules.maxBufferTime)) {
      errors.push(createValidationError(
        `${fieldPrefix}.bufferTime`,
        `Buffer time must be between ${this.rules.minBufferTime} and ${this.rules.maxBufferTime} minutes`,
        { operation: 'numericValidation' }
      ));
    }

    // Get timezone (handle both formats)
    const timezone = (day as any).timezone;
    
    // Validate timezone
    if (timezone && !this.rules.supportedTimezones.includes(timezone)) {
      errors.push(createValidationError(
        `${fieldPrefix}.timezone`,
        `Unsupported timezone: ${timezone}. Supported timezones: ${this.rules.supportedTimezones.join(', ')}`,
        { operation: 'timezoneValidation' }
      ));
    }

    return errors;
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(
    workingDays: WorkingDay[],
    doctorId: string
  ): Promise<ScheduleServiceError[]> {
    const errors: ScheduleServiceError[] = [];

    // Check if doctor has at least one working day
    const workingDaysCount = workingDays.filter(day => day.isWorking).length;
    if (workingDaysCount === 0) {
      errors.push(createValidationError(
        'workingDays',
        'Doctor must have at least one working day',
        { doctorId, operation: 'businessRules' }
      ));
    }

    // Check for reasonable working hours
    workingDays.forEach((day, index) => {
      if (day.isWorking) {
        const startTime = this.parseTime(day.startTime);
        const endTime = this.parseTime(day.endTime);
        const workingMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const workingHours = workingMinutes / 60;

        if (workingHours < this.rules.minWorkingHours) {
          errors.push(createValidationError(
            `workingDays[${index}].workingHours`,
            `Working hours must be at least ${this.rules.minWorkingHours} hour(s)`,
            { doctorId, operation: 'businessRules' }
          ));
        }

        if (workingHours > this.rules.maxWorkingHours) {
          errors.push(createValidationError(
            `workingDays[${index}].workingHours`,
            `Working hours cannot exceed ${this.rules.maxWorkingHours} hours`,
            { doctorId, operation: 'businessRules' }
          ));
        }
      }
    });

    return errors;
  }

  /**
   * Validate time logic
   */
  private validateTimeLogic(workingDays: WorkingDay[]): ScheduleServiceError[] {
    const errors: ScheduleServiceError[] = [];

    workingDays.forEach((day, index) => {
      if (day.isWorking) {
        const fieldPrefix = `workingDays[${index}]`;
        
        // Validate start time is before end time
        const startTime = this.parseTime(day.startTime);
        const endTime = this.parseTime(day.endTime);
        
        if (startTime >= endTime) {
          errors.push(createValidationError(
            `${fieldPrefix}.timeRange`,
            `Start time (${day.startTime}) must be before end time (${day.endTime})`,
            { operation: 'timeLogic' }
          ));
        }

        // Validate break times
        if (day.breakStart && day.breakEnd) {
          const breakStart = this.parseTime(day.breakStart);
          const breakEnd = this.parseTime(day.breakEnd);
          
          if (breakStart >= breakEnd) {
            errors.push(createValidationError(
              `${fieldPrefix}.breakTime`,
              `Break start time (${day.breakStart}) must be before break end time (${day.breakEnd})`,
              { operation: 'timeLogic' }
            ));
          }

          if (breakStart <= startTime || breakEnd >= endTime) {
            errors.push(createValidationError(
              `${fieldPrefix}.breakTime`,
              `Break time must be within working hours (${day.startTime} - ${day.endTime})`,
              { operation: 'timeLogic' }
            ));
          }

          // Validate break duration
          const breakMinutes = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
          if (breakMinutes < this.rules.breakRules.minDuration) {
            errors.push(createValidationError(
              `${fieldPrefix}.breakDuration`,
              `Break duration must be at least ${this.rules.breakRules.minDuration} minutes`,
              { operation: 'timeLogic' }
            ));
          }

          if (breakMinutes > this.rules.breakRules.maxDuration) {
            errors.push(createValidationError(
              `${fieldPrefix}.breakDuration`,
              `Break duration cannot exceed ${this.rules.breakRules.maxDuration} minutes`,
              { operation: 'timeLogic' }
            ));
          }
        }

        // Validate business hours
        const earliestStart = this.parseTime(this.rules.businessHours.earliestStart);
        const latestEnd = this.parseTime(this.rules.businessHours.latestEnd);
        
        if (startTime < earliestStart) {
          errors.push(createValidationError(
            `${fieldPrefix}.startTime`,
            `Start time cannot be earlier than ${this.rules.businessHours.earliestStart}`,
            { operation: 'timeLogic' }
          ));
        }

        if (endTime > latestEnd) {
          errors.push(createValidationError(
            `${fieldPrefix}.endTime`,
            `End time cannot be later than ${this.rules.businessHours.latestEnd}`,
            { operation: 'timeLogic' }
          ));
        }
      }
    });

    return errors;
  }

  /**
   * Validate capacity and appointment limits
   */
  private validateCapacity(workingDays: WorkingDay[]): ScheduleServiceError[] {
    const errors: ScheduleServiceError[] = [];

    workingDays.forEach((day, index) => {
      if (day.isWorking) {
        const fieldPrefix = `workingDays[${index}]`;
        
        // Calculate available time
        const startTime = this.parseTime(day.startTime);
        const endTime = this.parseTime(day.endTime);
        const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        let breakMinutes = 0;
        if (day.breakStart && day.breakEnd) {
          const breakStart = this.parseTime(day.breakStart);
          const breakEnd = this.parseTime(day.breakEnd);
          breakMinutes = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
        }
        
        const availableMinutes = totalMinutes - breakMinutes;
        const appointmentSlotMinutes = day.appointmentDuration + day.bufferTime;
        const maxPossibleAppointments = Math.floor(availableMinutes / appointmentSlotMinutes);
        
        if (day.maxAppointments > maxPossibleAppointments) {
          errors.push(createValidationError(
            `${fieldPrefix}.maxAppointments`,
            `Max appointments (${day.maxAppointments}) exceeds available time slots (${maxPossibleAppointments})`,
            { operation: 'capacityValidation' }
          ));
        }

        // Check for reasonable utilization
        const utilization = (day.maxAppointments * appointmentSlotMinutes) / availableMinutes;
        if (utilization > 0.95) {
          errors.push(createValidationError(
            `${fieldPrefix}.utilization`,
            `Schedule utilization is too high (${Math.round(utilization * 100)}%). Consider reducing appointments or increasing working hours.`,
            { operation: 'capacityValidation' }
          ));
        }
      }
    });

    return errors;
  }

  /**
   * Validate for conflicts with existing data
   */
  private async validateConflicts(
    workingDays: WorkingDay[],
    doctorId: string
  ): Promise<ScheduleServiceError[]> {
    const errors: ScheduleServiceError[] = [];

    try {
      // This would typically check against existing appointments, exceptions, etc.
      // For now, we'll implement basic conflict detection
      
      // Check for overlapping time ranges within the same day
      const workingDaysByDay = workingDays.filter(day => day.isWorking);
      const dayGroups = new Map<string, WorkingDay[]>();
      
      workingDaysByDay.forEach(day => {
        if (!dayGroups.has(day.day)) {
          dayGroups.set(day.day, []);
        }
        dayGroups.get(day.day)!.push(day);
      });

      // Check for conflicts within each day group
      dayGroups.forEach((days, dayName) => {
        if (days.length > 1) {
          errors.push(createValidationError(
            'workingDays',
            `Multiple configurations found for ${dayName}. Only one configuration per day is allowed.`,
            { doctorId, operation: 'conflictValidation' }
          ));
        }
      });

    } catch (error) {
      errors.push(createValidationError(
        'workingDays',
        'Failed to validate conflicts due to system error',
        { doctorId, operation: 'conflictValidation' }
      ));
    }

    return errors;
  }

  /**
   * Validate schedule exceptions
   */
  public async validateScheduleException(
    exception: ScheduleException,
    doctorId: string
  ): Promise<{ isValid: boolean; errors: ScheduleServiceError[] }> {
    const errors: ScheduleServiceError[] = [];

    // Validate date range
    if (exception.startDate >= exception.endDate) {
      errors.push(createValidationError(
        'exception.dateRange',
        'Start date must be before end date',
        { doctorId, operation: 'exceptionValidation' }
      ));
    }

    // Validate time fields for non-all-day exceptions
    if (!exception.isAllDay) {
      if (!exception.startTime || !exception.endTime) {
        errors.push(createValidationError(
          'exception.timeFields',
          'Start time and end time are required for non-all-day exceptions',
          { doctorId, operation: 'exceptionValidation' }
        ));
      } else {
        if (!timeRegex.test(exception.startTime)) {
          errors.push(createValidationError(
            'exception.startTime',
            'Invalid start time format',
            { doctorId, operation: 'exceptionValidation' }
          ));
        }
        
        if (!timeRegex.test(exception.endTime)) {
          errors.push(createValidationError(
            'exception.endTime',
            'Invalid end time format',
            { doctorId, operation: 'exceptionValidation' }
          ));
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate calendar integration
   */
  public async validateCalendarIntegration(
    integration: CalendarIntegration,
    doctorId: string
  ): Promise<{ isValid: boolean; errors: ScheduleServiceError[] }> {
    const errors: ScheduleServiceError[] = [];

    // Validate provider
    const validProviders = ['GOOGLE', 'OUTLOOK', 'APPLE', 'CUSTOM'];
    if (!validProviders.includes(integration.provider)) {
      errors.push(createValidationError(
        'integration.provider',
        `Invalid provider: ${integration.provider}`,
        { doctorId, operation: 'integrationValidation' }
      ));
    }

    // Validate required fields
    if (!integration.providerId) {
      errors.push(createValidationError(
        'integration.providerId',
        'Provider ID is required',
        { doctorId, operation: 'integrationValidation' }
      ));
    }

    if (!integration.calendarId) {
      errors.push(createValidationError(
        'integration.calendarId',
        'Calendar ID is required',
        { doctorId, operation: 'integrationValidation' }
      ));
    }

    // Validate sync direction
    const validDirections = ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'];
    if (!validDirections.includes(integration.syncDirection)) {
      errors.push(createValidationError(
        'integration.syncDirection',
        `Invalid sync direction: ${integration.syncDirection}`,
        { doctorId, operation: 'integrationValidation' }
      ));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse time string to Date object
   */
  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Update validation rules
   */
  public updateRules(newRules: Partial<ValidationRules>): void {
    this.rules = { ...this.rules, ...newRules };
  }

  /**
   * Get current validation rules
   */
  public getRules(): ValidationRules {
    return { ...this.rules };
  }
}

// Export singleton instance
export const validationService = new ValidationService();
