import { NextRequest, NextResponse } from 'next/server';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { cookies } from 'next/headers';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Check for token in cookies (web) or Authorization header (mobile)
    const oldToken = cookieStore.get('auth-token')?.value;
    const accessToken = cookieStore.get('access-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // Use the available token for logout
    const token = bearerToken || accessToken || oldToken;

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

    // Clear all auth cookies (both old and new) - for web browsers
    response.cookies.delete('auth-token');
    response.cookies.delete('access-token');
    response.cookies.delete('refresh-token');

    // Add CORS headers
    const origin = request.headers.get('origin');
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);

  } catch (error) {
    console.error('Logout error:', error);
    const origin = request.headers.get('origin');
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(errorResponse, origin || undefined);
  }
}
