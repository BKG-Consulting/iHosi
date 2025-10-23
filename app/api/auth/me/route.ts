import { NextRequest, NextResponse } from 'next/server';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

export async function GET(request: NextRequest) {
  try {
    // Check for token in multiple places for mobile app compatibility
    // 1. Check cookies (for web)
    const oldToken = request.cookies.get('auth-token')?.value;
    const accessToken = request.cookies.get('access-token')?.value;
    
    // 2. Check Authorization header (for mobile)
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // Use whichever is available
    const token = bearerToken || accessToken || oldToken;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = sessionResult.user;
    
    const origin = request.headers.get('origin');
    const response = NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: (user as any).phone || null,
        role: user.role,
        departmentId: user.departmentId,
        mfaEnabled: user.mfaEnabled,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive,
      }
    });
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
  } catch (error) {
    console.error('Error fetching current user:', error);
    const origin = request.headers.get('origin');
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(errorResponse, origin || undefined);
  }
}