import { NextRequest, NextResponse } from 'next/server';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Authenticate user
    const result = await HIPAAAuthService.authenticate(email, password, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // If MFA is required, return MFA challenge
    if (result.mfaRequired) {
      return NextResponse.json({
        success: true,
        mfaRequired: true,
        userId: result.user?.id,
        message: 'MFA verification required'
      });
    }

    // Create session token
    const session = await HIPAAAuthService.createSession(result.user!, ipAddress, userAgent);

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
