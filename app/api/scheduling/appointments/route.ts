import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest,
  SchedulingApiResponse,
  AppointmentDetails,
  SchedulingConflict
} from '@/types/scheduling';
import { AppointmentStatus } from '@prisma/client';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

// Validation schemas
const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentDate: z.string().datetime('Invalid appointment date'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  type: z.string().min(1, 'Appointment type is required'),
  reason: z.string().optional(),
  note: z.string().optional(),
  serviceId: z.number().optional(),
  duration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    interval: z.number().min(1),
    endDate: z.string().datetime().optional(),
    maxOccurrences: z.number().min(1).optional(),
    daysOfWeek: z.array(z.string()).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
  }).optional(),
});

const updateAppointmentSchema = z.object({
  appointmentId: z.number(),
  appointmentDate: z.string().datetime().optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  type: z.string().optional(),
  reason: z.string().optional(),
  note: z.string().optional(),
  serviceId: z.number().optional(),
  duration: z.number().min(15).max(480).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

// Helper function to check scheduling conflicts
async function checkSchedulingConflicts(
  doctorId: string,
  appointmentDate: Date,
  time: string,
  duration: number = 30,
  excludeAppointmentId?: number
): Promise<SchedulingConflict[]> {
  const conflicts: SchedulingConflict[] = [];
  
  // Parse time to get start and end times
  const [hours, minutes] = time.split(':').map(Number);
  const startTime = new Date(appointmentDate);
  startTime.setHours(hours, minutes, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  // Check for existing appointments
  const existingAppointments = await db.appointment.findMany({
    where: {
      doctor_id: doctorId,
      appointment_date: {
        gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate()),
        lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1),
      },
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
    },
    include: {
      patient: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
  
  for (const appointment of existingAppointments) {
    const [existingHours, existingMinutes] = appointment.time.split(':').map(Number);
    const existingStartTime = new Date(appointmentDate);
    existingStartTime.setHours(existingHours, existingMinutes, 0, 0);
    
    const existingEndTime = new Date(existingStartTime);
    existingEndTime.setMinutes(existingEndTime.getMinutes() + 30); // Default 30 minutes
    
    // Check for time overlap
    if (
      (startTime < existingEndTime && endTime > existingStartTime) ||
      (startTime.getTime() === existingStartTime.getTime())
    ) {
      conflicts.push({
        type: 'DOUBLE_BOOKING',
        severity: 'HIGH',
        message: `Time slot conflicts with existing appointment for ${appointment.patient.first_name} ${appointment.patient.last_name}`,
        conflictingAppointmentId: appointment.id,
        canAutoResolve: false,
      });
    }
  }
  
  // Check doctor availability
  const workingDay = await db.workingDays.findFirst({
    where: {
      doctor_id: doctorId,
      day_of_week: appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      is_working: true,
    },
  });
  
  if (!workingDay) {
    conflicts.push({
      type: 'UNAVAILABLE_TIME',
      severity: 'CRITICAL',
      message: 'Doctor is not available on this day',
      canAutoResolve: false,
    });
  } else {
    // Check if time is within working hours
    const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
    const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);
    
    const workStartTime = new Date(appointmentDate);
    workStartTime.setHours(workStartHours, workStartMinutes, 0, 0);
    
    const workEndTime = new Date(appointmentDate);
    workEndTime.setHours(workEndHours, workEndMinutes, 0, 0);
    
    if (startTime < workStartTime || endTime > workEndTime) {
      conflicts.push({
        type: 'UNAVAILABLE_TIME',
        severity: 'HIGH',
        message: 'Appointment time is outside working hours',
        canAutoResolve: false,
      });
    }
    
    // Check break time
    if (workingDay.break_start_time && workingDay.break_end_time) {
      const [breakStartHours, breakStartMinutes] = workingDay.break_start_time.split(':').map(Number);
      const [breakEndHours, breakEndMinutes] = workingDay.break_end_time.split(':').map(Number);
      
      const breakStartTime = new Date(appointmentDate);
      breakStartTime.setHours(breakStartHours, breakStartMinutes, 0, 0);
      
      const breakEndTime = new Date(appointmentDate);
      breakEndTime.setHours(breakEndHours, breakEndMinutes, 0, 0);
      
      if (startTime < breakEndTime && endTime > breakStartTime) {
        conflicts.push({
          type: 'BREAK_TIME',
          severity: 'MEDIUM',
          message: 'Appointment time conflicts with doctor break time',
          canAutoResolve: false,
        });
      }
    }
  }
  
  // Check leave requests
  const leaveRequest = await db.leaveRequest.findFirst({
    where: {
      doctor_id: doctorId,
      start_date: { lte: appointmentDate },
      end_date: { gte: appointmentDate },
      status: 'APPROVED',
    },
  });
  
  if (leaveRequest) {
    conflicts.push({
      type: 'LEAVE_PERIOD',
      severity: 'CRITICAL',
      message: `Doctor is on leave (${leaveRequest.leave_type}) during this time`,
      canAutoResolve: false,
    });
  }
  
  return conflicts;
}

// Helper function to create appointment details response
function createAppointmentDetails(appointment: any): AppointmentDetails {
  return {
    id: appointment.id,
    patientId: appointment.patient_id,
    doctorId: appointment.doctor_id,
    appointmentDate: appointment.appointment_date,
    time: appointment.time,
    status: appointment.status,
    type: appointment.type,
    note: appointment.note,
    reason: appointment.reason,
    serviceId: appointment.service_id,
    duration: 30, // Default duration, should be stored in DB
    priority: 'MEDIUM', // Default priority, should be stored in DB
    isRecurring: false, // Default, should be stored in DB
    calendarEventId: appointment.calendar_event_id,
    calendarSyncedAt: appointment.calendar_synced_at,
    patient: {
      id: appointment.patient.id,
      first_name: appointment.patient.first_name,
      last_name: appointment.patient.last_name,
      email: appointment.patient.email,
      phone: appointment.patient.phone,
      img: appointment.patient.img,
      colorCode: appointment.patient.colorCode,
    },
    doctor: {
      id: appointment.doctor.id,
      name: appointment.doctor.name,
      specialization: appointment.doctor.specialization,
      img: appointment.doctor.img,
      colorCode: appointment.doctor.colorCode,
    },
    service: appointment.service ? {
      id: appointment.service.id,
      service_name: appointment.service.service_name,
      duration_minutes: appointment.service.duration_minutes || 30,
      price: appointment.service.price,
    } : undefined,
    created_at: appointment.created_at,
    updated_at: appointment.updated_at,
  };
}

// GET /api/scheduling/appointments - Get appointments
export async function GET(request: NextRequest) {
  try {
    // Verify authentication - check cookies and Authorization header
    const oldToken = request.cookies.get('auth-token')?.value;
    const accessToken = request.cookies.get('access-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = bearerToken || accessToken || oldToken;
    
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status')?.split(',') as AppointmentStatus[];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (doctorId) {
      where.doctor_id = doctorId;
    }
    
    if (patientId) {
      where.patient_id = patientId;
    }
    
    if (status && status.length > 0) {
      where.status = { in: status };
    }
    
    if (startDate && endDate) {
      where.appointment_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    // Get appointments
    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              img: true,
              colorCode: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              img: true,
              colorCode: true,
            },
          },
          service: {
            select: {
              id: true,
              service_name: true,
              duration_minutes: true,
              price: true,
            },
          },
        },
        orderBy: { appointment_date: 'desc' },
        skip,
        take: limit,
      }),
      db.appointment.count({ where }),
    ]);
    
    const appointmentDetails = appointments.map(createAppointmentDetails);
    
    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'APPOINTMENT',
      resourceId: 'multiple',
      reason: 'Retrieved appointments list',
      metadata: {
        userId: user.id,
        userRole: user.role,
        filters: { doctorId, patientId, status, startDate, endDate },
        resultCount: appointmentDetails.length,
      },
    });
    
    const origin = request.headers.get('origin');
    const response = NextResponse.json({
      success: true,
      data: appointmentDetails,
    });
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch appointments',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as SchedulingApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/scheduling/appointments - Create appointment
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
    const validatedData = createAppointmentSchema.parse(body);
    const appointmentDate = new Date(validatedData.appointmentDate);
    const duration = validatedData.duration || 30;
    
    // Check for conflicts
    const conflicts = await checkSchedulingConflicts(
      validatedData.doctorId,
      appointmentDate,
      validatedData.time,
      duration
    );
    
    if (conflicts.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Scheduling conflicts detected',
        conflicts,
      } as SchedulingApiResponse, { status: 409 });
    }
    
    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        patient_id: validatedData.patientId,
        doctor_id: validatedData.doctorId,
        appointment_date: appointmentDate,
        time: validatedData.time,
        type: validatedData.type,
        note: validatedData.note,
        reason: validatedData.reason,
        service_id: validatedData.serviceId,
        status: 'PENDING',
      },
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            img: true,
            colorCode: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true,
          },
        },
        service: {
          select: {
            id: true,
            service_name: true,
            duration_minutes: true,
            price: true,
          },
        },
      },
    });
    
    // Log audit
    await logAudit({
      action: 'CREATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointment.id.toString(),
      reason: 'Created new appointment',
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.time,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: createAppointmentDetails(appointment),
      message: 'Appointment created successfully',
    } as SchedulingApiResponse, { status: 201 });
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    
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
        message: 'Failed to create appointment',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as SchedulingApiResponse,
      { status: 500 }
    );
  }
}

// PUT /api/scheduling/appointments - Update appointment
export async function PUT(request: NextRequest) {
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
    const validatedData = updateAppointmentSchema.parse(body);
    
    // Check if appointment exists
    const existingAppointment = await db.appointment.findUnique({
      where: { id: validatedData.appointmentId },
      include: { doctor: true, patient: true },
    });
    
    if (!existingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found',
      } as SchedulingApiResponse, { status: 404 });
    }
    
    // Check for conflicts if time is being changed
    let conflicts: SchedulingConflict[] = [];
    if (validatedData.appointmentDate && validatedData.time) {
      const appointmentDate = new Date(validatedData.appointmentDate);
      const duration = validatedData.duration || 30;
      
      conflicts = await checkSchedulingConflicts(
        existingAppointment.doctor_id,
        appointmentDate,
        validatedData.time,
        duration,
        validatedData.appointmentId
      );
      
      if (conflicts.length > 0) {
        return NextResponse.json({
          success: false,
          message: 'Scheduling conflicts detected',
          conflicts,
        } as SchedulingApiResponse, { status: 409 });
      }
    }
    
    // Update appointment
    const updateData: any = {};
    if (validatedData.appointmentDate) updateData.appointment_date = new Date(validatedData.appointmentDate);
    if (validatedData.time) updateData.time = validatedData.time;
    if (validatedData.type) updateData.type = validatedData.type;
    if (validatedData.reason) updateData.reason = validatedData.reason;
    if (validatedData.note) updateData.note = validatedData.note;
    if (validatedData.serviceId) updateData.service_id = validatedData.serviceId;
    if (validatedData.status) updateData.status = validatedData.status;
    
    const appointment = await db.appointment.update({
      where: { id: validatedData.appointmentId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            img: true,
            colorCode: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true,
          },
        },
        service: {
          select: {
            id: true,
            service_name: true,
            duration_minutes: true,
            price: true,
          },
        },
      },
    });
    
    // Log audit
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointment.id.toString(),
      reason: 'Updated appointment',
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId: appointment.id,
        changes: updateData,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: createAppointmentDetails(appointment),
      message: 'Appointment updated successfully',
    } as SchedulingApiResponse);
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    
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
        message: 'Failed to update appointment',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as SchedulingApiResponse,
      { status: 500 }
    );
  }
}

