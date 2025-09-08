import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { 
  RescheduleAppointmentRequest,
  CancelAppointmentRequest,
  SchedulingApiResponse,
  AppointmentDetails
} from '@/types/scheduling';
import { AppointmentStatus } from '@prisma/client';

// Validation schemas
const rescheduleAppointmentSchema = z.object({
  appointmentId: z.number(),
  newAppointmentDate: z.string().datetime('Invalid appointment date'),
  newTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  reason: z.string().min(1, 'Reason is required'),
  notifyPatient: z.boolean().optional().default(true),
  notifyDoctor: z.boolean().optional().default(true),
});

const cancelAppointmentSchema = z.object({
  appointmentId: z.number(),
  reason: z.string().min(1, 'Reason is required'),
  refundAmount: z.number().optional(),
  notifyPatient: z.boolean().optional().default(true),
  notifyDoctor: z.boolean().optional().default(true),
});

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

// Helper function to check scheduling conflicts
async function checkSchedulingConflicts(
  doctorId: string,
  appointmentDate: Date,
  time: string,
  duration: number = 30,
  excludeAppointmentId?: number
): Promise<boolean> {
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
  });
  
  for (const appointment of existingAppointments) {
    const [existingHours, existingMinutes] = appointment.time.split(':').map(Number);
    const existingStartTime = new Date(appointmentDate);
    existingStartTime.setHours(existingHours, existingMinutes, 0, 0);
    
    const existingEndTime = new Date(existingStartTime);
    existingEndTime.setMinutes(existingEndTime.getMinutes() + 30); // Default 30 minutes
    
    const [newHours, newMinutes] = time.split(':').map(Number);
    const newStartTime = new Date(appointmentDate);
    newStartTime.setHours(newHours, newMinutes, 0, 0);
    
    const newEndTime = new Date(newStartTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + duration);
    
    // Check for time overlap
    if (
      (newStartTime < existingEndTime && newEndTime > existingStartTime) ||
      (newStartTime.getTime() === existingStartTime.getTime())
    ) {
      return true; // Conflict found
    }
  }
  
  return false; // No conflicts
}

// GET /api/scheduling/appointments/[id] - Get specific appointment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const appointmentId = parseInt(resolvedParams.id);
    
    if (isNaN(appointmentId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid appointment ID',
      } as SchedulingApiResponse, { status: 400 });
    }
    
    // Get appointment
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
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
    
    if (!appointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found',
      } as SchedulingApiResponse, { status: 404 });
    }
    
    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId.toString(),
      reason: 'Retrieved appointment details',
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: createAppointmentDetails(appointment),
    } as SchedulingApiResponse);
    
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch appointment',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as SchedulingApiResponse,
      { status: 500 }
    );
  }
}

// PUT /api/scheduling/appointments/[id] - Update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const appointmentId = parseInt(resolvedParams.id);
    const body = await request.json();
    
    if (isNaN(appointmentId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid appointment ID',
      } as SchedulingApiResponse, { status: 400 });
    }
    
    // Check if appointment exists
    const existingAppointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });
    
    if (!existingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found',
      } as SchedulingApiResponse, { status: 404 });
    }
    
    // Check for conflicts if time is being changed
    if (body.appointmentDate && body.time) {
      const appointmentDate = new Date(body.appointmentDate);
      const duration = body.duration || 30;
      
      const hasConflict = await checkSchedulingConflicts(
        existingAppointment.doctor_id,
        appointmentDate,
        body.time,
        duration,
        appointmentId
      );
      
      if (hasConflict) {
        return NextResponse.json({
          success: false,
          message: 'Scheduling conflict detected',
        } as SchedulingApiResponse, { status: 409 });
      }
    }
    
    // Update appointment
    const updateData: any = {};
    if (body.appointmentDate) updateData.appointment_date = new Date(body.appointmentDate);
    if (body.time) updateData.time = body.time;
    if (body.type) updateData.type = body.type;
    if (body.reason) updateData.reason = body.reason;
    if (body.note) updateData.note = body.note;
    if (body.serviceId) updateData.service_id = body.serviceId;
    if (body.status) updateData.status = body.status;
    
    const appointment = await db.appointment.update({
      where: { id: appointmentId },
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
      resourceId: appointmentId.toString(),
      reason: 'Updated appointment',
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId,
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

// DELETE /api/scheduling/appointments/[id] - Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const appointmentId = parseInt(resolvedParams.id);
    const body = await request.json();
    
    if (isNaN(appointmentId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid appointment ID',
      } as SchedulingApiResponse, { status: 400 });
    }
    
    // Validate cancellation request
    const validatedData = cancelAppointmentSchema.parse(body);
    
    // Check if appointment exists
    const existingAppointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!existingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found',
      } as SchedulingApiResponse, { status: 404 });
    }
    
    // Cancel appointment
    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        note: existingAppointment.note ? 
          `${existingAppointment.note}\n\nCANCELLED: ${validatedData.reason}` : 
          `CANCELLED: ${validatedData.reason}`,
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
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId.toString(),
      reason: 'Cancelled appointment',
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId,
        cancellationReason: validatedData.reason,
        refundAmount: validatedData.refundAmount,
        notifyPatient: validatedData.notifyPatient,
        notifyDoctor: validatedData.notifyDoctor,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: createAppointmentDetails(appointment),
      message: 'Appointment cancelled successfully',
    } as SchedulingApiResponse);
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    
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
        message: 'Failed to cancel appointment',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as SchedulingApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/scheduling/appointments/[id]/reschedule - Reschedule appointment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const appointmentId = parseInt(resolvedParams.id);
    const body = await request.json();
    
    if (isNaN(appointmentId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid appointment ID',
      } as SchedulingApiResponse, { status: 400 });
    }
    
    // Validate reschedule request
    const validatedData = rescheduleAppointmentSchema.parse({
      ...body,
      appointmentId,
    });
    
    // Check if appointment exists
    const existingAppointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });
    
    if (!existingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found',
      } as SchedulingApiResponse, { status: 404 });
    }
    
    const newAppointmentDate = new Date(validatedData.newAppointmentDate);
    const duration = 30; // Default duration, should be configurable
    
    // Check for conflicts
    const hasConflict = await checkSchedulingConflicts(
      existingAppointment.doctor_id,
      newAppointmentDate,
      validatedData.newTime,
      duration,
      appointmentId
    );
    
    if (hasConflict) {
      return NextResponse.json({
        success: false,
        message: 'Scheduling conflict detected for new time slot',
      } as SchedulingApiResponse, { status: 409 });
    }
    
    // Reschedule appointment
    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        appointment_date: newAppointmentDate,
        time: validatedData.newTime,
        note: existingAppointment.note ? 
          `${existingAppointment.note}\n\nRESCHEDULED: ${validatedData.reason}` : 
          `RESCHEDULED: ${validatedData.reason}`,
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
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId.toString(),
      reason: 'Rescheduled appointment',
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId,
        oldDate: existingAppointment.appointment_date,
        oldTime: existingAppointment.time,
        newDate: newAppointmentDate,
        newTime: validatedData.newTime,
        rescheduleReason: validatedData.reason,
        notifyPatient: validatedData.notifyPatient,
        notifyDoctor: validatedData.notifyDoctor,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: createAppointmentDetails(appointment),
      message: 'Appointment rescheduled successfully',
    } as SchedulingApiResponse);
    
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    
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
        message: 'Failed to reschedule appointment',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as SchedulingApiResponse,
      { status: 500 }
    );
  }
}
