// Helper functions for authentication across the application
import { cookies } from 'next/headers';
import { HIPAAAuthService } from './auth/hipaa-auth';

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string | null;
  mfaEnabled: boolean;
  lastLoginAt: Date | null;
  isActive: boolean;
}

/**
 * Get the current authenticated user using custom HIPAA authentication
 * @returns CurrentUser object or null if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      return null;
    }

    return {
      ...sessionResult.user,
      departmentId: sessionResult.user.departmentId ?? null,
      lastLoginAt: sessionResult.user.lastLoginAt ?? null,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Get the current user's ID
 * @returns User ID string or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Get the current user's role (normalized to lowercase)
 * @returns Role string or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.role?.toLowerCase() || null;
}

/**
 * Check if the current user has a specific role
 * @param role - The role to check for
 * @returns boolean indicating if user has the role
 */
export async function hasRole(role: string): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === role.toLowerCase();
}

/**
 * Check if the current user is an admin
 * @returns boolean indicating if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRole('admin');
}

/**
 * Check if the current user is a doctor
 * @returns boolean indicating if user is doctor
 */
export async function isDoctor(): Promise<boolean> {
  return await hasRole('doctor');
}

/**
 * Check if the current user is a patient
 * @returns boolean indicating if user is patient
 */
export async function isPatient(): Promise<boolean> {
  return await hasRole('patient');
}


