import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { logAudit } from '@/lib/audit';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

const updateAvailabilitySchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  availability_status: z.enum(['AVAILABLE', 'BUSY', 'UNAVAILABLE']),
});

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

// PATCH /api/doctors/availability - Update doctor availability status
export async function PATCH(request: NextRequest) {
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
    const body = await request.json();
    
    console.log('🔄 AVAILABILITY UPDATE REQUEST');
    console.log('👤 User:', { id: user.id, role: user.role });
    console.log('📋 Request body:', body);
    
    // Validate request
    const validatedData = updateAvailabilitySchema.parse(body);
    console.log('✅ Validated data:', validatedData);
    
    // Update doctor availability
    console.log('🔄 Updating doctor availability...');
    const updatedDoctor = await db.doctor.update({
      where: { id: validatedData.doctorId },
      data: {
        availability_status: validatedData.availability_status
      }
    });
    console.log('✅ Doctor availability updated:', {
      doctorId: updatedDoctor.id,
      newStatus: updatedDoctor.availability_status
    });

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'DOCTOR',
      resourceId: validatedData.doctorId,
      reason: `Availability status updated to ${validatedData.availability_status}`,
      metadata: {
        previousStatus: 'UNKNOWN', // We don't have the previous status easily available
        newStatus: validatedData.availability_status
      }
    }, {
      userId: user.id,
      userRole: user.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    const origin = request.headers.get('origin');
    const response = NextResponse.json({
      success: true,
      message: 'Availability status updated successfully',
      data: {
        doctorId: updatedDoctor.id,
        availability_status: updatedDoctor.availability_status
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
      { 
        success: false, 
        message: 'Failed to update availability status',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(errorResponse, origin || undefined);
  }
}

