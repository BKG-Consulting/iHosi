import { useState, useEffect, useCallback } from 'react';
import { CustomCalendarEvent, CalendarView } from '@/lib/custom-calendar-service';

interface UseCustomCalendarOptions {
  doctorId: string;
  calendarId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface CalendarState {
  events: CustomCalendarEvent[];
  views: CalendarView[];
  availableSlots: Array<{
    start: string;
    end: string;
    isAvailable: boolean;
    conflictReason?: string;
  }>;
  loading: boolean;
  error: string | null;
}

export const useCustomCalendar = (options: UseCustomCalendarOptions) => {
  const [state, setState] = useState<CalendarState>({
    events: [],
    views: [],
    availableSlots: [],
    loading: false,
    error: null,
  });

  const { doctorId, calendarId = 'primary', autoRefresh = true, refreshInterval = 30000 } = options;

  // Fetch calendar events
  const fetchEvents = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        calendarId,
      });

      const response = await fetch(`/api/calendar/custom?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setState(prev => ({ ...prev, events: data.events, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      }));
    }
  }, [calendarId]);

  // Fetch calendar views
  const fetchViews = useCallback(async () => {
    try {
      const params = new URLSearchParams({ calendarId });
      const response = await fetch(`/api/calendar/custom/views?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch views');
      }

      const data = await response.json();
      setState(prev => ({ ...prev, views: data.views }));
    } catch (error) {
      console.error('Error fetching calendar views:', error);
    }
  }, [calendarId]);

  // Fetch available slots
  const fetchAvailableSlots = useCallback(async (date: Date, duration: number = 30) => {
    try {
      const params = new URLSearchParams({
        date: date.toISOString(),
        duration: duration.toString(),
        calendarId,
      });

      const response = await fetch(`/api/calendar/custom/available-slots?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      setState(prev => ({ ...prev, availableSlots: data.slots }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch available slots'
      }));
    }
  }, [calendarId]);

  // Create calendar event
  const createEvent = useCallback(async (eventData: Omit<CustomCalendarEvent, 'id'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/calendar/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          calendarId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      setState(prev => ({ 
        ...prev, 
        events: [...prev.events, newEvent],
        loading: false 
      }));

      return newEvent;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create event',
        loading: false 
      }));
      throw error;
    }
  }, [calendarId]);

  // Update calendar event
  const updateEvent = useCallback(async (eventId: string, updates: Partial<CustomCalendarEvent>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/calendar/custom/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          calendarId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      setState(prev => ({ 
        ...prev, 
        events: prev.events.map(event => 
          event.id === eventId ? updatedEvent : event
        ),
        loading: false 
      }));

      return updatedEvent;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update event',
        loading: false 
      }));
      throw error;
    }
  }, [calendarId]);

  // Delete calendar event
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({ calendarId });
      const response = await fetch(`/api/calendar/custom/${eventId}?${params}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setState(prev => ({ 
        ...prev, 
        events: prev.events.filter(event => event.id !== eventId),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete event',
        loading: false 
      }));
      throw error;
    }
  }, [calendarId]);

  // Sync appointment to calendar
  const syncAppointment = useCallback(async (appointment: {
    id: string;
    patient: { first_name: string; last_name: string; email: string };
    doctor: { name: string; email: string };
    appointment_date: Date;
    time: string;
    type: string;
    note?: string;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const startDateTime = new Date(`${appointment.appointment_date.toISOString().split('T')[0]}T${appointment.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

      const eventData: Omit<CustomCalendarEvent, 'id'> = {
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
            { method: 'email', minutes: 24 * 60 },
            { method: 'sms', minutes: 30 },
          ],
        },
        eventType: 'APPOINTMENT',
        status: 'CONFIRMED',
        metadata: {
          appointmentId: appointment.id,
          appointmentType: appointment.type,
        },
      };

      const newEvent = await createEvent(eventData);
      setState(prev => ({ ...prev, loading: false }));
      return newEvent;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to sync appointment',
        loading: false 
      }));
      throw error;
    }
  }, [createEvent]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fetchEvents(startOfMonth, endOfMonth);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchEvents]);

  // Initial load
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    fetchEvents(startOfMonth, endOfMonth);
    fetchViews();
  }, [fetchEvents, fetchViews]);

  return {
    ...state,
    fetchEvents,
    fetchViews,
    fetchAvailableSlots,
    createEvent,
    updateEvent,
    deleteEvent,
    syncAppointment,
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
};

