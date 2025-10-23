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

    // Authenticate user with rate limiting
    const result = await HIPAAAuthService.authenticate(email, password, ipAddress, userAgent, request);

    if (!result.success) {
      // Include error code and retry information if available
      const errorResponse: any = { 
        success: false,
        error: result.error 
      };
      
      // Add retry information for rate limit errors
      if (result.error === 'RATE_LIMIT_EXCEEDED' && result.retryAfter) {
        errorResponse.retryAfter = result.retryAfter;
      }
      
      return NextResponse.json(errorResponse, { status: 401 });
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

    // Set secure HTTP-only cookies for access and refresh tokens
    const cookieStore = await cookies();
    
    // Clear any existing tokens first
    cookieStore.delete('access-token');
    cookieStore.delete('refresh-token');
    cookieStore.delete('auth-token'); // Clear old auth-token for backward compatibility
    
    // Set access token cookie (1 hour)
    if (result.accessToken) {
      cookieStore.set('access-token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });
      
      // Set legacy auth-token for backward compatibility
      cookieStore.set('auth-token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });
    }
    
    // Set refresh token cookie (7 days)
    if (result.refreshToken) {
      cookieStore.set('refresh-token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
    }

    console.log('Cookies set:', {
      accessToken: result.accessToken ? result.accessToken.substring(0, 50) + '...' : 'undefined',
      refreshToken: result.refreshToken ? result.refreshToken.substring(0, 50) + '...' : 'undefined',
      accessTokenExpiry: result.accessToken ? new Date((result.accessToken.split('.')[1] ? JSON.parse(atob(result.accessToken.split('.')[1])).exp * 1000 : 0)).toISOString() : 'undefined'
    });

    // Return tokens in JSON body for mobile app compatibility
    const response = NextResponse.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,      // ← ADDED for mobile
      refreshToken: result.refreshToken,    // ← ADDED for mobile
      token: result.accessToken,            // ← ADDED for backward compatibility
      message: 'Login successful'
    });

    // Also set cookies in response headers for web browsers
    if (result.accessToken) {
      response.cookies.set('access-token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });
      
      // Set legacy auth-token for backward compatibility
      response.cookies.set('auth-token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });
    }
    
    if (result.refreshToken) {
      response.cookies.set('refresh-token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
    }

    // Apply CORS headers
    const origin = request.headers.get('origin');
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);

  } catch (error) {
    console.error('Login error:', error);
    const origin = request.headers.get('origin');
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(errorResponse, origin || undefined);
  }
}
