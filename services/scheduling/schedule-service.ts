/**
 * Enterprise-Grade Schedule Service
 * 
 * This service provides a comprehensive, modular, and scalable solution for managing
 * doctor schedules with proper error handling, validation, and enterprise patterns.
 */

import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { 
  WorkingDay, 
  ScheduleTemplate, 
  ScheduleException, 
  CalendarIntegration,
  ScheduleConflict,
  ScheduleAnalytics,
  ScheduleNotification,
  ScheduleData,
  ScheduleError,
  WorkingDayConfig
} from '@/types/schedule-types';
import { schedulingCache, performanceMonitor } from './performance-monitor';
import { validationService } from './validation-service';

// Service Result Pattern for better error handling
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ScheduleError[];
  metadata?: Record<string, any>;
}

// Service Configuration
export interface ScheduleServiceConfig {
  maxAppointmentsPerDay: number;
  minAppointmentDuration: number;
  maxAppointmentDuration: number;
  defaultBufferTime: number;
  maxBufferTime: number;
  supportedTimezones: string[];
  validationStrictMode: boolean;
}

// Default Configuration
const DEFAULT_CONFIG: ScheduleServiceConfig = {
  maxAppointmentsPerDay: 32,
  minAppointmentDuration: 15,
  maxAppointmentDuration: 480,
  defaultBufferTime: 5,
  maxBufferTime: 60,
  supportedTimezones: ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
  validationStrictMode: true
};


export class ScheduleService {
  private config: ScheduleServiceConfig;

  constructor(config: Partial<ScheduleServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Convert day name to day of week number (0 = Sunday, 1 = Monday, etc.)
   */
  private getDayOfWeek(dayName: string): number {
    const dayMap: { [key: string]: number } = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    return dayMap[dayName] ?? 0;
  }

  /**
   * Get doctor's complete schedule data with caching
   */
  async getDoctorSchedule(doctorId: string): Promise<ServiceResult<ScheduleData>> {
    const timer = performanceMonitor.startTimer('scheduleService.getDoctorSchedule');
    
    try {
      // Check cache first
      const cachedSchedule = schedulingCache.getDoctorSchedule(doctorId);
      if (cachedSchedule) {
        timer(true, undefined, { doctorId, cacheHit: true });
        return {
          success: true,
          data: cachedSchedule,
          metadata: {
            doctorId,
            cached: true,
            lastUpdated: new Date().toISOString()
          }
        };
      }

      // Validate doctor exists
      const doctor = await db.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true, name: true, availability_status: true }
      });

      if (!doctor) {
        timer(false, 'Doctor not found', { doctorId });
        return {
          success: false,
          error: 'Doctor not found',
          errors: [{ field: 'doctorId', message: 'Doctor not found', code: 'DOCTOR_NOT_FOUND' }]
        };
      }

      // Fetch all schedule-related data in parallel
      const [
        workingDays,
        templates,
        exceptions,
        integrations,
        conflicts,
        analytics,
        notifications
      ] = await Promise.all([
        this.getWorkingDays(doctorId),
        this.getScheduleTemplates(doctorId),
        this.getScheduleExceptions(doctorId),
        this.getCalendarIntegrations(doctorId),
        this.getScheduleConflicts(doctorId),
        this.getScheduleAnalytics(doctorId),
        this.getScheduleNotifications(doctorId)
      ]);

      if (!workingDays.success) {
        timer(false, workingDays.error, { doctorId });
        return { success: false, error: workingDays.error };
      }

      // Extract frequency data from the first working day (all should have same frequency)
      const firstWorkingDay = (workingDays.data as any)?.[0] as WorkingDayConfig | undefined;
      const frequencyData = firstWorkingDay ? {
        recurrenceType: firstWorkingDay.recurrenceType,
        effectiveFrom: firstWorkingDay.effectiveFrom,
        effectiveUntil: firstWorkingDay.effectiveUntil,
        isTemplate: firstWorkingDay.isTemplate
      } : {};

      const scheduleData: ScheduleData = {
        workingHours: (workingDays.data as WorkingDayConfig[]) || [],
        templates: templates.data || [],
        exceptions: exceptions.data || [],
        integrations: integrations.data || [],
        conflicts: conflicts.data || [],
        analytics: analytics.data || [],
        notifications: notifications.data || [],
        ...frequencyData
      };

      // Cache the result
      schedulingCache.setDoctorSchedule(doctorId, scheduleData);

      timer(true, undefined, { doctorId, cacheHit: false });
      return {
        success: true,
        data: scheduleData,
        metadata: {
          doctorId,
          doctorName: doctor.name,
          availabilityStatus: doctor.availability_status,
          lastUpdated: new Date().toISOString(),
          cached: false
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      timer(false, errorMessage, { doctorId });
      console.error('Error fetching doctor schedule:', error);
      return {
        success: false,
        error: 'Failed to fetch schedule',
        errors: [{ field: 'general', message: 'Database error occurred', code: 'DATABASE_ERROR' }]
      };
    }
  }

  /**
   * Update doctor's working days with comprehensive validation
   */
  async updateWorkingDays(
    doctorId: string, 
    workingDays: WorkingDay[], 
    userId: string
  ): Promise<ServiceResult<{ updatedCount: number; conflicts: ScheduleConflict[] }>> {
    try {
      // Validate doctor exists
      const doctor = await db.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true, name: true }
      });

      if (!doctor) {
        return {
          success: false,
          error: 'Doctor not found',
          errors: [{ field: 'doctorId', message: 'Doctor not found', code: 'DOCTOR_NOT_FOUND' }]
        };
      }

      // Validate working days using validation service
      const validationResult = await validationService.validateWorkingDays(workingDays, doctorId);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          errors: validationResult.errors
        };
      }

      // Check for conflicts
      const conflictResult = await this.checkScheduleConflicts(workingDays, doctorId);
      if (!conflictResult.success) {
        return {
          success: false,
          error: conflictResult.error,
          data: { updatedCount: 0, conflicts: [] }
        };
      }
      
      if (conflictResult.data && conflictResult.data.length > 0) {
        return {
          success: false,
          error: 'Schedule conflicts detected',
          data: { updatedCount: 0, conflicts: conflictResult.data }
        };
      }

      // Update in transaction
      const result = await db.$transaction(async (tx) => {
        // Delete existing working days
        await tx.workingDays.deleteMany({
          where: { doctor_id: doctorId }
        });

        // Create new working days
        const createdDays = await Promise.all(
          workingDays.map(day => 
            tx.workingDays.create({
              data: {
                doctor_id: doctorId,
                day_of_week: day.day,
                is_working: day.isWorking,
                start_time: day.startTime,
                end_time: day.endTime,
                break_start_time: day.breakStart || null,
                break_end_time: day.breakEnd || null,
                max_appointments: day.maxAppointments,
                appointment_duration: day.appointmentDuration || 30,
                buffer_time: day.bufferTime || 5,
                timezone: day.timezone || 'UTC',
                recurrence_type: day.recurrenceType || 'WEEKLY',
                effective_from: day.effectiveFrom ? new Date(day.effectiveFrom) : null,
                effective_until: day.effectiveUntil ? new Date(day.effectiveUntil) : null,
                is_template: day.isTemplate || false
              }
            })
          )
        );

        // Set doctor as available if they have working days
        const hasWorkingDays = workingDays.some(day => day.isWorking);
        if (hasWorkingDays) {
          await tx.doctor.update({
            where: { id: doctorId },
            data: { availability_status: 'AVAILABLE' }
          });
        }

        return createdDays.length;
      });

      // Invalidate cache
      schedulingCache.invalidateDoctor(doctorId);

      // Log audit trail
      await logAudit({
        action: 'UPDATE',
        resourceType: 'SCHEDULE',
        resourceId: doctorId,
        reason: 'Working days updated',
        metadata: {
          userId,
          workingDaysCount: result,
          timestamp: new Date().toISOString()
        }
      });

      return {
        success: true,
        data: {
          updatedCount: result,
          conflicts: conflictResult.data || []
        },
        metadata: {
          doctorId,
          updatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error updating working days:', error);
      return {
        success: false,
        error: 'Failed to update working days',
        errors: [{ field: 'general', message: 'Database transaction failed', code: 'TRANSACTION_ERROR' }]
      };
    }
  }


  /**
   * Check for schedule conflicts
   */
  private async checkScheduleConflicts(
    workingDays: WorkingDay[], 
    doctorId: string
  ): Promise<ServiceResult<ScheduleConflict[]>> {
    const conflicts: ScheduleConflict[] = [];

    try {
      // Check for overlapping appointments
      const existingAppointments = await db.appointment.findMany({
        where: {
          doctor_id: doctorId,
          status: { in: ['PENDING', 'SCHEDULED'] }
        },
        select: {
          id: true,
          appointment_date: true,
          time: true
        }
      });

      // Check each working day for conflicts
      for (const day of workingDays) {
        if (day.isWorking) {
          const dayOfWeek = this.getDayOfWeek(day.day);
          const dayAppointments = existingAppointments.filter(apt => 
            new Date(apt.appointment_date).getDay() === dayOfWeek
          );

          for (const appointment of dayAppointments) {
          const aptTime = this.parseTime(appointment.time);
          const dayStart = this.parseTime(day.startTime);
          const dayEnd = this.parseTime(day.endTime);

            if (aptTime < dayStart || aptTime >= dayEnd) {
              conflicts.push({
                id: 0, // Will be set by database
                conflictType: 'EXCEPTION_VIOLATION',
                appointmentId: appointment.id,
                conflictStart: new Date(appointment.appointment_date),
                conflictEnd: new Date(appointment.appointment_date),
                severity: 'HIGH',
                status: 'PENDING',
                resolutionMethod: 'MANUAL_RESOLUTION'
              });
            }
          }
        }
      }

      return {
        success: true,
        data: conflicts
      };

    } catch (error) {
      console.error('Error checking schedule conflicts:', error);
      return {
        success: false,
        error: 'Failed to check conflicts',
        errors: [{ field: 'conflicts', message: 'Conflict check failed', code: 'CONFLICT_CHECK_ERROR' }]
      };
    }
  }


  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Individual data fetching methods
  private async getWorkingDays(doctorId: string): Promise<ServiceResult<WorkingDayConfig[]>> {
    try {
      const workingDays = await db.workingDays.findMany({
        where: { doctor_id: doctorId },
        orderBy: { day_of_week: 'asc' }
      });

      const formattedDays: WorkingDayConfig[] = workingDays.map(day => ({
        id: day.id,
        day: day.day_of_week as any,
        isWorking: day.is_working,
        startTime: day.start_time,
        endTime: day.end_time,
        breakStart: (day.break_start_time as any) || undefined,
        breakEnd: (day.break_end_time as any) || undefined,
        maxAppointments: day.max_appointments,
        appointmentDuration: (day.appointment_duration as any),
        bufferTime: (day.buffer_time as any),
        timezone: day.timezone,
        recurrenceType: (day.recurrence_type as any),
        effectiveFrom: (day.effective_from as any) || undefined,
        effectiveUntil: (day.effective_until as any) || undefined,
        isTemplate: (day.is_template as any)
      }));

      return { success: true, data: formattedDays };
    } catch (error) {
      return { success: false, error: 'Failed to fetch working days' };
    }
  }

  private async getScheduleTemplates(doctorId: string): Promise<ServiceResult<ScheduleTemplate[]>> {
    try {
      const templates = await db.scheduleTemplates.findMany({
        where: { doctor_id: doctorId },
        orderBy: { created_at: 'desc' }
      });

      const formattedTemplates: ScheduleTemplate[] = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || undefined,
        templateType: template.template_type as ScheduleTemplate['templateType'],
        isDefault: template.is_default,
        workingDays: template.working_days as any,
        recurrenceRules: template.recurrence_rules || undefined,
        timezone: template.timezone
      }));

      return { success: true, data: formattedTemplates };
    } catch (error) {
      return { success: false, error: 'Failed to fetch schedule templates' };
    }
  }

  private async getScheduleExceptions(doctorId: string): Promise<ServiceResult<ScheduleException[]>> {
    try {
      const exceptions = await db.scheduleExceptions.findMany({
        where: { doctor_id: doctorId },
        orderBy: { start_date: 'desc' }
      });

      const formattedExceptions: ScheduleException[] = exceptions.map(exception => ({
        id: exception.id,
        exceptionType: exception.exception_type as ScheduleException['exceptionType'],
        title: exception.title,
        description: exception.description || undefined,
        startDate: exception.start_date,
        endDate: exception.end_date,
        isAllDay: exception.is_all_day,
        startTime: exception.start_time || undefined,
        endTime: exception.end_time || undefined,
        isRecurring: exception.is_recurring,
        recurrencePattern: exception.recurrence_pattern || undefined,
        affectsAppointments: exception.affects_appointments
      }));

      return { success: true, data: formattedExceptions };
    } catch (error) {
      return { success: false, error: 'Failed to fetch schedule exceptions' };
    }
  }

  private async getCalendarIntegrations(doctorId: string): Promise<ServiceResult<CalendarIntegration[]>> {
    try {
      const integrations = await db.calendarIntegrations.findMany({
        where: { doctor_id: doctorId },
        orderBy: { created_at: 'desc' }
      });

      const formattedIntegrations: CalendarIntegration[] = integrations.map(integration => ({
        id: integration.id,
        provider: integration.provider as CalendarIntegration['provider'],
        providerId: integration.provider_id,
        calendarId: integration.calendar_id,
        syncEnabled: integration.sync_enabled,
        syncDirection: integration.sync_direction as CalendarIntegration['syncDirection'],
        lastSync: integration.last_sync || undefined,
        syncToken: integration.sync_token || undefined,
        credentials: integration.credentials || undefined,
        settings: integration.settings || undefined
      }));

      return { success: true, data: formattedIntegrations };
    } catch (error) {
      return { success: false, error: 'Failed to fetch calendar integrations' };
    }
  }

  private async getScheduleConflicts(doctorId: string): Promise<ServiceResult<ScheduleConflict[]>> {
    try {
      const conflicts = await db.scheduleConflicts.findMany({
        where: { 
          doctor_id: doctorId,
          status: 'PENDING'
        },
        orderBy: { created_at: 'desc' }
      });

      const formattedConflicts: ScheduleConflict[] = conflicts.map(conflict => ({
        id: conflict.id,
        conflictType: conflict.conflict_type as ScheduleConflict['conflictType'],
        appointmentId: conflict.appointment_id || undefined,
        conflictingAppointmentId: conflict.conflicting_appointment_id || undefined,
        conflictStart: conflict.conflict_start,
        conflictEnd: conflict.conflict_end,
        severity: conflict.severity as ScheduleConflict['severity'],
        status: conflict.status as ScheduleConflict['status'],
        resolutionMethod: conflict.resolution_method as ScheduleConflict['resolutionMethod'] || undefined,
        resolutionNotes: conflict.resolution_notes || undefined,
        resolvedAt: conflict.resolved_at || undefined,
        resolvedBy: conflict.resolved_by || undefined
      }));

      return { success: true, data: formattedConflicts };
    } catch (error) {
      return { success: false, error: 'Failed to fetch schedule conflicts' };
    }
  }

  private async getScheduleAnalytics(doctorId: string): Promise<ServiceResult<ScheduleAnalytics[]>> {
    try {
      const analytics = await db.scheduleAnalytics.findMany({
        where: { doctor_id: doctorId },
        orderBy: { date: 'desc' },
        take: 30 // Last 30 days
      });

      const formattedAnalytics: ScheduleAnalytics[] = analytics.map(analytic => ({
        id: analytic.id,
        date: analytic.date,
        totalAppointments: analytic.total_appointments,
        completedAppointments: analytic.completed_appointments,
        cancelledAppointments: analytic.cancelled_appointments,
        noShowAppointments: analytic.no_show_appointments,
        averageAppointmentDuration: analytic.average_appointment_duration || undefined,
        utilizationRate: analytic.utilization_rate || undefined,
        patientSatisfactionScore: analytic.patient_satisfaction_score || undefined,
        aiOptimizationScore: analytic.ai_optimization_score || undefined,
        peakHours: analytic.peak_hours || undefined,
        lowUtilizationHours: analytic.low_utilization_hours || undefined,
        recommendations: analytic.recommendations || undefined
      }));

      return { success: true, data: formattedAnalytics };
    } catch (error) {
      return { success: false, error: 'Failed to fetch schedule analytics' };
    }
  }

  private async getScheduleNotifications(doctorId: string): Promise<ServiceResult<ScheduleNotification[]>> {
    try {
      const notifications = await db.scheduleNotifications.findMany({
        where: { 
          doctor_id: doctorId,
          is_sent: false
        },
        orderBy: { scheduled_for: 'asc' }
      });

      const formattedNotifications: ScheduleNotification[] = notifications.map(notification => ({
        id: notification.id,
        appointmentId: notification.appointment_id || undefined,
        notificationType: notification.notification_type as ScheduleNotification['notificationType'],
        title: notification.title,
        message: notification.message,
        scheduledFor: notification.scheduled_for,
        isSent: notification.is_sent,
        sentAt: notification.sent_at || undefined,
        deliveryMethod: notification.delivery_method as ScheduleNotification['deliveryMethod'],
        priority: notification.priority as ScheduleNotification['priority'],
        metadata: notification.metadata || undefined
      }));

      return { success: true, data: formattedNotifications };
    } catch (error) {
      return { success: false, error: 'Failed to fetch schedule notifications' };
    }
  }
}

// Export singleton instance
export const scheduleService = new ScheduleService();
