import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { notificationService } from '@/lib/notifications';
// Remove this import - AppointmentStatus is not exported from Prisma client

// Validation schema for appointment request
const appointmentRequestSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  preferredDate: z.string().datetime('Invalid preferred date'),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  type: z.string().min(1, 'Appointment type is required'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
});

// POST /api/appointments/request - Create appointment request
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
    const validatedData = appointmentRequestSchema.parse(body);
    
    // Check if patient exists
    const patient = await db.patient.findUnique({
      where: { id: validatedData.patientId },
    });
    
    if (!patient) {
      return NextResponse.json({
        success: false,
        message: 'Patient not found',
      }, { status: 404 });
    }
    
    // Check if doctor exists and is available
    const doctor = await db.doctor.findUnique({
      where: { id: validatedData.doctorId },
    });
    
    if (!doctor) {
      return NextResponse.json({
        success: false,
        message: 'Doctor not found',
      }, { status: 404 });
    }
    
    if (doctor.availability_status !== 'AVAILABLE') {
      return NextResponse.json({
        success: false,
        message: 'Doctor is not available for new appointments',
      }, { status: 409 });
    }
    
    // Create appointment request (PENDING status)
    const appointment = await db.appointment.create({
      data: {
        patient_id: validatedData.patientId,
        doctor_id: validatedData.doctorId,
        appointment_date: new Date(validatedData.preferredDate),
        time: validatedData.preferredTime,
        status: 'PENDING',
        type: validatedData.type,
        reason: validatedData.reason,
        note: validatedData.notes,
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
    
    // Send notifications
    try {
      await notificationService.sendAppointmentBookedNotification(appointment as any);
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError);
      // Don't fail the appointment creation if notifications fail
    }
    
    // Log audit
    await logAudit({
      action: 'CREATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointment.id.toString(),
      reason: 'Appointment request created',
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        status: 'PENDING',
        urgency: validatedData.urgency,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: appointment.id,
        status: appointment.status,
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointment_date: appointment.appointment_date,
        time: appointment.time,
        type: appointment.type,
        reason: appointment.reason,
        note: appointment.note,
        created_at: appointment.created_at,
      },
      message: 'Appointment request submitted successfully. The doctor will review and schedule your appointment.',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating appointment request:', error);
    
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
        message: 'Failed to create appointment request',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}


