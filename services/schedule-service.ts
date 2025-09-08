import { 
  WorkingHours, 
  ScheduleTemplate, 
  LeaveRequest, 
  ScheduleConflict 
} from '@/types/scheduling';

export interface ScheduleServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface DoctorSchedule {
  workingHours: WorkingHours[];
  appointmentDuration: number;
  bufferTime: number;
  templates?: ScheduleTemplate[];
  leaveRequests: LeaveRequest[];
  availabilityUpdates: any[];
}

export class ScheduleService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Fetch doctor's schedule
   */
  async getDoctorSchedule(doctorId: string): Promise<ScheduleServiceResponse<DoctorSchedule>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/doctors/${doctorId}/schedule`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to fetch schedule',
          errors: result.errors
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      return {
        success: false,
        message: 'Network error while fetching schedule'
      };
    }
  }

  /**
   * Update doctor's schedule
   */
  async updateDoctorSchedule(
    doctorId: string, 
    schedule: Partial<DoctorSchedule>
  ): Promise<ScheduleServiceResponse<DoctorSchedule>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/doctors/${doctorId}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(schedule),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to update schedule',
          errors: result.errors
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error updating doctor schedule:', error);
      return {
        success: false,
        message: 'Network error while updating schedule'
      };
    }
  }

  /**
   * Create leave request
   */
  async createLeaveRequest(
    doctorId: string,
    leaveRequest: {
      startDate: string;
      endDate: string;
      reason: string;
      type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'CONFERENCE' | 'OTHER';
    }
  ): Promise<ScheduleServiceResponse<LeaveRequest>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/doctors/${doctorId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(leaveRequest),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to create leave request',
          errors: result.errors
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error creating leave request:', error);
      return {
        success: false,
        message: 'Network error while creating leave request'
      };
    }
  }

  /**
   * Generate time slots based on working hours
   */
  generateTimeSlots(
    workingHours: WorkingHours,
    appointmentDuration: number,
    bufferTime: number
  ): Array<{
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
    isAvailable: boolean;
    maxBookings: number;
    currentBookings: number;
    type: 'REGULAR' | 'EMERGENCY' | 'FOLLOW_UP' | 'CONSULTATION';
  }> {
    const slots: any[] = [];
    
    if (!workingHours.isWorking) {
      return slots;
    }

    const start = new Date(`2000-01-01T${workingHours.startTime}`);
    const end = new Date(`2000-01-01T${workingHours.endTime}`);
    const breakStart = workingHours.breakStart ? new Date(`2000-01-01T${workingHours.breakStart}`) : null;
    const breakEnd = workingHours.breakEnd ? new Date(`2000-01-01T${workingHours.breakEnd}`) : null;
    
    let current = new Date(start);
    
    while (current < end) {
      const slotEnd = new Date(current.getTime() + appointmentDuration * 60000);
      
      // Skip if slot falls within break time
      if (breakStart && breakEnd && current >= breakStart && current < breakEnd) {
        current = new Date(breakEnd);
        continue;
      }
      
      // Skip if slot would extend beyond working hours
      if (slotEnd > end) {
        break;
      }
      
      const slot = {
        id: `slot-${current.getHours()}-${current.getMinutes()}`,
        startTime: current.toTimeString().slice(0, 5),
        endTime: slotEnd.toTimeString().slice(0, 5),
        duration: appointmentDuration,
        isAvailable: true,
        maxBookings: 1,
        currentBookings: 0,
        type: 'REGULAR' as const
      };
      
      slots.push(slot);
      current = new Date(current.getTime() + (appointmentDuration + bufferTime) * 60000);
    }
    
    return slots;
  }

  /**
   * Detect schedule conflicts
   */
  detectConflicts(
    workingHours: WorkingHours[],
    timeSlots: any[],
    leaveRequests: LeaveRequest[],
    appointments: any[]
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    // Check for overlapping time slots
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const slot1 = timeSlots[i];
        const slot2 = timeSlots[j];
        
        if (slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime) {
          conflicts.push({
            id: `overlap-${i}-${j}`,
            type: 'OVERLAP',
            severity: 'HIGH',
            title: 'Overlapping Time Slots',
            description: `Time slot ${slot1.startTime}-${slot1.endTime} overlaps with ${slot2.startTime}-${slot2.endTime}`,
            affectedSlots: [slot1.id, slot2.id],
            suggestedFix: 'Adjust one of the overlapping time slots',
            autoFixable: true
          });
        }
      }
    }

    // Check for break time violations
    workingHours.forEach(dayHours => {
      if (dayHours.isWorking && dayHours.breakStart && dayHours.breakEnd) {
        const breakStart = dayHours.breakStart;
        const breakEnd = dayHours.breakEnd;
        const conflictingSlots = timeSlots.filter(slot => 
          slot.startTime >= breakStart && slot.startTime < breakEnd
        );
        
        if (conflictingSlots.length > 0) {
          conflicts.push({
            id: `break-${dayHours.day}`,
            type: 'BREAK_VIOLATION',
            severity: 'MEDIUM',
            title: 'Break Time Violation',
            description: `${conflictingSlots.length} time slots scheduled during break time (${dayHours.breakStart}-${dayHours.breakEnd})`,
            affectedSlots: conflictingSlots.map(slot => slot.id),
            suggestedFix: 'Remove or reschedule slots during break time',
            autoFixable: true
          });
        }
      }
    });

    // Check for working hours violations
    workingHours.forEach(dayHours => {
      if (dayHours.isWorking) {
        const conflictingSlots = timeSlots.filter(slot => 
          slot.startTime < dayHours.startTime || slot.endTime > dayHours.endTime
        );
        
        if (conflictingSlots.length > 0) {
          conflicts.push({
            id: `hours-${dayHours.day}`,
            type: 'WORKING_HOURS',
            severity: 'HIGH',
            title: 'Working Hours Violation',
            description: `${conflictingSlots.length} time slots outside working hours (${dayHours.startTime}-${dayHours.endTime})`,
            affectedSlots: conflictingSlots.map(slot => slot.id),
            suggestedFix: 'Adjust slots to fit within working hours',
            autoFixable: false
          });
        }
      }
    });

    // Check for leave conflicts
    leaveRequests.forEach(leave => {
      if (leave.status === 'APPROVED') {
        const conflictingSlots = timeSlots.filter(slot => {
          // This would need proper date comparison logic
          return false; // Simplified for demo
        });
        
        if (conflictingSlots.length > 0) {
          conflicts.push({
            id: `leave-${leave.id}`,
            type: 'LEAVE_CONFLICT',
            severity: 'CRITICAL',
            title: 'Leave Conflict',
            description: `Time slots scheduled during approved leave (${leave.startDate} - ${leave.endDate})`,
            affectedSlots: conflictingSlots.map(slot => slot.id),
            suggestedFix: 'Remove slots during leave period',
            autoFixable: true
          });
        }
      }
    });

    return conflicts;
  }

  /**
   * Export schedule to various formats
   */
  exportSchedule(
    schedule: DoctorSchedule,
    format: 'json' | 'csv' | 'ical'
  ): string {
    switch (format) {
      case 'json':
        return JSON.stringify(schedule, null, 2);
      
      case 'csv':
        const csvRows = ['Day,Start Time,End Time,Working,Break Start,Break End,Max Appointments'];
        schedule.workingHours.forEach(day => {
          csvRows.push([
            day.day,
            day.startTime,
            day.endTime,
            day.isWorking ? 'Yes' : 'No',
            day.breakStart || '',
            day.breakEnd || '',
            day.maxAppointments?.toString() || '20'
          ].join(','));
        });
        return csvRows.join('\n');
      
      case 'ical':
        // Generate iCal format
        const ical = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Healthcare System//Schedule//EN',
          'BEGIN:VEVENT',
          'DTSTART:20240101T090000Z',
          'DTEND:20240101T170000Z',
          'SUMMARY:Working Hours',
          'DESCRIPTION:Regular working hours',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');
        return ical;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import schedule from various formats
   */
  importSchedule(
    data: string,
    format: 'json' | 'csv'
  ): Partial<DoctorSchedule> {
    switch (format) {
      case 'json':
        return JSON.parse(data);
      
      case 'csv':
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        const workingHours: WorkingHours[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= headers.length) {
            workingHours.push({
              day: values[0] as any,
              startTime: values[1],
              endTime: values[2],
              isWorking: values[3] === 'Yes',
              breakStart: values[4] || undefined,
              breakEnd: values[5] || undefined,
              maxAppointments: parseInt(values[6]) || 20
            });
          }
        }
        
        return { workingHours };
      
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }
}

// Export singleton instance
export const scheduleService = new ScheduleService();

