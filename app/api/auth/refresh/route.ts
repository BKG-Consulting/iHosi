import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TokenManager } from '@/lib/auth/token-manager';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh-token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'No refresh token found' 
      }, { status: 401 });
    }

    // Verify the refresh token
    const refreshResult = await TokenManager.verifyRefreshToken(refreshToken);
    
    if (!refreshResult.valid || !refreshResult.payload) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid refresh token' 
      }, { status: 401 });
    }

    // Create new token pair
    const tokenPair = await TokenManager.createTokenPair(
      refreshResult.payload.userId,
      refreshResult.payload.email,
      refreshResult.payload.role,
      refreshResult.payload.sessionId,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    // Revoke the old refresh token (TODO: implement revokeRefreshToken method)
    // await TokenManager.revokeRefreshToken(refreshToken);

    // Log the refresh event
    await logAudit({
      action: 'UPDATE',
      resourceType: 'AUTH',
      resourceId: refreshResult.payload.userId,
      success: true,
      metadata: {
        sessionId: refreshResult.payload.sessionId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }, {
      userId: refreshResult.payload.userId,
      userRole: refreshResult.payload.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Create response with new tokens
    const response = NextResponse.json({ 
      success: true,
      accessToken: tokenPair.accessToken,
      expiresAt: tokenPair.expiresAt.toISOString()
    });

    // Set new access token cookie
    response.cookies.set('access-token', tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    });

    // Set new refresh token cookie
    response.cookies.set('refresh-token', tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Log the failed refresh attempt
    await logAudit({
      action: 'UPDATE',
      resourceType: 'AUTH',
      resourceId: 'unknown',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }, {
      userId: 'unknown',
      userRole: 'SYSTEM',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({ 
      success: false, 
      error: 'Token refresh failed' 
    }, { status: 401 });
  }
}