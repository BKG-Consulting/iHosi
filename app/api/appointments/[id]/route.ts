import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { logAudit } from '@/lib/audit';

const updateAppointmentSchema = z.object({
  time: z.string().optional(),
  appointment_date: z.string().optional(),
  status: z.enum(['PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED']).optional(),
  note: z.string().optional(),
  reason: z.string().optional()
});

// PATCH /api/appointments/[id] - Update appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication - check both token formats
    const oldToken = request.cookies.get('auth-token')?.value;
    const accessToken = request.cookies.get('access-token')?.value;
    const token = accessToken || oldToken;
    
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
    const { id: appointmentId } = await params;
    const body = await request.json();
    
    console.log('🔄 APPOINTMENT UPDATE REQUEST');
    console.log('👤 User:', { id: user.id, role: user.role });
    console.log('📋 Appointment ID:', appointmentId);
    console.log('📋 Request body:', body);
    
    // Validate request
    const validatedData = updateAppointmentSchema.parse(body);
    console.log('✅ Validated data:', validatedData);

    // Check if appointment exists
    const existingAppointment = await db.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        patient: true,
        doctor: true
      }
    });

    if (!existingAppointment) {
      console.log('❌ Appointment not found');
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    console.log('📅 Existing appointment:', {
      id: existingAppointment.id,
      currentTime: existingAppointment.time,
      currentDate: existingAppointment.appointment_date,
      currentStatus: existingAppointment.status
    });

    // Update appointment
    console.log('🔄 Updating appointment...');
    const updatedAppointment = await db.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: {
        ...(validatedData.time && { time: validatedData.time }),
        ...(validatedData.appointment_date && { appointment_date: new Date(validatedData.appointment_date) }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.note && { note: validatedData.note }),
        ...(validatedData.reason && { reason: validatedData.reason }),
        updated_at: new Date()
      },
      include: {
        patient: true,
        doctor: true
      }
    });

    console.log('✅ Appointment updated successfully:', {
      id: updatedAppointment.id,
      newTime: updatedAppointment.time,
      newDate: updatedAppointment.appointment_date,
      newStatus: updatedAppointment.status
    });

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId,
      reason: `Appointment updated via drag and drop scheduling`,
      metadata: {
        previousTime: existingAppointment.time,
        newTime: updatedAppointment.time,
        previousDate: existingAppointment.appointment_date.toISOString(),
        newDate: updatedAppointment.appointment_date.toISOString(),
        previousStatus: existingAppointment.status,
        newStatus: updatedAppointment.status,
        patientId: existingAppointment.patient_id,
        doctorId: existingAppointment.doctor_id
      }
    }, {
      userId: user.id,
      userRole: user.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        id: updatedAppointment.id,
        time: updatedAppointment.time,
        appointment_date: updatedAppointment.appointment_date,
        status: updatedAppointment.status
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    
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
        message: 'Failed to update appointment',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}

