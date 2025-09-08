import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { 
  GetAvailabilityRequest,
  GetAvailableSlotsRequest,
  SchedulingApiResponse,
  DoctorAvailability,
  TimeSlot,
  DetailedTimeSlot,
  DaySchedule,
  WeeklySchedule
} from '@/types/scheduling';
import { AvailabilityStatus, LeaveStatus } from '@prisma/client';

// Validation schemas
const getAvailabilitySchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  includeBreaks: z.boolean().optional().default(true),
  includeLeave: z.boolean().optional().default(true),
  serviceId: z.number().optional(),
  duration: z.number().min(15).max(480).optional(),
});

const getAvailableSlotsSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().datetime('Invalid date'),
  duration: z.number().min(15).max(480).optional().default(30),
  serviceId: z.number().optional(),
  excludeAppointmentId: z.number().optional(),
});

// Helper function to convert DetailedTimeSlot to TimeSlot
function convertToTimeSlot(detailedSlot: DetailedTimeSlot): TimeSlot {
  return {
    start: detailedSlot.startTime,
    end: detailedSlot.endTime,
    isAvailable: detailedSlot.isAvailable,
    maxAppointments: detailedSlot.maxBookings,
    currentAppointments: detailedSlot.currentBookings,
  };
}

// Helper function to generate time slots
function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number = 30,
  breakStart?: string,
  breakEnd?: string
): DetailedTimeSlot[] {
  const slots: DetailedTimeSlot[] = [];
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  let currentTime = new Date();
  currentTime.setHours(startHours, startMinutes, 0, 0);
  
  const endTimeDate = new Date();
  endTimeDate.setHours(endHours, endMinutes, 0, 0);
  
  const breakStartTime = breakStart ? new Date() : null;
  const breakEndTime = breakEnd ? new Date() : null;
  
  if (breakStartTime && breakEndTime) {
    const [breakStartHours, breakStartMinutes] = breakStart?.split(':').map(Number) || [0, 0];
    const [breakEndHours, breakEndMinutes] = breakEnd?.split(':').map(Number) || [0, 0];
    breakStartTime.setHours(breakStartHours, breakStartMinutes, 0, 0);
    breakEndTime.setHours(breakEndHours, breakEndMinutes, 0, 0);
  }
  
  while (currentTime < endTimeDate) {
    const slotEndTime = new Date(currentTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + duration);
    
    // Check if slot is during break time
    const isBreakTime = breakStartTime && breakEndTime && 
      currentTime < breakEndTime && slotEndTime > breakStartTime;
    
    // Check if slot extends beyond working hours
    const isWithinWorkingHours = slotEndTime <= endTimeDate;
    
    if (isWithinWorkingHours && !isBreakTime) {
      slots.push({
        id: `slot-${currentTime.getTime()}`,
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: slotEndTime.toTimeString().slice(0, 5),
        duration: duration,
        isAvailable: true,
        maxBookings: 1,
        currentBookings: 0,
        type: 'REGULAR' as const,
      });
    }
    
    currentTime.setMinutes(currentTime.getMinutes() + duration);
  }
  
  return slots;
}

// Helper function to check if doctor is available at specific time
async function isDoctorAvailable(
  doctorId: string,
  date: Date,
  time: string,
  duration: number = 30
): Promise<{ available: boolean; reason?: string }> {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check working days
  const workingDay = await db.workingDays.findFirst({
    where: {
      doctor_id: doctorId,
      day_of_week: dayOfWeek,
      is_working: true,
    },
  });
  
  if (!workingDay) {
    return { available: false, reason: 'Doctor does not work on this day' };
  }
  
  // Check if time is within working hours
  const [timeHours, timeMinutes] = time.split(':').map(Number);
  const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
  const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);
  
  const appointmentTime = new Date(date);
  appointmentTime.setHours(timeHours, timeMinutes, 0, 0);
  
  const workStartTime = new Date(date);
  workStartTime.setHours(workStartHours, workStartMinutes, 0, 0);
  
  const workEndTime = new Date(date);
  workEndTime.setHours(workEndHours, workEndMinutes, 0, 0);
  
  const appointmentEndTime = new Date(appointmentTime);
  appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + duration);
  
  if (appointmentTime < workStartTime || appointmentEndTime > workEndTime) {
    return { available: false, reason: 'Outside working hours' };
  }
  
  // Check break time
  if (workingDay.break_start_time && workingDay.break_end_time) {
    const [breakStartHours, breakStartMinutes] = workingDay.break_start_time.split(':').map(Number);
    const [breakEndHours, breakEndMinutes] = workingDay.break_end_time.split(':').map(Number);
    
    const breakStartTime = new Date(date);
    breakStartTime.setHours(breakStartHours, breakStartMinutes, 0, 0);
    
    const breakEndTime = new Date(date);
    breakEndTime.setHours(breakEndHours, breakEndMinutes, 0, 0);
    
    if (appointmentTime < breakEndTime && appointmentEndTime > breakStartTime) {
      return { available: false, reason: 'During break time' };
    }
  }
  
  // Check leave requests
  const leaveRequest = await db.leaveRequest.findFirst({
    where: {
      doctor_id: doctorId,
      start_date: { lte: date },
      end_date: { gte: date },
      status: LeaveStatus.APPROVED,
    },
  });
  
  if (leaveRequest) {
    return { available: false, reason: `Doctor is on leave (${leaveRequest.leave_type})` };
  }
  
  // Check existing appointments
  const existingAppointment = await db.appointment.findFirst({
    where: {
      doctor_id: doctorId,
      appointment_date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
      time: time,
      status: { in: ['PENDING', 'SCHEDULED'] },
    },
  });
  
  if (existingAppointment) {
    return { available: false, reason: 'Time slot already booked' };
  }
  
  return { available: true };
}

// GET /api/scheduling/availability - Get doctor availability
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = sessionResult.user;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const doctorId = searchParams.get('doctorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeBreaks = searchParams.get('includeBreaks') !== 'false';
    const includeLeave = searchParams.get('includeLeave') !== 'false';
    const serviceId = searchParams.get('serviceId');
    const duration = searchParams.get('duration');
    
    // Validate parameters
    const validatedData = getAvailabilitySchema.parse({
      doctorId,
      startDate,
      endDate,
      includeBreaks,
      includeLeave,
      serviceId: serviceId ? parseInt(serviceId) : undefined,
      duration: duration ? parseInt(duration) : undefined,
    });
    
    const start = new Date(validatedData.startDate);
    const end = new Date(validatedData.endDate);
    const durationMinutes = validatedData.duration || 30;
    
    // Get doctor information
    const doctor = await db.doctor.findUnique({
      where: { id: validatedData.doctorId },
      include: {
        working_days: true,
        leave_requests: {
          where: {
            status: LeaveStatus.APPROVED,
            start_date: { lte: end },
            end_date: { gte: start },
          },
        },
        availability_updates: {
          where: {
            effective_date: { lte: end },
            OR: [
              { end_date: { gte: start } },
              { end_date: null },
            ],
          },
        },
      },
    });
    
    if (!doctor) {
      return NextResponse.json({
        success: false,
        message: 'Doctor not found',
      } as SchedulingApiResponse, { status: 404 });
    }
    
    // Generate weekly schedule
    const days: DaySchedule[] = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dayName = daysOfWeek[currentDate.getDay()];
      
      const workingDay = doctor.working_days.find(wd => wd.day_of_week === dayName);
      
      if (workingDay && workingDay.is_working) {
        const timeSlots = generateTimeSlots(
          workingDay.start_time,
          workingDay.end_time,
          durationMinutes,
          workingDay.break_start_time || undefined,
          workingDay.break_end_time || undefined
        );
        
        // Check availability for each slot
        for (const slot of timeSlots) {
          const slotDate = new Date(currentDate);
          const [hours, minutes] = slot.startTime.split(':').map(Number);
          slotDate.setHours(hours, minutes, 0, 0);
          
          const availability = await isDoctorAvailable(
            validatedData.doctorId,
            slotDate,
            slot.startTime,
            durationMinutes
          );
          
          slot.isAvailable = availability.available;
        }
        
        days.push({
          day: dayName,
          isWorking: true,
          startTime: workingDay.start_time,
          endTime: workingDay.end_time,
          breakStart: workingDay.break_start_time || undefined,
          breakEnd: workingDay.break_end_time || undefined,
          maxAppointments: workingDay.max_appointments || undefined,
          timeSlots: timeSlots.map(convertToTimeSlot),
        });
      } else {
        days.push({
          day: dayName,
          isWorking: false,
          startTime: '09:00',
          endTime: '17:00',
          timeSlots: [],
        });
      }
    }
    
    const weeklySchedule: WeeklySchedule = {
      doctorId: doctor.id,
      weekStart: start,
      weekEnd: end,
      days,
      totalWorkingHours: days.reduce((total, day) => {
        if (!day.isWorking) return total;
        const [startHours, startMinutes] = day.startTime.split(':').map(Number);
        const [endHours, endMinutes] = day.endTime.split(':').map(Number);
        const workingMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        return total + workingMinutes / 60;
      }, 0),
      totalAvailableSlots: days.reduce((total, day) => total + day.timeSlots.filter(slot => slot.isAvailable).length, 0),
    };
    
    const availability: DoctorAvailability = {
      id: doctor.id,
      doctorId: doctor.id,
      status: (doctor.availability_status as AvailabilityStatus) || AvailabilityStatus.AVAILABLE,
      workingDays: doctor.working_days.map(wd => ({
        id: wd.id,
        doctorId: wd.doctor_id,
        day: wd.day_of_week,
        startTime: wd.start_time,
        endTime: wd.end_time,
        isWorking: wd.is_working,
        breakStart: wd.break_start_time || undefined,
        breakEnd: wd.break_end_time || undefined,
        maxAppointments: wd.max_appointments || undefined,
        created_at: wd.created_at,
        updated_at: wd.updated_at,
      })),
      leaveRequests: doctor.leave_requests.map(lr => ({
        id: lr.id,
        doctorId: lr.doctor_id,
        leaveType: lr.leave_type,
        startDate: lr.start_date,
        endDate: lr.end_date,
        reason: lr.reason,
        status: lr.status,
        approvedBy: lr.approved_by || undefined,
        approvedAt: lr.approved_at || undefined,
        notes: lr.notes || undefined,
        created_at: lr.created_at,
        updated_at: lr.updated_at,
      })),
      availabilityUpdates: doctor.availability_updates.map(au => ({
        id: au.id,
        doctorId: au.doctor_id,
        updateType: au.update_type,
        effectiveDate: au.effective_date,
        endDate: au.end_date || undefined,
        reason: au.reason || undefined,
        isTemporary: au.is_temporary,
        created_at: au.created_at,
        updated_at: au.updated_at,
      })),
      currentSchedule: weeklySchedule,
      isCurrentlyAvailable: doctor.availability_status === AvailabilityStatus.AVAILABLE,
    };
    
    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'APPOINTMENT',
      resourceId: 'availability',
      reason: 'Retrieved doctor availability',
      metadata: {
        userId: user.id,
        userRole: user.role,
        doctorId: validatedData.doctorId,
        dateRange: { start, end },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        doctorId: validatedData.doctorId,
        availability,
        availableSlots: days.flatMap(day => 
          day.timeSlots.filter(slot => slot.isAvailable)
        ),
        conflicts: [],
        nextAvailableSlot: days
          .flatMap(day => day.timeSlots.filter(slot => slot.isAvailable))
          .sort((a, b) => a.start.localeCompare(b.start))[0]?.start,
      },
    } as SchedulingApiResponse);
    
  } catch (error) {
    console.error('Error fetching availability:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      } as SchedulingApiResponse, { status: 400 });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch availability',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as SchedulingApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/scheduling/availability/slots - Get available time slots for a specific date
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = sessionResult.user;
    const body = await request.json();
    
    // Validate request
    const validatedData = getAvailableSlotsSchema.parse(body);
    const date = new Date(validatedData.date);
    const duration = validatedData.duration;
    
    // Get doctor working day
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const workingDay = await db.workingDays.findFirst({
      where: {
        doctor_id: validatedData.doctorId,
        day_of_week: dayOfWeek,
        is_working: true,
      },
    });
    
    if (!workingDay) {
      return NextResponse.json({
        success: true,
        data: {
          date: validatedData.date,
          availableSlots: [],
          message: 'Doctor does not work on this day',
        },
      } as SchedulingApiResponse);
    }
    
    // Generate time slots
    const timeSlots = generateTimeSlots(
      workingDay.start_time,
      workingDay.end_time,
      duration,
      workingDay.break_start_time || undefined,
      workingDay.break_end_time || undefined
    );
    
    // Check availability for each slot
    const availableSlots: DetailedTimeSlot[] = [];
    
    for (const slot of timeSlots) {
      const slotDate = new Date(date);
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      slotDate.setHours(hours, minutes, 0, 0);
      
      const availability = await isDoctorAvailable(
        validatedData.doctorId,
        slotDate,
        slot.startTime,
        duration
      );
      
      if (availability.available) {
        // Check if slot is not excluded
        if (validatedData.excludeAppointmentId) {
          const existingAppointment = await db.appointment.findFirst({
            where: {
              id: validatedData.excludeAppointmentId,
              doctor_id: validatedData.doctorId,
              appointment_date: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
              },
              time: slot.startTime,
            },
          });
          
          if (existingAppointment) {
            continue; // Skip this slot as it's the one being rescheduled
          }
        }
        
        availableSlots.push({
          ...slot,
          isAvailable: true,
        });
      }
    }
    
    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'APPOINTMENT',
      resourceId: 'available-slots',
      reason: 'Retrieved available time slots',
      metadata: {
        userId: user.id,
        userRole: user.role,
        doctorId: validatedData.doctorId,
        date: validatedData.date,
        duration,
        slotsFound: availableSlots.length,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        date: validatedData.date,
        availableSlots,
        totalSlots: timeSlots.length,
        availableCount: availableSlots.length,
      },
    } as SchedulingApiResponse);
    
  } catch (error) {
    console.error('Error fetching available slots:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      } as SchedulingApiResponse, { status: 400 });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch available slots',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as SchedulingApiResponse,
      { status: 500 }
    );
  }
}
