import { NextRequest, NextResponse } from 'next/server';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and MFA code are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Verify MFA code with rate limiting
    const result = await HIPAAAuthService.verifyMFA(userId, code, ipAddress, userAgent, request);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
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
      message: 'MFA verification successful'
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
