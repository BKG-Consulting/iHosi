import { db } from '@/lib/db';
import { PHIEncryption } from '@/lib/encryption';
import { logAudit } from '@/lib/audit';

export interface CustomCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
  location?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'sms' | 'push';
      minutes: number;
    }>;
  };
  eventType: 'APPOINTMENT' | 'BREAK' | 'BLOCKED' | 'PERSONAL' | 'EMERGENCY';
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  isRecurring?: boolean;
  recurrencePattern?: string;
  metadata?: Record<string, any>;
}

export interface CalendarView {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  viewType: 'DAY' | 'WEEK' | 'MONTH' | 'AGENDA';
  filters?: {
    eventTypes?: string[];
    doctors?: string[];
    departments?: string[];
  };
  settings?: {
    showWeekends: boolean;
    workingHoursStart: string;
    workingHoursEnd: string;
    timeSlotDuration: number;
  };
}

export interface CalendarSyncSettings {
  autoSync: boolean;
  syncDirection: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
  conflictResolution: 'KEEP_LOCAL' | 'KEEP_REMOTE' | 'MANUAL';
  syncInterval: number; // minutes
  lastSyncAt?: Date;
}

export class CustomCalendarService {
  private doctorId: string;
  private calendarId: string;

  constructor(doctorId: string, calendarId?: string) {
    this.doctorId = doctorId;
    this.calendarId = calendarId || 'primary';
  }

  /**
   * Create a new calendar event
   */
  async createEvent(event: Omit<CustomCalendarEvent, 'id'>): Promise<CustomCalendarEvent> {
    try {
      // Validate event data
      this.validateEventData(event);

      // Check for conflicts
      await this.checkConflicts(event);

      // Create the event in database
      const calendarEvent = await db.calendarEvent.create({
        data: {
          integration_id: await this.getIntegrationId(),
          provider_event_id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: event.title,
          description: event.description,
          start_time: new Date(event.start.dateTime),
          end_time: new Date(event.end.dateTime),
          is_all_day: false,
          location: event.location,
          attendees: event.attendees,
          status: event.status,
          event_type: event.eventType,
          metadata: event.metadata,
        },
        include: {
          integration: true,
          appointment: true,
        },
      });

      // Log audit trail
      await logAudit({
        action: 'CREATE',
        resourceType: 'CALENDAR_EVENT',
        resourceId: calendarEvent.id,
        patientId: event.attendees?.[0]?.email || null,
        reason: 'Calendar event created',
        metadata: {
          eventType: event.eventType,
          startTime: event.start.dateTime,
          endTime: event.end.dateTime,
          doctorId: this.doctorId,
        },
      });

      // Send notifications if needed
      if (event.reminders?.overrides) {
        await this.scheduleReminders(calendarEvent.id, event.reminders.overrides);
      }

      return this.mapToCustomEvent(calendarEvent);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, updates: Partial<CustomCalendarEvent>): Promise<CustomCalendarEvent> {
    try {
      const existingEvent = await db.calendarEvent.findUnique({
        where: { id: eventId },
        include: { integration: true, appointment: true },
      });

      if (!existingEvent) {
        throw new Error('Event not found');
      }

      // Check for conflicts if time is being changed
      if (updates.start || updates.end) {
        const updatedEvent = { ...existingEvent, ...updates };
        await this.checkConflicts(updatedEvent);
      }

      const updatedEvent = await db.calendarEvent.update({
        where: { id: eventId },
        data: {
          title: updates.title,
          description: updates.description,
          start_time: updates.start ? new Date(updates.start.dateTime) : undefined,
          end_time: updates.end ? new Date(updates.end.dateTime) : undefined,
          location: updates.location,
          attendees: updates.attendees,
          status: updates.status,
          event_type: updates.eventType,
          metadata: updates.metadata,
          last_synced_at: new Date(),
        },
        include: {
          integration: true,
          appointment: true,
        },
      });

      // Log audit trail
      await logAudit({
        action: 'UPDATE',
        resourceType: 'CALENDAR_EVENT',
        resourceId: eventId,
        patientId: updates.attendees?.[0]?.email || null,
        reason: 'Calendar event updated',
        metadata: {
          changes: Object.keys(updates),
          doctorId: this.doctorId,
        },
      });

      return this.mapToCustomEvent(updatedEvent);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const event = await db.calendarEvent.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      await db.calendarEvent.delete({
        where: { id: eventId },
      });

      // Log audit trail
      await logAudit({
        action: 'DELETE',
        resourceType: 'CALENDAR_EVENT',
        resourceId: eventId,
        patientId: null,
        reason: 'Calendar event deleted',
        metadata: {
          eventType: event.event_type,
          doctorId: this.doctorId,
        },
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Get events within a date range
   */
  async getEvents(startDate: Date, endDate: Date): Promise<CustomCalendarEvent[]> {
    try {
      const events = await db.calendarEvent.findMany({
        where: {
          integration: {
            doctor_id: this.doctorId,
          },
          start_time: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          integration: true,
          appointment: true,
        },
        orderBy: { start_time: 'asc' },
      });

      return events.map(event => this.mapToCustomEvent(event));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableSlots(date: Date, duration: number = 30): Promise<Array<{
    start: string;
    end: string;
    isAvailable: boolean;
    conflictReason?: string;
  }>> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get doctor's working hours
      const doctor = await db.doctor.findUnique({
        where: { id: this.doctorId },
        include: {
          schedules: {
            where: { is_active: true },
            include: {
              schedule_templates: {
                where: {
                  day_of_week: date.getDay(),
                  is_working: true,
                },
              },
            },
          },
        },
      });

      if (!doctor || !doctor.schedules.length) {
        return [];
      }

      const workingHours = doctor.schedules[0].schedule_templates[0];
      if (!workingHours) {
        return [];
      }

      // Generate time slots
      const slots = [];
      const startTime = new Date(`${date.toISOString().split('T')[0]}T${workingHours.start_time}`);
      const endTime = new Date(`${date.toISOString().split('T')[0]}T${workingHours.end_time}`);

      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        
        if (slotEnd <= endTime) {
          // Check for conflicts
          const conflicts = await this.checkTimeSlotConflicts(currentTime, slotEnd);
          
          slots.push({
            start: currentTime.toTimeString().slice(0, 5),
            end: slotEnd.toTimeString().slice(0, 5),
            isAvailable: conflicts.length === 0,
            conflictReason: conflicts.length > 0 ? conflicts[0].reason : undefined,
          });
        }

        currentTime = new Date(slotEnd.getTime() + workingHours.buffer_time * 60000);
      }

      return slots;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw new Error('Failed to fetch available slots');
    }
  }

  /**
   * Sync appointment to calendar
   */
  async syncAppointmentToCalendar(appointment: {
    id: string;
    patient: { first_name: string; last_name: string; email: string };
    doctor: { name: string; email: string };
    appointment_date: Date;
    time: string;
    type: string;
    note?: string;
  }): Promise<CustomCalendarEvent> {
    try {
      const startDateTime = new Date(`${appointment.appointment_date.toISOString().split('T')[0]}T${appointment.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes duration

      const event: Omit<CustomCalendarEvent, 'id'> = {
        title: `Appointment with ${appointment.patient.first_name} ${appointment.patient.last_name}`,
        description: `Appointment Type: ${appointment.type}${appointment.note ? `\n\nNotes: ${appointment.note}` : ''}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: [
          {
            email: appointment.patient.email,
            displayName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
            responseStatus: 'accepted',
          },
          {
            email: appointment.doctor.email,
            displayName: appointment.doctor.name,
            responseStatus: 'accepted',
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'sms', minutes: 30 }, // 30 minutes before
          ],
        },
        eventType: 'APPOINTMENT',
        status: 'CONFIRMED',
        metadata: {
          appointmentId: appointment.id,
          appointmentType: appointment.type,
        },
      };

      const calendarEvent = await this.createEvent(event);

      // Link the calendar event to the appointment
      await db.appointment.update({
        where: { id: appointment.id },
        data: {
          calendar_event_id: calendarEvent.id,
        },
      });

      return calendarEvent;
    } catch (error) {
      console.error('Error syncing appointment to calendar:', error);
      throw new Error('Failed to sync appointment to calendar');
    }
  }

  /**
   * Create recurring schedule blocks
   */
  async createRecurringSchedule(schedule: {
    name: string;
    startDate: Date;
    endDate: Date;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // "09:00"
    endTime: string; // "17:00"
    breakStart?: string;
    breakEnd?: string;
    appointmentDuration?: number;
    bufferTime?: number;
  }): Promise<CustomCalendarEvent[]> {
    try {
      const events: CustomCalendarEvent[] = [];
      const currentDate = new Date(schedule.startDate);

      while (currentDate <= schedule.endDate) {
        if (schedule.daysOfWeek.includes(currentDate.getDay())) {
          const startDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${schedule.startTime}`);
          const endDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${schedule.endTime}`);

          // Create main working hours block
          const workingBlock: Omit<CustomCalendarEvent, 'id'> = {
            title: schedule.name,
            description: 'Working hours - Available for appointments',
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            eventType: 'BLOCKED',
            status: 'CONFIRMED',
            metadata: {
              isRecurring: true,
              recurrencePattern: 'WEEKLY',
              appointmentDuration: schedule.appointmentDuration || 30,
              bufferTime: schedule.bufferTime || 15,
            },
          };

          events.push(await this.createEvent(workingBlock));

          // Create break block if specified
          if (schedule.breakStart && schedule.breakEnd) {
            const breakStartDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${schedule.breakStart}`);
            const breakEndDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${schedule.breakEnd}`);

            const breakBlock: Omit<CustomCalendarEvent, 'id'> = {
              title: 'Break Time',
              description: 'Unavailable for appointments',
              start: {
                dateTime: breakStartDateTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              end: {
                dateTime: breakEndDateTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              eventType: 'BREAK',
              status: 'CONFIRMED',
              metadata: {
                isRecurring: true,
                recurrencePattern: 'WEEKLY',
              },
            };

            events.push(await this.createEvent(breakBlock));
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return events;
    } catch (error) {
      console.error('Error creating recurring schedule:', error);
      throw new Error('Failed to create recurring schedule');
    }
  }

  /**
   * Get calendar views
   */
  async getCalendarViews(): Promise<CalendarView[]> {
    try {
      // For now, return default views. In the future, this could be stored in database
      return [
        {
          id: 'day',
          name: 'Day View',
          description: 'View appointments for a single day',
          isDefault: true,
          viewType: 'DAY',
          settings: {
            showWeekends: true,
            workingHoursStart: '08:00',
            workingHoursEnd: '18:00',
            timeSlotDuration: 30,
          },
        },
        {
          id: 'week',
          name: 'Week View',
          description: 'View appointments for the current week',
          isDefault: false,
          viewType: 'WEEK',
          settings: {
            showWeekends: true,
            workingHoursStart: '08:00',
            workingHoursEnd: '18:00',
            timeSlotDuration: 30,
          },
        },
        {
          id: 'month',
          name: 'Month View',
          description: 'View appointments for the current month',
          isDefault: false,
          viewType: 'MONTH',
          settings: {
            showWeekends: true,
            workingHoursStart: '08:00',
            workingHoursEnd: '18:00',
            timeSlotDuration: 30,
          },
        },
      ];
    } catch (error) {
      console.error('Error fetching calendar views:', error);
      throw new Error('Failed to fetch calendar views');
    }
  }

  /**
   * Private helper methods
   */
  private async getIntegrationId(): Promise<string> {
    const integration = await db.calendarIntegration.findFirst({
      where: {
        doctor_id: this.doctorId,
        provider: 'CUSTOM_CALENDAR',
        is_active: true,
      },
    });

    if (!integration) {
      // Create default integration
      const newIntegration = await db.calendarIntegration.create({
        data: {
          doctor_id: this.doctorId,
          provider: 'CUSTOM_CALENDAR',
          provider_calendar_id: 'primary',
          calendar_name: 'Primary Calendar',
          access_token: 'custom_calendar_token',
          is_active: true,
          sync_enabled: true,
          sync_direction: 'BIDIRECTIONAL',
        },
      });
      return newIntegration.id;
    }

    return integration.id;
  }

  private validateEventData(event: Omit<CustomCalendarEvent, 'id'>): void {
    if (!event.title) {
      throw new Error('Event title is required');
    }
    if (!event.start?.dateTime || !event.end?.dateTime) {
      throw new Error('Event start and end times are required');
    }
    if (new Date(event.start.dateTime) >= new Date(event.end.dateTime)) {
      throw new Error('Event end time must be after start time');
    }
  }

  private async checkConflicts(event: Omit<CustomCalendarEvent, 'id'>): Promise<void> {
    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);

    const conflicts = await this.checkTimeSlotConflicts(startTime, endTime);
    if (conflicts.length > 0) {
      throw new Error(`Scheduling conflict: ${conflicts[0].reason}`);
    }
  }

  private async checkTimeSlotConflicts(startTime: Date, endTime: Date): Promise<Array<{ reason: string }>> {
    const conflicts = await db.calendarEvent.findMany({
      where: {
        integration: {
          doctor_id: this.doctorId,
        },
        status: 'CONFIRMED',
        OR: [
          {
            start_time: {
              lt: endTime,
              gte: startTime,
            },
          },
          {
            end_time: {
              gt: startTime,
              lte: endTime,
            },
          },
        ],
      },
    });

    return conflicts.map(conflict => ({
      reason: `Conflicts with "${conflict.title}" (${conflict.start_time.toLocaleTimeString()} - ${conflict.end_time.toLocaleTimeString()})`,
    }));
  }

  private async scheduleReminders(eventId: string, reminders: Array<{ method: string; minutes: number }>): Promise<void> {
    for (const reminder of reminders) {
      await db.scheduleNotification.create({
        data: {
          doctor_id: this.doctorId,
          appointment_id: null,
          type: 'REMINDER',
          recipient_type: 'BOTH',
          send_time: new Date(Date.now() + reminder.minutes * 60 * 1000),
          custom_message: `Reminder: You have an upcoming appointment`,
        },
      });
    }
  }

  private mapToCustomEvent(event: any): CustomCalendarEvent {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      start: {
        dateTime: event.start_time.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.end_time.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: event.attendees,
      location: event.location,
      eventType: event.event_type,
      status: event.status,
      metadata: event.metadata,
    };
  }
}

/**
 * Utility function to create custom calendar service instance
 */
export function createCustomCalendarService(doctorId: string, calendarId?: string): CustomCalendarService {
  return new CustomCalendarService(doctorId, calendarId);
}

