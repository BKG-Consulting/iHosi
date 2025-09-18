import { cookies } from 'next/headers';
import { HIPAAAuthService } from './hipaa-auth';

/**
 * Centralized authentication helper for consistent token handling
 * Handles both old (auth-token) and new (access-token) token formats
 */

export interface AuthResult {
  isValid: boolean;
  user?: any;
  sessionId?: string;
  error?: string;
}

/**
 * Get authentication token from cookies (checks both old and new formats)
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const oldToken = cookieStore.get('auth-token')?.value;
    const accessToken = cookieStore.get('access-token')?.value;
    
    // Prefer new format, fallback to old format
    return accessToken || oldToken || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Verify authentication and return user data
 * This is the main function to use in protected pages
 */
export async function verifyAuth(): Promise<AuthResult> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        isValid: false,
        error: 'No authentication token found'
      };
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      return {
        isValid: false,
        error: 'Invalid session or user not found'
      };
    }

    return {
      isValid: true,
      user: sessionResult.user,
      sessionId: sessionResult.sessionId
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      isValid: false,
      error: 'Authentication verification failed'
    };
  }
}

/**
 * Check if user has required role
 */
export async function requireRole(requiredRoles: string[]): Promise<AuthResult> {
  const authResult = await verifyAuth();
  
  if (!authResult.isValid || !authResult.user) {
    return authResult;
  }

  const userRole = authResult.user.role?.toUpperCase();
  const hasRequiredRole = requiredRoles.some(role => 
    role.toUpperCase() === userRole
  );

  if (!hasRequiredRole) {
    return {
      isValid: false,
      error: 'Insufficient permissions'
    };
  }

  return authResult;
}

/**
 * Get user role for redirect logic
 */
export function getUserRedirectPath(role: string): string {
  switch (role?.toUpperCase()) {
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
      return '/dashboard';
  }
}



