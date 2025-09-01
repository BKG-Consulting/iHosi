import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccess } from "./lib/routes";

const matchers = Object.keys(routeAccess).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccess[route],
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = new URL(req.url);

  const role =
    userId && sessionClaims?.metadata?.role
      ? sessionClaims.metadata.role
      : userId
      ? "patient"
      : "sign-in";

  // HIPAA Audit Logging - Simplified for Edge Runtime
  if (userId) {
    const patientIdMatch = url.pathname.match(/\/patient\/([^\/]+)/);
    const patientId = patientIdMatch?.[1];
    
    // Note: Database operations removed from middleware due to Edge Runtime limitations
    // These will be handled in API routes and server components instead
    
    console.log(`Access: ${role} user ${userId} accessing ${url.pathname}`);
  }

  const matchingRoute = matchers.find(({ matcher }) => matcher(req));

  if (matchingRoute && !matchingRoute.allowedRoles.includes(role)) {
    // Log unauthorized access attempt
    console.warn(`🚨 UNAUTHORIZED ACCESS: ${role} user ${userId || 'anonymous'} tried to access ${url.pathname}`);

    // Redirect unauthorized roles to their respective default pages
    return NextResponse.redirect(new URL(`/${role}`, url.origin));
  }

  // Add security headers to response
  const response = NextResponse.next();
  
  // Additional runtime security headers
  response.headers.set('X-Authenticated-User', userId || 'anonymous');
  response.headers.set('X-User-Role', role);
  
  // Session security
  if (userId) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
});

// Note: Audit logging moved to API routes and server components
// due to Edge Runtime limitations with Prisma

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
