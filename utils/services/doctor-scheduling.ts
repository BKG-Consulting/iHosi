import { db } from '@/lib/db';
import { GoogleCalendarService } from '@/lib/google-calendar-service';
import { PHIEncryption } from '@/lib/encryption';

export interface ScheduleTemplate {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
  break_start?: string;
  break_end?: string;
  max_appointments?: number;
  appointment_duration: number;
  buffer_time: number;
}

export interface ScheduleBlock {
  id: string;
  date: Date;
  start_time: string;
  end_time: string;
  is_working: boolean;
  break_start?: string;
  break_end?: string;
  max_appointments?: number;
  appointment_duration: number;
  buffer_time: number;
  notes?: string;
  is_recurring: boolean;
  recurring_pattern?: string;
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  appointment_id?: string;
  notes?: string;
}

export interface CalendarIntegration {
  id: string;
  provider: string;
  calendar_name: string;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at?: Date;
  sync_direction: string;
}

export class DoctorSchedulingService {
  /**
   * Get doctor's schedules
   */
  static async getDoctorSchedules(doctorId: string) {
    try {
      const schedules = await db.doctorSchedule.findMany({
        where: { doctor_id: doctorId },
        include: {
          schedule_templates: {
            orderBy: { day_of_week: 'asc' }
          },
          schedule_blocks: {
            where: {
              date: {
                gte: new Date()
              }
            },
            orderBy: { date: 'asc' },
            take: 30 // Next 30 days
          },
          calendar_integrations: {
            where: { is_active: true }
          }
        }
      });
      return schedules;
    } catch (error) {
      console.error('Error fetching doctor schedules:', error);
      // Return empty array instead of throwing error to prevent UI crashes
      return [];
    }
  }

  /**
   * Create a new schedule for doctor
   */
  static async createSchedule(doctorId: string, scheduleData: {
    name: string;
    description?: string;
    timezone?: string;
    is_default?: boolean;
  }) {
    try {
      // If this is set as default, unset all other defaults for this doctor
      if (scheduleData.is_default) {
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
          timezone: scheduleData.timezone || 'UTC',
          is_default: scheduleData.is_default || false,
        },
        include: {
          schedule_templates: true,
          schedule_blocks: true,
          calendar_integrations: true
        }
      });
      
      return schedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw new Error('Failed to create schedule');
    }
  }

  /**
   * Create schedule template
   */
  static async createScheduleTemplate(scheduleId: string, templateData: {
    name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_working: boolean;
    break_start?: string;
    break_end?: string;
    max_appointments?: number;
    appointment_duration?: number;
    buffer_time?: number;
  }) {
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
          max_appointments: templateData.max_appointments,
          appointment_duration: templateData.appointment_duration || 30,
          buffer_time: templateData.buffer_time || 15,
        }
      });

      return template;
    } catch (error) {
      console.error('Error creating schedule template:', error);
      throw new Error('Failed to create schedule template');
    }
  }

  /**
   * Generate time slots for a specific date
   */
  static async generateTimeSlots(blockId: string, date: Date) {
    try {
      const block = await db.scheduleBlock.findUnique({
        where: { id: blockId },
        include: {
          appointments: true,
          time_slots: true
        }
      });

      if (!block) {
        throw new Error('Schedule block not found');
      }

      // Clear existing time slots
      await db.timeSlot.deleteMany({
        where: { block_id: blockId }
      });

      const timeSlots: TimeSlot[] = [];
      const startTime = new Date(`${date.toISOString().split('T')[0]}T${block.start_time}`);
      const endTime = new Date(`${date.toISOString().split('T')[0]}T${block.end_time}`);
      const breakStart = block.break_start ? new Date(`${date.toISOString().split('T')[0]}T${block.break_start}`) : null;
      const breakEnd = block.break_end ? new Date(`${date.toISOString().split('T')[0]}T${block.break_end}`) : null;

      let currentTime = new Date(startTime);

      while (currentTime < endTime) {
        const slotEndTime = new Date(currentTime.getTime() + block.appointment_duration * 60000);

        // Skip break time
        if (breakStart && breakEnd && currentTime >= breakStart && currentTime < breakEnd) {
          currentTime = new Date(breakEnd);
          continue;
        }

        // Don't create slots that would extend beyond working hours
        if (slotEndTime > endTime) {
          break;
        }

        // Check if this time slot conflicts with existing appointments
        const conflictingAppointment = block.appointments.find(apt => {
          const aptStart = new Date(`${apt.appointment_date.toISOString().split('T')[0]}T${apt.time}`);
          const aptEnd = new Date(aptStart.getTime() + block.appointment_duration * 60000);
          return (currentTime >= aptStart && currentTime < aptEnd) || 
                 (slotEndTime > aptStart && slotEndTime <= aptEnd);
        });

        const timeSlot = await db.timeSlot.create({
          data: {
            block_id: blockId,
            start_time: currentTime.toTimeString().slice(0, 5),
            end_time: slotEndTime.toTimeString().slice(0, 5),
            is_available: !conflictingAppointment,
            is_booked: !!conflictingAppointment,
            appointment_id: conflictingAppointment?.id,
          }
        });

        timeSlots.push(timeSlot);

        // Move to next slot with buffer time
        currentTime = new Date(slotEndTime.getTime() + block.buffer_time * 60000);
      }

      return timeSlots;
    } catch (error) {
      console.error('Error generating time slots:', error);
      throw new Error('Failed to generate time slots');
    }
  }

  /**
   * Get available time slots for a specific date
   */
  static async getAvailableTimeSlots(doctorId: string, date: Date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const blocks = await db.scheduleBlock.findMany({
        where: {
          schedule: { doctor_id: doctorId },
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          is_working: true
        },
        include: {
          time_slots: {
            where: { is_available: true, is_booked: false },
            orderBy: { start_time: 'asc' }
          }
        }
      });

      return blocks.flatMap(block => block.time_slots);
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw new Error('Failed to fetch available time slots');
    }
  }

  /**
   * Book a time slot
   */
  static async bookTimeSlot(timeSlotId: string, appointmentId: string) {
    try {
      const timeSlot = await db.timeSlot.update({
        where: { id: timeSlotId },
        data: {
          is_booked: true,
          appointment_id: appointmentId
        }
      });

      return timeSlot;
    } catch (error) {
      console.error('Error booking time slot:', error);
      throw new Error('Failed to book time slot');
    }
  }

  /**
   * Create calendar integration
   */
  static async createCalendarIntegration(doctorId: string, integrationData: {
    provider: string;
    provider_calendar_id: string;
    calendar_name: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: Date;
    sync_direction?: string;
  }) {
    try {
      // Encrypt tokens
      const encryptedAccessToken = PHIEncryption.encrypt(integrationData.access_token);
      const encryptedRefreshToken = integrationData.refresh_token 
        ? PHIEncryption.encrypt(integrationData.refresh_token) 
        : null;

      const integration = await db.calendarIntegration.create({
        data: {
          doctor_id: doctorId,
          provider: integrationData.provider,
          provider_calendar_id: integrationData.provider_calendar_id,
          calendar_name: integrationData.calendar_name,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_at: integrationData.expires_at,
          sync_direction: integrationData.sync_direction || 'BIDIRECTIONAL',
        }
      });

      return integration;
    } catch (error) {
      console.error('Error creating calendar integration:', error);
      throw new Error('Failed to create calendar integration');
    }
  }

  /**
   * Sync appointment to calendar
   */
  static async syncAppointmentToCalendar(appointmentId: string, calendarId: string) {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true
        }
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const integration = await db.calendarIntegration.findFirst({
        where: {
          doctor_id: appointment.doctor_id,
          provider_calendar_id: calendarId,
          is_active: true
        }
      });

      if (!integration) {
        throw new Error('Calendar integration not found');
      }

      // Decrypt access token
      const accessToken = PHIEncryption.decrypt(integration.access_token);
      const refreshToken = integration.refresh_token 
        ? PHIEncryption.decrypt(integration.refresh_token) 
        : undefined;

      const calendarService = new GoogleCalendarService(accessToken, refreshToken);

      const calendarEvent = await calendarService.syncAppointmentToCalendar(
        calendarId,
        {
          id: appointment.id,
          patient: {
            first_name: appointment.patient.first_name,
            last_name: appointment.patient.last_name,
            email: appointment.patient.email || ''
          },
          doctor: {
            name: appointment.doctor.name,
            email: appointment.doctor.email || ''
          },
          appointment_date: appointment.appointment_date,
          time: appointment.time,
          type: appointment.type,
          note: appointment.note || undefined
        }
      );

      // Store calendar event reference
      await db.calendarEvent.create({
        data: {
          integration_id: integration.id,
          appointment_id: appointmentId,
          provider_event_id: calendarEvent.id!,
          title: calendarEvent.summary,
          description: calendarEvent.description,
          start_time: new Date(calendarEvent.start.dateTime),
          end_time: new Date(calendarEvent.end.dateTime),
          is_all_day: false,
          location: calendarEvent.location,
          attendees: calendarEvent.attendees,
          status: 'CONFIRMED',
          event_type: 'APPOINTMENT'
        }
      });

      return calendarEvent;
    } catch (error) {
      console.error('Error syncing appointment to calendar:', error);
      throw new Error('Failed to sync appointment to calendar');
    }
  }

  /**
   * Create schedule notification
   */
  static async createScheduleNotification(notificationData: {
    doctor_id: string;
    appointment_id?: string;
    type: string;
    recipient_type: string;
    send_time: Date;
    template_id?: string;
    custom_message?: string;
  }) {
    try {
      const notification = await db.scheduleNotification.create({
        data: notificationData
      });

      return notification;
    } catch (error) {
      console.error('Error creating schedule notification:', error);
      throw new Error('Failed to create schedule notification');
    }
  }

  /**
   * Get doctor's calendar integrations
   */
  static async getCalendarIntegrations(doctorId: string) {
    try {
      const integrations = await db.calendarIntegration.findMany({
        where: { doctor_id: doctorId },
        orderBy: { created_at: 'desc' }
      });
      
      return integrations.map(integration => ({
        ...integration,
        access_token: '***encrypted***',
        refresh_token: integration.refresh_token ? '***encrypted***' : null
      }));
    } catch (error) {
      console.error('Error fetching calendar integrations:', error);
      // Return empty array instead of throwing error to prevent UI crashes
      return [];
    }
  }
}