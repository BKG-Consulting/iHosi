import { NextRequest, NextResponse } from 'next/server';

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
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/verify-mfa',
  '/api/auth/logout',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/_next',
  '/favicon.ico'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get auth token from cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirect to sign-in page
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // For now, just check if token exists
  // In production, you would verify the JWT token here
  // This is a simplified version to avoid Edge Runtime issues

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Session security
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
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
