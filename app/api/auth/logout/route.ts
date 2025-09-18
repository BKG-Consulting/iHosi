import { NextRequest, NextResponse } from 'next/server';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Check for both old and new token formats
    const oldToken = cookieStore.get('auth-token')?.value;
    const accessToken = cookieStore.get('access-token')?.value;
    const refreshToken = cookieStore.get('refresh-token')?.value;

    // Use the available token for logout
    const token = accessToken || oldToken;

    if (token) {
      // Verify session to get session ID
      const result = await HIPAAAuthService.verifySession(token);
      if (result.valid && result.sessionId) {
        await HIPAAAuthService.logout(result.sessionId, 'User logout');
      }
    }

    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear all auth cookies (both old and new)
    response.cookies.delete('auth-token');
    response.cookies.delete('access-token');
    response.cookies.delete('refresh-token');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
