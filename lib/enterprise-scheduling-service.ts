import { db } from '@/lib/db';
import { notificationService } from '@/lib/notifications';
import { reminderScheduler } from '@/lib/reminder-scheduler';
import { logAudit } from '@/lib/audit';
import { PHIEncryption } from '@/lib/encryption';
import { Appointment, Doctor, Patient, ScheduleStatus, TimeSlotStatus, ConflictResolutionStrategy } from '@prisma/client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ScheduleTemplateData {
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
  break_start?: string;
  break_end?: string;
  appointment_duration?: number;
  buffer_time?: number;
  max_appointments?: number;
  is_emergency_only?: boolean;
  requires_approval?: boolean;
}

export interface ScheduleBlockData {
  date: Date;
  start_time: string;
  end_time: string;
  is_working: boolean;
  break_start?: string;
  break_end?: string;
  appointment_duration?: number;
  buffer_time?: number;
  max_appointments?: number;
  notes?: string;
}

export interface TimeSlotData {
  date: Date;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_emergency_only?: boolean;
  requires_approval?: boolean;
  max_duration?: number;
}

export interface AvailabilityOverrideData {
  override_type: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  max_appointments?: number;
  appointment_duration?: number;
  buffer_time?: number;
}

export interface AppointmentBookingData {
  patient_id: string;
  doctor_id: string;
  appointment_date: Date;
  time: string;
  type: string;
  note?: string;
  service_id?: number;
  booking_source?: string;
  confirmation_required?: boolean;
}

export interface ConflictResolutionResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: string;
    reason: string;
    severity: string;
    conflictingAppointmentId?: number;
  }>;
  resolution?: {
    strategy: string;
    suggestedTime?: string;
    requiresApproval: boolean;
  };
}

// ============================================================================
// ENTERPRISE SCHEDULING SERVICE
// ============================================================================

export class EnterpriseSchedulingService {
  /**
   * Create a new doctor schedule
   */
  static async createDoctorSchedule(
    doctorId: string,
    scheduleData: {
      name: string;
      description?: string;
      schedule_type?: string;
      timezone?: string;
      effective_from?: Date;
      effective_until?: Date;
      auto_accept_bookings?: boolean;
      require_confirmation?: boolean;
      max_advance_booking_days?: number;
      min_advance_booking_hours?: number;
      conflict_resolution?: string;
    }
  ) {
    try {
      // If this is set as default, unset other defaults
      if (scheduleData.name.includes('Default') || scheduleData.name.includes('Primary')) {
        await db.doctorSchedule.updateMany({
          where: { doctor_id: doctorId },
          data: { is_default: false }
        });
      }

      const schedule = await db.doctorSchedule.create({
        data: {
          doctor_id: doctorId,
          name: scheduleData.name,
          description: scheduleData.description,
          schedule_type: scheduleData.schedule_type || 'REGULAR',
          timezone: scheduleData.timezone || 'UTC',
          effective_from: scheduleData.effective_from || new Date(),
          effective_until: scheduleData.effective_until,
          auto_accept_bookings: scheduleData.auto_accept_bookings ?? true,
          require_confirmation: scheduleData.require_confirmation ?? false,
          max_advance_booking_days: scheduleData.max_advance_booking_days || 30,
          min_advance_booking_hours: scheduleData.min_advance_booking_hours || 2,
          conflict_resolution: scheduleData.conflict_resolution || 'PREVENT_BOOKING',
        }
      });

      // Log audit trail
      await logAudit({
        action: 'CREATE',
        resourceType: 'DOCTOR_SCHEDULE',
        resourceId: schedule.id,
        patientId: null,
        reason: 'Doctor schedule created',
        metadata: {
          doctorId,
          scheduleName: schedule.name,
          scheduleType: schedule.schedule_type,
        }
      });

      return schedule;
    } catch (error) {
      console.error('Error creating doctor schedule:', error);
      throw new Error('Failed to create doctor schedule');
    }
  }

  /**
   * Create schedule template
   */
  static async createScheduleTemplate(
    scheduleId: string,
    templateData: ScheduleTemplateData
  ) {
    try {
      const template = await db.scheduleTemplate.create({
        data: {
          schedule_id: scheduleId,
          name: templateData.name,
          day_of_week: templateData.day_of_week,
          start_time: templateData.start_time,
          end_time: templateData.end_time,
          is_working: templateData.is_working,
          break_start: templateData.break_start,
          break_end: templateData.break_end,
          appointment_duration: templateData.appointment_duration || 30,
          buffer_time: templateData.buffer_time || 15,
          max_appointments: templateData.max_appointments,
          is_emergency_only: templateData.is_emergency_only || false,
          requires_approval: templateData.requires_approval || false,
        }
      });

      // Generate time slots for the next 30 days based on this template
      await this.generateTimeSlotsFromTemplate(template);

      return template;
    } catch (error) {
      console.error('Error creating schedule template:', error);
      throw new Error('Failed to create schedule template');
    }
  }

  /**
   * Generate time slots from template
   */
  static async generateTimeSlotsFromTemplate(template: any) {
    try {
      const schedule = await db.doctorSchedule.findUnique({
        where: { id: template.schedule_id },
        include: { doctor: true }
      });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Generate for next 30 days

      const timeSlots = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        if (currentDate.getDay() === template.day_of_week && template.is_working) {
          const slots = await this.generateTimeSlotsForDate(
            template.schedule_id,
            new Date(currentDate),
            template.start_time,
            template.end_time,
            template.appointment_duration,
            template.buffer_time,
            template.break_start,
            template.break_end
          );
          timeSlots.push(...slots);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return timeSlots;
    } catch (error) {
      console.error('Error generating time slots from template:', error);
      throw new Error('Failed to generate time slots');
    }
  }

  /**
   * Generate time slots for a specific date
   */
  static async generateTimeSlotsForDate(
    scheduleId: string,
    date: Date,
    startTime: string,
    endTime: string,
    appointmentDuration: number,
    bufferTime: number,
    breakStart?: string,
    breakEnd?: string
  ) {
    try {
      const timeSlots = [];
      const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
      const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${endTime}`);
      const breakStartDateTime = breakStart ? new Date(`${date.toISOString().split('T')[0]}T${breakStart}`) : null;
      const breakEndDateTime = breakEnd ? new Date(`${date.toISOString().split('T')[0]}T${breakEnd}`) : null;

      let currentTime = new Date(startDateTime);

      while (currentTime < endDateTime) {
        const slotEndTime = new Date(currentTime.getTime() + appointmentDuration * 60000);

        // Skip break time
        if (breakStartDateTime && breakEndDateTime && 
            currentTime >= breakStartDateTime && currentTime < breakEndDateTime) {
          currentTime = new Date(breakEndDateTime);
          continue;
        }

        // Don't create slots that would extend beyond working hours
        if (slotEndTime > endDateTime) {
          break;
        }

        const timeSlot = await db.timeSlot.create({
          data: {
            schedule_id: scheduleId,
            date: date,
            start_time: currentTime.toTimeString().slice(0, 5),
            end_time: slotEndTime.toTimeString().slice(0, 5),
            duration_minutes: appointmentDuration,
            status: 'AVAILABLE',
            is_available: true,
            is_booked: false,
          }
        });

        timeSlots.push(timeSlot);

        // Move to next slot with buffer time
        currentTime = new Date(slotEndTime.getTime() + bufferTime * 60000);
      }

      return timeSlots;
    } catch (error) {
      console.error('Error generating time slots for date:', error);
      throw new Error('Failed to generate time slots for date');
    }
  }

  /**
   * Get available time slots for a doctor on a specific date
   */
  static async getAvailableTimeSlots(
    doctorId: string,
    date: Date,
    appointmentDuration?: number
  ) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const timeSlots = await db.timeSlot.findMany({
        where: {
          schedule: {
            doctor_id: doctorId,
            status: 'ACTIVE',
            effective_from: { lte: date },
            OR: [
              { effective_until: null },
              { effective_until: { gte: date } }
            ]
          },
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: 'AVAILABLE',
          is_available: true,
          is_booked: false,
          ...(appointmentDuration && {
            duration_minutes: { gte: appointmentDuration }
          })
        },
        include: {
          schedule: true,
          appointment: true
        },
        orderBy: { start_time: 'asc' }
      });

      return timeSlots;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw new Error('Failed to fetch available time slots');
    }
  }

  /**
   * Book an appointment with conflict checking
   */
  static async bookAppointment(bookingData: AppointmentBookingData): Promise<{
    success: boolean;
    appointment?: any;
    conflicts?: ConflictResolutionResult;
    error?: string;
  }> {
    try {
      // Check for conflicts
      const conflictCheck = await this.checkSchedulingConflicts(
        bookingData.doctor_id,
        bookingData.appointment_date,
        bookingData.time,
        bookingData.appointment_date // Assuming 30 min duration for now
      );

      if (conflictCheck.hasConflict) {
        return {
          success: false,
          conflicts: conflictCheck,
          error: 'Scheduling conflicts detected'
        };
      }

      // Find available time slot
      const timeSlot = await db.timeSlot.findFirst({
        where: {
          schedule: { doctor_id: bookingData.doctor_id },
          date: bookingData.appointment_date,
          start_time: bookingData.time,
          status: 'AVAILABLE',
          is_available: true,
          is_booked: false
        }
      });

      if (!timeSlot) {
        return {
          success: false,
          error: 'No available time slot found'
        };
      }

      // Create the appointment
      const appointment = await db.appointment.create({
        data: {
          patient_id: bookingData.patient_id,
          doctor_id: bookingData.doctor_id,
          appointment_date: bookingData.appointment_date,
          time: bookingData.time,
          type: bookingData.type,
          note: bookingData.note,
          service_id: bookingData.service_id,
          schedule_block_id: timeSlot.block_id,
          time_slot_id: timeSlot.id,
          booking_source: bookingData.booking_source || 'WEB',
          confirmation_required: bookingData.confirmation_required || false,
        },
        include: {
          patient: true,
          doctor: true,
          service: true
        }
      });

      // Update time slot status
      await db.timeSlot.update({
        where: { id: timeSlot.id },
        data: {
          status: 'BOOKED',
          is_available: false,
          is_booked: true,
          appointment_id: appointment.id,
          booked_at: new Date(),
          booked_by: bookingData.patient_id
        }
      });

      // Send notifications using existing system
      try {
        await notificationService.sendAppointmentConfirmationTemplate(
          appointment,
          'IMMEDIATE' as any
        );
        console.log(`✅ Appointment confirmation sent for appointment ${appointment.id}`);
      } catch (notificationError) {
        console.error(`Failed to send notifications for appointment ${appointment.id}:`, notificationError);
      }

      // Schedule reminders using existing system
      try {
        await reminderScheduler.scheduleAppointmentReminders(appointment);
        console.log(`✅ Reminders scheduled for appointment ${appointment.id}`);
      } catch (reminderError) {
        console.error(`Failed to schedule reminders for appointment ${appointment.id}:`, reminderError);
      }

      // Log audit trail
      await logAudit({
        action: 'CREATE',
        resourceType: 'APPOINTMENT',
        resourceId: appointment.id.toString(),
        patientId: appointment.patient_id,
        reason: 'Appointment booked through scheduling system',
        metadata: {
          appointmentType: appointment.type,
          appointmentDate: appointment.appointment_date.toISOString(),
          appointmentTime: appointment.time,
          doctorId: appointment.doctor_id,
          timeSlotId: timeSlot.id,
          bookingSource: bookingData.booking_source,
        }
      });

      return {
        success: true,
        appointment
      };
    } catch (error) {
      console.error('Error booking appointment:', error);
      return {
        success: false,
        error: 'Failed to book appointment'
      };
    }
  }

  /**
   * Check for scheduling conflicts
   */
  static async checkSchedulingConflicts(
    doctorId: string,
    appointmentDate: Date,
    appointmentTime: string,
    endTime?: Date
  ): Promise<ConflictResolutionResult> {
    try {
      const conflicts = [];
      const appointmentStart = new Date(`${appointmentDate.toISOString().split('T')[0]}T${appointmentTime}`);
      const appointmentEnd = endTime || new Date(appointmentStart.getTime() + 30 * 60000);

      // Check for double booking
      const existingAppointments = await db.appointment.findMany({
        where: {
          doctor_id: doctorId,
          appointment_date: appointmentDate,
          status: { in: ['SCHEDULED', 'PENDING'] }
        }
      });

      for (const existing of existingAppointments) {
        const existingStart = new Date(`${existing.appointment_date.toISOString().split('T')[0]}T${existing.time}`);
        const existingEnd = new Date(existingStart.getTime() + 30 * 60000);

        if ((appointmentStart < existingEnd && appointmentEnd > existingStart)) {
          conflicts.push({
            type: 'DOUBLE_BOOKING',
            reason: `Conflicts with existing appointment at ${existing.time}`,
            severity: 'HIGH',
            conflictingAppointmentId: existing.id
          });
        }
      }

      // Check if doctor is available during this time
      const doctorSchedule = await db.doctorSchedule.findFirst({
        where: {
          doctor_id: doctorId,
          status: 'ACTIVE',
          effective_from: { lte: appointmentDate },
          OR: [
            { effective_until: null },
            { effective_until: { gte: appointmentDate } }
          ]
        },
        include: {
          schedule_templates: {
            where: {
              day_of_week: appointmentDate.getDay(),
              is_working: true
            }
          }
        }
      });

      if (!doctorSchedule || !doctorSchedule.schedule_templates.length) {
        conflicts.push({
          type: 'DOCTOR_UNAVAILABLE',
          reason: 'Doctor is not scheduled to work on this day',
          severity: 'HIGH'
        });
      } else {
        const template = doctorSchedule.schedule_templates[0];
        const workingStart = new Date(`${appointmentDate.toISOString().split('T')[0]}T${template.start_time}`);
        const workingEnd = new Date(`${appointmentDate.toISOString().split('T')[0]}T${template.end_time}`);

        if (appointmentStart < workingStart || appointmentEnd > workingEnd) {
          conflicts.push({
            type: 'OUTSIDE_WORKING_HOURS',
            reason: `Appointment is outside working hours (${template.start_time} - ${template.end_time})`,
            severity: 'MEDIUM'
          });
        }
      }

      // Check for availability overrides
      const overrides = await db.availabilityOverride.findMany({
        where: {
          doctor_id: doctorId,
          start_date: { lte: appointmentDate },
          end_date: { gte: appointmentDate },
          is_approved: true
        }
      });

      for (const override of overrides) {
        if (!override.is_available) {
          conflicts.push({
            type: 'UNAVAILABILITY_OVERRIDE',
            reason: `Doctor is unavailable due to: ${override.title}`,
            severity: 'HIGH'
          });
        }
      }

      return {
        hasConflict: conflicts.length > 0,
        conflicts,
        resolution: conflicts.length > 0 ? {
          strategy: doctorSchedule?.conflict_resolution || 'PREVENT_BOOKING',
          requiresApproval: doctorSchedule?.require_confirmation || false
        } : undefined
      };
    } catch (error) {
      console.error('Error checking scheduling conflicts:', error);
      throw new Error('Failed to check scheduling conflicts');
    }
  }

  /**
   * Create availability override
   */
  static async createAvailabilityOverride(
    doctorId: string,
    overrideData: AvailabilityOverrideData
  ) {
    try {
      const override = await db.availabilityOverride.create({
        data: {
          doctor_id: doctorId,
          override_type: overrideData.override_type,
          title: overrideData.title,
          description: overrideData.description,
          start_date: overrideData.start_date,
          end_date: overrideData.end_date,
          start_time: overrideData.start_time,
          end_time: overrideData.end_time,
          is_available: overrideData.is_available,
          max_appointments: overrideData.max_appointments,
          appointment_duration: overrideData.appointment_duration,
          buffer_time: overrideData.buffer_time,
        }
      });

      // Log audit trail
      await logAudit({
        action: 'CREATE',
        resourceType: 'AVAILABILITY_OVERRIDE',
        resourceId: override.id,
        patientId: null,
        reason: 'Availability override created',
        metadata: {
          doctorId,
          overrideType: override.override_type,
          title: override.title,
          startDate: override.start_date.toISOString(),
          endDate: override.end_date.toISOString(),
        }
      });

      return override;
    } catch (error) {
      console.error('Error creating availability override:', error);
      throw new Error('Failed to create availability override');
    }
  }

  /**
   * Get doctor's schedule for a date range
   */
  static async getDoctorSchedule(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const schedule = await db.doctorSchedule.findMany({
        where: {
          doctor_id: doctorId,
          status: 'ACTIVE',
          effective_from: { lte: endDate },
          OR: [
            { effective_until: null },
            { effective_until: { gte: startDate } }
          ]
        },
        include: {
          schedule_templates: {
            orderBy: { day_of_week: 'asc' }
          },
          schedule_blocks: {
            where: {
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            orderBy: { date: 'asc' }
          },
          time_slots: {
            where: {
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            orderBy: { start_time: 'asc' }
          },
          availability_overrides: {
            where: {
              start_date: { lte: endDate },
              end_date: { gte: startDate },
              is_approved: true
            }
          }
        }
      });

      return schedule;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      throw new Error('Failed to fetch doctor schedule');
    }
  }

  /**
   * Get scheduling analytics for a doctor
   */
  static async getSchedulingAnalytics(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const metrics = await db.schedulingMetrics.findMany({
        where: {
          doctor_id: doctorId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'asc' }
      });

      // Calculate aggregate metrics
      const totalSlots = metrics.reduce((sum, m) => sum + m.total_slots, 0);
      const bookedSlots = metrics.reduce((sum, m) => sum + m.booked_slots, 0);
      const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      return {
        metrics,
        summary: {
          totalSlots,
          bookedSlots,
          utilizationRate,
          averageUtilization: metrics.length > 0 ? 
            metrics.reduce((sum, m) => sum + Number(m.utilization_rate), 0) / metrics.length : 0
        }
      };
    } catch (error) {
      console.error('Error fetching scheduling analytics:', error);
      throw new Error('Failed to fetch scheduling analytics');
    }
  }
}

