import { NextRequest, NextResponse } from 'next/server';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { logAudit } from '@/lib/audit';

// Route access control configuration
const routeAccess = {
  "/admin(.*)": ["ADMIN"],
  "/patient(.*)": ["PATIENT", "ADMIN", "DOCTOR", "NURSE"],
  "/doctor(.*)": ["DOCTOR"],
  "/staff(.*)": ["NURSE", "LAB_TECHNICIAN", "CASHIER", "ADMIN_ASSISTANT"],
  "/record/users": ["ADMIN"],
  "/record/doctors": ["ADMIN"],
  "/record/doctors(.*)": ["ADMIN", "DOCTOR"],
  "/record/staffs": ["ADMIN", "DOCTOR"],
  "/record/patients": ["ADMIN", "DOCTOR", "NURSE"],
  "/api/admin(.*)": ["ADMIN"],
  "/api/doctor(.*)": ["DOCTOR"],
  "/api/patient(.*)": ["PATIENT", "ADMIN", "DOCTOR", "NURSE"],
  "/api/staff(.*)": ["NURSE", "LAB_TECHNICIAN", "CASHIER", "ADMIN_ASSISTANT"],
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/api/auth/login',
  '/api/auth/verify-mfa',
  '/api/auth/logout',
  '/api/health',
  '/_next',
  '/favicon.ico'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // Redirect to sign-in page
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Verify session
    const sessionResult = await HIPAAAuthService.verifySession(token);

    if (!sessionResult.valid || !sessionResult.user) {
      // Invalid session, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const user = sessionResult.user;

    // Check route access permissions
    const matchingRoute = Object.entries(routeAccess).find(([route]) => {
      const regex = new RegExp(route.replace(/\*/g, '.*'));
      return regex.test(pathname);
    });

    if (matchingRoute) {
      const [, allowedRoles] = matchingRoute;
      if (!allowedRoles.includes(user.role)) {
        // Log unauthorized access attempt
        await logAudit({
          action: 'READ',
          resourceType: 'AUTH',
          resourceId: pathname,
          reason: `User with role ${user.role} attempted to access ${pathname}`,
          metadata: {
            ipAddress,
            userAgent,
            allowedRoles,
            userRole: user.role
          }
        });

        // Redirect to appropriate dashboard based on role
        const redirectPath = getDefaultPathForRole(user.role);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Log successful access
    await logAudit({
      action: 'PAGE_ACCESS',
      resourceType: 'PAGE',
      resourceId: pathname,
      reason: 'User accessed protected route',
      metadata: {
        ipAddress,
        userAgent,
        userRole: user.role,
        userId: user.id
      }
    });

    // Add security headers
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Authenticated-User', user.id);
    response.headers.set('X-User-Role', user.role);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Session security
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // Log error
    await logAudit({
      action: 'READ',
      resourceType: 'SYSTEM',
      resourceId: pathname,
      reason: 'Middleware processing error',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        ipAddress,
        userAgent,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    // Redirect to sign-in on error
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

/**
 * Get default path for user role
 */
function getDefaultPathForRole(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'DOCTOR':
      return '/doctor';
    case 'NURSE':
    case 'LAB_TECHNICIAN':
    case 'CASHIER':
    case 'ADMIN_ASSISTANT':
      return '/staff';
    case 'PATIENT':
      return '/patient';
    default:
      return '/sign-in';
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
