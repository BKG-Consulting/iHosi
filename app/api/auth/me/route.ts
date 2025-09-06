import { NextRequest, NextResponse } from 'next/server';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify the session
    const sessionResult = await HIPAAAuthService.verifySession(token);

    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: sessionResult.user.id,
        email: sessionResult.user.email,
        firstName: sessionResult.user.firstName,
        lastName: sessionResult.user.lastName,
        role: sessionResult.user.role,
        departmentId: sessionResult.user.departmentId,
        mfaEnabled: sessionResult.user.mfaEnabled,
        lastLoginAt: sessionResult.user.lastLoginAt,
        isActive: sessionResult.user.isActive
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
