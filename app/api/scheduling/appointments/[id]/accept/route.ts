import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

const acceptSchema = z.object({
  scheduledDate: z.string(),
  scheduledTime: z.string(),
});

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

// POST /api/scheduling/appointments/[id]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication - check cookies and Authorization header
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
    const { id } = await params;
    const appointmentId = parseInt(id);
    const body = await request.json();
    
    console.log('🔍 Accept appointment request:', {
      appointmentId,
      body,
      userId: user.id,
    });

    // Validate request
    const validatedData = acceptSchema.parse(body);

    // Get appointment
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      const origin = request.headers.get('origin');
      const response = NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    // Verify doctor owns this appointment
    if (appointment.doctor_id !== user.id && user.role !== 'ADMIN') {
      const origin = request.headers.get('origin');
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    // Update appointment
    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'SCHEDULED',
        appointment_date: new Date(validatedData.scheduledDate),
        time: validatedData.scheduledTime,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    console.log('✅ Appointment scheduled:', {
      id: updatedAppointment.id,
      status: updatedAppointment.status,
      date: updatedAppointment.appointment_date,
      time: updatedAppointment.time,
    });

    // TODO: Send email notification to patient (integrate with notification service)
    console.log('📧 Email notification would be sent to:', appointment.patient.email);

    const origin = request.headers.get('origin');
    const response = NextResponse.json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: updatedAppointment,
    });
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);

  } catch (error) {
    console.error('Error accepting appointment:', error);
    
    if (error instanceof z.ZodError) {
      const origin = request.headers.get('origin');
      const response = NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }
    
    const origin = request.headers.get('origin');
    const response = NextResponse.json({
      success: false,
      message: 'Failed to accept appointment',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
  }
}

