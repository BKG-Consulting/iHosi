import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface CalendarEvent {
  id?: string;
  summary: string;
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
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Get list of user's calendars
   */
  async getCalendarList(): Promise<CalendarListEntry[]> {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw new Error('Failed to fetch calendar list');
    }
  }

  /**
   * Get primary calendar ID
   */
  async getPrimaryCalendarId(): Promise<string> {
    try {
      const calendars = await this.getCalendarList();
      const primaryCalendar = calendars.find(cal => cal.primary);
      return primaryCalendar?.id || calendars[0]?.id || 'primary';
    } catch (error) {
      console.error('Error getting primary calendar:', error);
      return 'primary';
    }
  }

  /**
   * Create a calendar event
   */
  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update a calendar event
   */
  async updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        resource: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Get events from a calendar within a date range
   */
  async getEvents(calendarId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Sync appointment to calendar
   */
  async syncAppointmentToCalendar(
    calendarId: string,
    appointment: {
      id: string;
      patient: { first_name: string; last_name: string; email: string };
      doctor: { name: string; email: string };
      appointment_date: Date;
      time: string;
      type: string;
      note?: string;
    }
  ): Promise<CalendarEvent> {
    const startDateTime = new Date(`${appointment.appointment_date.toISOString().split('T')[0]}T${appointment.time}`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes duration

    const event: CalendarEvent = {
      summary: `Appointment with ${appointment.patient.first_name} ${appointment.patient.last_name}`,
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
        },
        {
          email: appointment.doctor.email,
          displayName: appointment.doctor.name,
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    return await this.createEvent(calendarId, event);
  }

  /**
   * Create recurring schedule blocks
   */
  async createRecurringSchedule(
    calendarId: string,
    schedule: {
      name: string;
      startDate: Date;
      endDate: Date;
      daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
      startTime: string; // "09:00"
      endTime: string; // "17:00"
      breakStart?: string;
      breakEnd?: string;
    }
  ): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];
    const currentDate = new Date(schedule.startDate);

    while (currentDate <= schedule.endDate) {
      if (schedule.daysOfWeek.includes(currentDate.getDay())) {
        const startDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${schedule.startTime}`);
        const endDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${schedule.endTime}`);

        // Create main working hours block
        const workingBlock: CalendarEvent = {
          summary: schedule.name,
          description: 'Working hours - Available for appointments',
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          event_type: 'WORKING_HOURS',
        };

        events.push(await this.createEvent(calendarId, workingBlock));

        // Create break block if specified
        if (schedule.breakStart && schedule.breakEnd) {
          const breakStartDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${schedule.breakStart}`);
          const breakEndDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${schedule.breakEnd}`);

          const breakBlock: CalendarEvent = {
            summary: 'Break Time',
            description: 'Unavailable for appointments',
            start: {
              dateTime: breakStartDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: breakEndDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            event_type: 'BREAK',
          };

          events.push(await this.createEvent(calendarId, breakBlock));
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  }

  /**
   * Check if access token is valid
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.calendar.calendarList.list({ maxResults: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<{ access_token: string; refresh_token?: string }> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }
}

/**
 * Utility function to create Google Calendar service instance
 */
export function createGoogleCalendarService(accessToken: string, refreshToken?: string): GoogleCalendarService {
  return new GoogleCalendarService(accessToken, refreshToken);
}

/**
 * Utility function to generate Google OAuth URL
 */
export function generateGoogleOAuthURL(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}