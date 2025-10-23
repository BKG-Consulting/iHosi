import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

// Validation schema for appointment actions
const appointmentActionSchema = z.object({
  appointmentId: z.number().min(1, 'Appointment ID is required'),
  action: z.enum(['ACCEPT', 'REJECT', 'RESCHEDULE']),
  aiSuggestedTime: z.string().optional(),
  enableAI: z.boolean().optional().default(true),
  reason: z.string().optional(),
  newDate: z.string().optional(),
  newTime: z.string().optional(),
});

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

// POST /api/appointments/action - Handle appointment actions
export async function POST(request: NextRequest) {
  try {
    // Verify authentication - check cookies and Authorization header
    const oldToken = request.cookies.get('auth-token')?.value;
    const accessToken = request.cookies.get('access-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = bearerToken || accessToken || oldToken;
    
    if (!token) {
      const origin = request.headers.get('origin');
      const response = NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      const origin = request.headers.get('origin');
      const response = NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    const user = sessionResult.user;
    const body = await request.json();
    
    // Validate request
    const validatedData = appointmentActionSchema.parse(body);
    
    // Get the appointment with patient and doctor details
    const appointment = await db.appointment.findUnique({
      where: { id: validatedData.appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 });
    }

    // Check if user has permission to act on this appointment
    if (user.role !== 'ADMIN' && user.id !== appointment.doctor_id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to perform this action'
      }, { status: 403 });
    }

    let result;

    switch (validatedData.action) {
      case 'ACCEPT':
        result = await handleAcceptAppointment(appointment, validatedData, user);
        break;
      case 'REJECT':
        result = await handleRejectAppointment(appointment, validatedData, user);
        break;
      case 'RESCHEDULE':
        result = await handleRescheduleAppointment(appointment, validatedData, user);
        break;
      default:
        const origin = request.headers.get('origin');
        const response = NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
        return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    // Log audit trail
    await logAudit({
      action: validatedData.action,
      resourceType: 'APPOINTMENT',
      resourceId: appointment.id.toString(),
      reason: `Appointment ${validatedData.action.toLowerCase()} by doctor`,
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        action: validatedData.action,
      }
    });

    const origin = request.headers.get('origin');
    const response = NextResponse.json(result);
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);

  } catch (error) {
    console.error('Error handling appointment action:', error);
    
    const origin = request.headers.get('origin');
    
    if (error instanceof z.ZodError) {
      const response = NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }
    
    const response = NextResponse.json({
      success: false,
      message: 'Failed to process appointment action',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
  }
}

// Handle accepting an appointment
async function handleAcceptAppointment(appointment: any, data: any, user: any) {
  try {
    // Update appointment status to SCHEDULED
    const updatedAppointment = await db.appointment.update({
      where: { id: appointment.id },
      data: { status: 'SCHEDULED' },
      include: {
        patient: true,
        doctor: true,
      },
    });

    console.log('✅ Appointment accepted:', {
      id: updatedAppointment.id,
      status: updatedAppointment.status,
    });

    // TODO: Send confirmation email to patient
    console.log('📧 Confirmation email would be sent to:', appointment.patient.email);

    return {
      success: true,
      message: 'Appointment accepted successfully',
      data: updatedAppointment,
    };

  } catch (error) {
    console.error('Error accepting appointment:', error);
    throw error;
  }
}

// Handle rejecting an appointment
async function handleRejectAppointment(appointment: any, data: any, user: any) {
  try {
    const updatedAppointment = await db.appointment.update({
      where: { id: appointment.id },
      data: { 
        status: 'CANCELLED',
        cancellation_reason: data.reason || 'Appointment rejected by doctor'
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    console.log('✅ Appointment rejected:', {
      id: updatedAppointment.id,
      status: updatedAppointment.status,
    });

    // TODO: Send rejection email to patient
    console.log('📧 Rejection email would be sent to:', appointment.patient.email);

    return {
      success: true,
      message: 'Appointment rejected successfully',
      data: updatedAppointment
    };

  } catch (error) {
    console.error('Error rejecting appointment:', error);
    throw error;
  }
}

// Handle rescheduling an appointment
async function handleRescheduleAppointment(appointment: any, data: any, user: any) {
  try {
    if (!data.newDate || !data.newTime) {
      return {
        success: false,
        message: 'New date and time are required for rescheduling'
      };
    }

    // Manual rescheduling
    const updatedAppointment = await db.appointment.update({
      where: { id: appointment.id },
      data: {
        appointment_date: new Date(data.newDate),
        time: data.newTime,
        note: data.reason || 'Rescheduled by doctor'
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    console.log('✅ Appointment rescheduled:', {
      id: updatedAppointment.id,
      newDate: data.newDate,
      newTime: data.newTime,
    });

    // TODO: Send rescheduling email to patient
    console.log('📧 Rescheduling email would be sent to:', appointment.patient.email);

    return {
      success: true,
      message: 'Appointment rescheduled successfully',
      data: updatedAppointment,
    };

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
}
