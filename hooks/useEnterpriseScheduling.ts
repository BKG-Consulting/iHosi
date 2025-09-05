import { useState, useEffect, useCallback } from 'react';
import { EnterpriseSchedulingService, ScheduleTemplateData, AvailabilityOverrideData } from '@/lib/enterprise-scheduling-service';

interface UseEnterpriseSchedulingOptions {
  doctorId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SchedulingState {
  schedules: any[];
  availableSlots: any[];
  conflicts: any;
  loading: boolean;
  error: string | null;
}

export const useEnterpriseScheduling = (options: UseEnterpriseSchedulingOptions) => {
  const [state, setState] = useState<SchedulingState>({
    schedules: [],
    availableSlots: [],
    conflicts: null,
    loading: false,
    error: null,
  });

  const { doctorId, autoRefresh = true, refreshInterval = 30000 } = options;

  // Fetch doctor schedules
  const fetchSchedules = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      const response = await fetch(`/api/scheduling/doctor/${doctorId}/schedules?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      const data = await response.json();
      setState(prev => ({ ...prev, schedules: data.schedules, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      }));
    }
  }, [doctorId]);

  // Fetch available time slots
  const fetchAvailableSlots = useCallback(async (date: Date, duration: number = 30) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        date: date.toISOString(),
        duration: duration.toString(),
      });

      const response = await fetch(`/api/scheduling/doctor/${doctorId}/available-slots?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      setState(prev => ({ ...prev, availableSlots: data.slots, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch available slots',
        loading: false 
      }));
    }
  }, [doctorId]);

  // Check for scheduling conflicts
  const checkConflicts = useCallback(async (
    doctorId: string,
    appointmentDate: Date,
    time: string,
    durationMinutes?: number
  ) => {
    try {
      const response = await fetch('/api/scheduling/check-conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          appointment_date: appointmentDate.toISOString(),
          time,
          duration_minutes: durationMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check conflicts');
      }

      const conflictResult = await response.json();
      setState(prev => ({ ...prev, conflicts: conflictResult }));
      return conflictResult;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to check conflicts'
      }));
      throw error;
    }
  }, []);

  // Book an appointment
  const bookAppointment = useCallback(async (bookingData: {
    patient_id?: string;
    doctor_id: string;
    appointment_date: Date;
    time: string;
    type: string;
    note?: string;
    service_id?: number;
    booking_source?: string;
    confirmation_required?: boolean;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/scheduling/book-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          appointment_date: bookingData.appointment_date.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const result = await response.json();
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to book appointment',
        loading: false 
      }));
      throw error;
    }
  }, []);

  // Create a new schedule
  const createSchedule = useCallback(async (scheduleData: {
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
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/scheduling/doctor/${doctorId}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule');
      }

      const schedule = await response.json();
      setState(prev => ({ 
        ...prev, 
        schedules: [...prev.schedules, schedule],
        loading: false 
      }));
      return schedule;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create schedule',
        loading: false 
      }));
      throw error;
    }
  }, [doctorId]);

  // Create schedule template
  const createScheduleTemplate = useCallback(async (scheduleId: string, templateData: ScheduleTemplateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/scheduling/schedules/${scheduleId}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule template');
      }

      const template = await response.json();
      setState(prev => ({ ...prev, loading: false }));
      return template;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create schedule template',
        loading: false 
      }));
      throw error;
    }
  }, []);

  // Create availability override
  const createAvailabilityOverride = useCallback(async (overrideData: AvailabilityOverrideData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/scheduling/doctor/${doctorId}/availability-overrides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(overrideData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create availability override');
      }

      const override = await response.json();
      setState(prev => ({ ...prev, loading: false }));
      return override;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create availability override',
        loading: false 
      }));
      throw error;
    }
  }, [doctorId]);

  // Get scheduling analytics
  const getSchedulingAnalytics = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`/api/scheduling/doctor/${doctorId}/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheduling analytics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
      }));
      throw error;
    }
  }, [doctorId]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fetchSchedules(startOfMonth, endOfMonth);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSchedules]);

  // Initial load
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    fetchSchedules(startOfMonth, endOfMonth);
  }, [fetchSchedules]);

  return {
    ...state,
    fetchSchedules,
    fetchAvailableSlots,
    checkConflicts,
    bookAppointment,
    createSchedule,
    createScheduleTemplate,
    createAvailabilityOverride,
    getSchedulingAnalytics,
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
};

