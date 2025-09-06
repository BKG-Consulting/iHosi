import { NextRequest, NextResponse } from 'next/server';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
      // Verify session to get session ID
      const result = await HIPAAAuthService.verifySession(token);
      if (result.valid && result.sessionId) {
        await HIPAAAuthService.logout(result.sessionId, 'User logout');
      }
    }

    // Clear the auth cookie
    cookieStore.delete('auth-token');

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
