import { 
  AppointmentDetails, 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest,
  RescheduleAppointmentRequest,
  CancelAppointmentRequest,
  DoctorAvailability,
  TimeSlot,
  SchedulingConflict,
  AvailabilityResponse,
  AppointmentListResponse,
  SchedulingApiResponse,
  GetAvailabilityRequest,
  GetAvailableSlotsRequest,
  AppointmentStatus,
  AvailabilityStatus
} from '@/types/scheduling';

export class SchedulingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  /**
   * Get appointments for a doctor with pagination and filtering
   */
  async getAppointments(params: {
    doctorId: string;
    page?: number;
    limit?: number;
    status?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<AppointmentListResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('doctorId', params.doctorId);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.status) searchParams.append('status', params.status.join(','));
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);

      const response = await fetch(`${this.baseUrl}/scheduling/appointments?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Return fallback data for development
      return {
        appointments: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: 0,
          totalPages: 1
        },
        filters: {
          status: params.status as AppointmentStatus[],
          dateRange: params.startDate && params.endDate ? {
            start: new Date(params.startDate),
            end: new Date(params.endDate)
          } : undefined,
          doctorId: params.doctorId
        }
      };
    }
  }

  /**
   * Get doctor availability
   */
  async getDoctorAvailability(params: GetAvailabilityRequest): Promise<AvailabilityResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('doctorId', params.doctorId);
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);
      if (params.includeBreaks !== undefined) searchParams.append('includeBreaks', params.includeBreaks.toString());
      if (params.includeLeave !== undefined) searchParams.append('includeLeave', params.includeLeave.toString());
      if (params.serviceId) searchParams.append('serviceId', params.serviceId.toString());
      if (params.duration) searchParams.append('duration', params.duration.toString());

      const response = await fetch(`${this.baseUrl}/scheduling/availability?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Return fallback data for development
      return {
        doctorId: params.doctorId,
        availability: {
          id: 'fallback',
          doctorId: params.doctorId,
          status: AvailabilityStatus.AVAILABLE,
          workingDays: [],
          leaveRequests: [],
          availabilityUpdates: [],
          currentSchedule: {
            doctorId: params.doctorId,
            weekStart: new Date(params.startDate),
            weekEnd: new Date(params.endDate),
            days: [],
            totalWorkingHours: 0,
            totalAvailableSlots: 0
          },
          isCurrentlyAvailable: true
        },
        availableSlots: [],
        conflicts: []
      };
    }
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableSlots(params: GetAvailableSlotsRequest): Promise<{ availableSlots: TimeSlot[] }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('doctorId', params.doctorId);
      searchParams.append('date', params.date);
      if (params.duration) searchParams.append('duration', params.duration.toString());
      if (params.serviceId) searchParams.append('serviceId', params.serviceId.toString());
      if (params.excludeAppointmentId) searchParams.append('excludeAppointmentId', params.excludeAppointmentId.toString());

      const response = await fetch(`${this.baseUrl}/scheduling/available-slots?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch available slots: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Return fallback data for development
      return {
        availableSlots: []
      };
    }
  }

  /**
   * Create a new appointment
   */
  async createAppointment(appointment: CreateAppointmentRequest): Promise<AppointmentDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduling/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      });

      if (!response.ok) {
        throw new Error(`Failed to create appointment: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update an existing appointment
   */
  async updateAppointment(appointment: UpdateAppointmentRequest): Promise<AppointmentDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduling/appointments/${appointment.appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      });

      if (!response.ok) {
        throw new Error(`Failed to update appointment: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(appointmentId: number, data: Omit<RescheduleAppointmentRequest, 'appointmentId'>): Promise<AppointmentDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduling/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId, ...data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reschedule appointment: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: number, data: Omit<CancelAppointmentRequest, 'appointmentId'>): Promise<AppointmentDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduling/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId, ...data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel appointment: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(appointmentId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduling/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete appointment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  /**
   * Check for scheduling conflicts
   */
  async checkConflicts(doctorId: string, appointmentDate: string, time: string, duration: number = 30): Promise<{ hasConflicts: boolean; conflicts: SchedulingConflict[] }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('doctorId', doctorId);
      searchParams.append('appointmentDate', appointmentDate);
      searchParams.append('time', time);
      searchParams.append('duration', duration.toString());

      const response = await fetch(`${this.baseUrl}/scheduling/check-conflicts?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to check conflicts: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error checking conflicts:', error);
      // Return fallback data for development
      return {
        hasConflicts: false,
        conflicts: []
      };
    }
  }

  /**
   * Validate appointment time
   */
  async validateAppointmentTime(doctorId: string, appointmentDate: string, time: string, duration: number = 30): Promise<boolean> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('doctorId', doctorId);
      searchParams.append('appointmentDate', appointmentDate);
      searchParams.append('time', time);
      searchParams.append('duration', duration.toString());

      const response = await fetch(`${this.baseUrl}/scheduling/validate-time?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to validate appointment time: ${response.statusText}`);
      }

      const result = await response.json();
      return result.isValid || false;
    } catch (error) {
      console.error('Error validating appointment time:', error);
      return false;
    }
  }

  /**
   * Get next available slot
   */
  async getNextAvailableSlot(doctorId: string, fromDate: string, duration: number = 30): Promise<TimeSlot | null> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('doctorId', doctorId);
      searchParams.append('fromDate', fromDate);
      searchParams.append('duration', duration.toString());

      const response = await fetch(`${this.baseUrl}/scheduling/next-available-slot?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get next available slot: ${response.statusText}`);
      }

      const result = await response.json();
      return result.nextSlot || null;
    } catch (error) {
      console.error('Error getting next available slot:', error);
      return null;
    }
  }

  /**
   * Bulk create appointments
   */
  async bulkCreateAppointments(appointments: CreateAppointmentRequest[]): Promise<SchedulingApiResponse<AppointmentDetails[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduling/appointments/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointments }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk create appointments: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error bulk creating appointments:', error);
      throw error;
    }
  }

  /**
   * Get scheduling metrics
   */
  async getSchedulingMetrics(doctorId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('doctorId', doctorId);
      searchParams.append('startDate', startDate);
      searchParams.append('endDate', endDate);

      const response = await fetch(`${this.baseUrl}/scheduling/metrics?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scheduling metrics: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching scheduling metrics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const schedulingService = new SchedulingService();
