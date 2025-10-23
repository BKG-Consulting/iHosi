import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

const availabilitySchema = z.object({
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'BUSY', 'ON_BREAK']),
  reason: z.string().optional()
});

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

// GET /api/doctors/[id]/availability - Get doctor availability status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await params;

    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
      include: {
        working_days: true
      }
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check if doctor has working schedule
    const hasWorkingSchedule = doctor.working_days.some(day => day.is_working);
    
    // Determine availability based on schedule and current status
    let availabilityStatus = doctor.availability_status || 'UNAVAILABLE';
    
    if (hasWorkingSchedule && !availabilityStatus) {
      availabilityStatus = 'AVAILABLE';
    }

    const origin = request.headers.get('origin');
    const response = NextResponse.json({
      success: true,
      data: {
        doctorId,
        status: availabilityStatus,
        hasWorkingSchedule,
        workingDays: doctor.working_days.length
      }
    });
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);

  } catch (error) {
    console.error('Error getting doctor availability:', error);
    const origin = request.headers.get('origin');
    const errorResponse = NextResponse.json(
      { success: false, message: 'Failed to get availability status' },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(errorResponse, origin || undefined);
  }
}

// PUT /api/doctors/[id]/availability - Update doctor availability status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication - check cookies and Authorization header for mobile compatibility
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
    const { id: doctorId } = await params;
    const body = await request.json();
    
    // Validate request
    const validatedData = availabilitySchema.parse(body);
    
    // Update doctor availability
    const updatedDoctor = await db.doctor.update({
      where: { id: doctorId },
      data: {
        availability_status: validatedData.status
      }
    });
    
    const origin = request.headers.get('origin');
    const response = NextResponse.json({
      success: true,
      message: 'Availability status updated successfully',
      data: {
        doctorId,
        status: validatedData.status,
        reason: validatedData.reason
      }
    });
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    const origin = request.headers.get('origin');
    
    if (error instanceof z.ZodError) {
      const errorResponse = NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
      return SecurityMiddleware.applyAPISecurityHeaders(errorResponse, origin || undefined);
    }
    
    const errorResponse = NextResponse.json(
      { success: false, message: 'Failed to update availability status' },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(errorResponse, origin || undefined);
  }
}