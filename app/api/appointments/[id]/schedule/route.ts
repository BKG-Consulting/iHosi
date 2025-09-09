import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import { logAudit } from '@/lib/audit';
import { notificationService } from '@/lib/notifications';
import { SchedulingStrategy } from '@/lib/email-scheduler';

// Schema for scheduling validation
const ScheduleAppointmentSchema = z.object({
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  requirements: z.string().optional(),
  notes: z.string().optional(),
  duration: z.number().min(15).max(240).optional(),
  status: z.enum(['SCHEDULED', 'CANCELLED']).optional()
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const appointmentId = parseInt(resolvedParams.id);
    const body = await request.json();

    // Verify user authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const validatedData = ScheduleAppointmentSchema.parse(body);

    // Get the appointment
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }

    // Check if user has permission to schedule this appointment
    if (user.role?.toLowerCase() !== 'admin' && user.id !== appointment.doctor_id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Check if appointment is in PENDING status
    if (appointment.status !== 'PENDING') {
      return NextResponse.json({ 
        success: false, 
        message: 'Only pending appointments can be scheduled' 
      }, { status: 400 });
    }

    // Check for conflicts if scheduling (not cancelling)
    if (validatedData.status !== 'CANCELLED') {
      const appointmentDate = new Date(validatedData.appointment_date);
      const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if doctor works on this day
      const workingDay = await db.workingDays.findFirst({
        where: {
          doctor_id: appointment.doctor_id,
          day_of_week: {
            equals: dayOfWeek,
            mode: 'insensitive'
          },
          is_working: true
        }
      });

      if (!workingDay) {
        return NextResponse.json({ 
          success: false, 
          message: 'Doctor is not available on the selected date' 
        }, { status: 400 });
      }

      // Check if selected time is within working hours
      const [timeHours, timeMinutes] = validatedData.time.split(':').map(Number);
      const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
      const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);

      const appointmentTime = timeHours * 60 + timeMinutes;
      const workStartTime = workStartHours * 60 + workStartMinutes;
      const workEndTime = workEndHours * 60 + workEndMinutes;

      if (appointmentTime < workStartTime || appointmentTime >= workEndTime) {
        return NextResponse.json({ 
          success: false, 
          message: 'Selected time is outside doctor\'s working hours' 
        }, { status: 400 });
      }

      // Check for existing appointments at the same time
      const existingAppointment = await db.appointment.findFirst({
        where: {
          doctor_id: appointment.doctor_id,
          appointment_date: {
            gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate()),
            lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1),
          },
          time: validatedData.time,
          status: { in: ['PENDING', 'SCHEDULED'] },
          id: { not: appointmentId } // Exclude current appointment
        }
      });

      if (existingAppointment) {
        return NextResponse.json({ 
          success: false, 
          message: 'Time slot is already booked' 
        }, { status: 400 });
      }
    }

    // Update the appointment
    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        appointment_date: new Date(validatedData.appointment_date),
        time: validatedData.time,
        status: validatedData.status || 'SCHEDULED',
        note: validatedData.notes || appointment.note,
        reason: validatedData.requirements || appointment.reason,
        updated_at: new Date()
      },
      include: {
        patient: true,
        doctor: true
      }
    });

    // Send notifications if appointment was scheduled
    if (validatedData.status === 'SCHEDULED') {
      try {
        // Send scheduled confirmation email to patient
        const confirmationJobId = await notificationService.sendAppointmentScheduledTemplate(
          updatedAppointment,
          SchedulingStrategy.IMMEDIATE
        );
        console.log(`✅ Appointment scheduled confirmation sent: ${confirmationJobId}`);

        // Send real-time socket notification to patient
        const { getSocketService } = await import('@/lib/socket-server');
        const socketService = getSocketService();
        
        if (socketService) {
          await socketService.sendAppointmentScheduled(appointment.patient_id, {
            appointmentId: updatedAppointment.id,
            patientId: updatedAppointment.patient_id,
            patientName: `${updatedAppointment.patient.first_name} ${updatedAppointment.patient.last_name}`,
            doctorId: updatedAppointment.doctor_id,
            doctorName: updatedAppointment.doctor.name,
            appointmentDate: updatedAppointment.appointment_date.toISOString().split('T')[0],
            appointmentTime: updatedAppointment.time,
            appointmentType: updatedAppointment.type,
            requirements: validatedData.requirements,
            notes: validatedData.notes,
            timestamp: new Date()
          });
          console.log(`✅ Real-time notification sent to patient ${appointment.patient_id}`);
        }

      } catch (notificationError) {
        console.error(`Failed to send notifications for scheduled appointment ${appointmentId}:`, notificationError);
        // Don't fail the scheduling if notifications fail
      }
    }

    // Log audit
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId.toString(),
      reason: `Appointment ${validatedData.status?.toLowerCase() || 'scheduled'}`,
      success: true,
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId,
        status: validatedData.status || 'SCHEDULED',
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id
      }
    });

    return NextResponse.json({
      success: true,
      message: `Appointment ${validatedData.status?.toLowerCase() || 'scheduled'} successfully`,
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Error scheduling appointment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid scheduling data',
        errors: error.errors
      }, { status: 400 });
    }

    // Log audit
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: 'unknown',
      reason: 'Failed to schedule appointment',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      message: 'Failed to schedule appointment'
    }, { status: 500 });
  }
}