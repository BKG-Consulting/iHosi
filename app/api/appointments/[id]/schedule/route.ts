import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { notificationService } from '@/lib/notifications';
import { AppointmentStatus } from '@prisma/client';

// Validation schema for scheduling appointment
const scheduleAppointmentSchema = z.object({
  appointmentDate: z.string().datetime('Invalid appointment date'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  duration: z.number().min(15).max(480).optional().default(30), // 15 minutes to 8 hours
  doctorComments: z.string().optional(),
  preparationInstructions: z.string().optional(),
  specialInstructions: z.string().optional(),
  notifyPatient: z.boolean().optional().default(true),
});

// PUT /api/appointments/[id]/schedule - Schedule appointment
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
      }, { status: 400 });
    }
    
    // Validate request
    const validatedData = scheduleAppointmentSchema.parse(body);
    
    // Check if appointment exists and is pending
    const existingAppointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
          },
        },
      },
    });
    
    if (!existingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found',
      }, { status: 404 });
    }
    
    if (existingAppointment.status !== AppointmentStatus.PENDING) {
      return NextResponse.json({
        success: false,
        message: 'Appointment is not pending and cannot be scheduled',
      }, { status: 409 });
    }
    
    // Check if doctor is available at the scheduled time
    const appointmentDate = new Date(validatedData.appointmentDate);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const workingDay = await db.workingDays.findFirst({
      where: {
        doctor_id: existingAppointment.doctor_id,
        day_of_week: dayOfWeek,
        is_working: true,
      },
    });
    
    if (!workingDay) {
      return NextResponse.json({
        success: false,
        message: 'Doctor is not available on this day',
      }, { status: 409 });
    }
    
    // Check if time is within working hours
    const [timeHours, timeMinutes] = validatedData.time.split(':').map(Number);
    const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
    const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);
    
    const appointmentTime = new Date(appointmentDate);
    appointmentTime.setHours(timeHours, timeMinutes, 0, 0);
    
    const workStartTime = new Date(appointmentDate);
    workStartTime.setHours(workStartHours, workStartMinutes, 0, 0);
    
    const workEndTime = new Date(appointmentDate);
    workEndTime.setHours(workEndHours, workEndMinutes, 0, 0);
    
    const appointmentEndTime = new Date(appointmentTime);
    appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + validatedData.duration);
    
    if (appointmentTime < workStartTime || appointmentEndTime > workEndTime) {
      return NextResponse.json({
        success: false,
        message: 'Appointment time is outside working hours',
      }, { status: 409 });
    }
    
    // Check for conflicts
    const conflictingAppointment = await db.appointment.findFirst({
      where: {
        doctor_id: existingAppointment.doctor_id,
        appointment_date: {
          gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate()),
          lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1),
        },
        time: validatedData.time,
        status: { in: ['PENDING', 'SCHEDULED'] },
        id: { not: appointmentId },
      },
    });
    
    if (conflictingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'Time slot is already booked',
      }, { status: 409 });
    }
    
    // Update appointment
    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        appointment_date: appointmentDate,
        time: validatedData.time,
        status: AppointmentStatus.SCHEDULED,
        note: existingAppointment.note ? 
          `${existingAppointment.note}\n\nDOCTOR COMMENTS: ${validatedData.doctorComments || 'No additional comments'}\n\nPREPARATION INSTRUCTIONS: ${validatedData.preparationInstructions || 'No special preparation required'}\n\nSPECIAL INSTRUCTIONS: ${validatedData.specialInstructions || 'None'}` :
          `DOCTOR COMMENTS: ${validatedData.doctorComments || 'No additional comments'}\n\nPREPARATION INSTRUCTIONS: ${validatedData.preparationInstructions || 'No special preparation required'}\n\nSPECIAL INSTRUCTIONS: ${validatedData.specialInstructions || 'None'}`,
      },
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
          },
        },
      },
    });
    
    // Send notifications if requested
    if (validatedData.notifyPatient) {
      try {
        await notificationService.sendAppointmentBookedNotification(updatedAppointment as any);
      } catch (notificationError) {
        console.error('Failed to send scheduling notifications:', notificationError);
        // Don't fail the scheduling if notifications fail
      }
    }
    
    // Log audit
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId.toString(),
      reason: 'Appointment scheduled by doctor',
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId,
        patientId: existingAppointment.patient_id,
        doctorId: existingAppointment.doctor_id,
        oldStatus: 'PENDING',
        newStatus: 'SCHEDULED',
        scheduledDate: appointmentDate,
        scheduledTime: validatedData.time,
        duration: validatedData.duration,
        hasComments: !!validatedData.doctorComments,
        hasPreparationInstructions: !!validatedData.preparationInstructions,
        hasSpecialInstructions: !!validatedData.specialInstructions,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        patient: updatedAppointment.patient,
        doctor: updatedAppointment.doctor,
        appointment_date: updatedAppointment.appointment_date,
        time: updatedAppointment.time,
        type: updatedAppointment.type,
        reason: updatedAppointment.reason,
        note: updatedAppointment.note,
        updated_at: updatedAppointment.updated_at,
      },
      message: 'Appointment scheduled successfully',
    });
    
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to schedule appointment',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}
