import { NextRequest, NextResponse } from 'next/server';
import { getPatientDashboardStatistics } from '@/utils/services/patient';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params;

    // Verify authentication
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

    // Ensure user is a patient or has permission to view this patient's data
    if (user.role !== 'PATIENT' && user.id !== patientId && user.role !== 'ADMIN' && user.role !== 'DOCTOR') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to view this patient data' },
        { status: 403 }
      );
    }

    // Fetch patient dashboard statistics
    const dashboardData = await getPatientDashboardStatistics(patientId);

    const origin = request.headers.get('origin');
    const response = NextResponse.json(dashboardData);
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);

  } catch (error) {
    console.error('Error fetching patient dashboard:', error);
    const origin = request.headers.get('origin');
    const errorResponse = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(errorResponse, origin || undefined);
  }
}



