// Permission Guards and Middleware for Route and Action Protection
import { redirect } from "next/navigation";
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission, Role } from "./permissions";
import { logAudit } from "./audit";

// Helper function to get current user using custom HIPAA authentication
async function getCurrentUser() {
  try {
    const { cookies } = await import('next/headers');
    const { HIPAAAuthService } = await import('./auth/hipaa-auth');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      return null;
    }

    return sessionResult.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

// Permission Guard Interface
export interface PermissionGuard {
  permission: Permission;
  fallback?: string;
  audit?: boolean;
}

// Multi-Permission Guard Interface
export interface MultiPermissionGuard {
  permissions: Permission[];
  requireAll?: boolean; // true = all permissions required, false = any permission required
  fallback?: string;
  audit?: boolean;
}

// Role Guard Interface
export interface RoleGuard {
  roles: Role[];
  fallback?: string;
  audit?: boolean;
}

// Permission Check Result
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  userRole?: Role;
  requiredPermissions?: Permission[];
}

// Core Permission Checker
export class PermissionChecker {
  /**
   * Check if current user has a specific permission
   */
  static async checkPermission(permission: Permission): Promise<PermissionCheckResult> {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return {
          allowed: false,
          reason: 'User not authenticated'
        };
      }

      const userRole = user.role?.toLowerCase() as Role;
      if (!userRole) {
        return {
          allowed: false,
          reason: 'User role not defined'
        };
      }

      const hasAccess = hasPermission(userRole, permission);
      
      return {
        allowed: hasAccess,
        reason: hasAccess ? undefined : `Insufficient permissions. Required: ${permission}`,
        userRole,
        requiredPermissions: [permission]
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        allowed: false,
        reason: 'Permission check failed'
      };
    }
  }

  /**
   * Check if current user has any of the specified permissions
   */
  static async checkAnyPermission(permissions: Permission[]): Promise<PermissionCheckResult> {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return {
          allowed: false,
          reason: 'User not authenticated'
        };
      }

      const userRole = user.role?.toLowerCase() as Role;
      if (!userRole) {
        return {
          allowed: false,
          reason: 'User role not defined'
        };
      }

      const hasAccess = hasAnyPermission(userRole, permissions);
      
      return {
        allowed: hasAccess,
        reason: hasAccess ? undefined : `Insufficient permissions. Required: Any of ${permissions.join(', ')}`,
        userRole,
        requiredPermissions: permissions
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        allowed: false,
        reason: 'Permission check failed'
      };
    }
  }

  /**
   * Check if current user has all of the specified permissions
   */
  static async checkAllPermissions(permissions: Permission[]): Promise<PermissionCheckResult> {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return {
          allowed: false,
          reason: 'User not authenticated'
        };
      }

      const userRole = user.role?.toLowerCase() as Role;
      if (!userRole) {
        return {
          allowed: false,
          reason: 'User role not defined'
        };
      }

      const hasAccess = hasAllPermissions(userRole, permissions);
      
      return {
        allowed: hasAccess,
        reason: hasAccess ? undefined : `Insufficient permissions. Required: All of ${permissions.join(', ')}`,
        userRole,
        requiredPermissions: permissions
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        allowed: false,
        reason: 'Permission check failed'
      };
    }
  }

  /**
   * Check if current user has one of the specified roles
   */
  static async checkRole(roles: Role[]): Promise<PermissionCheckResult> {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return {
          allowed: false,
          reason: 'User not authenticated'
        };
      }

      const userRole = user.role?.toLowerCase() as Role;
      if (!userRole) {
        return {
          allowed: false,
          reason: 'User role not defined'
        };
      }

      const hasAccess = roles.includes(userRole);
      
      return {
        allowed: hasAccess,
        reason: hasAccess ? undefined : `Insufficient role access. Required: One of ${roles.join(', ')}`,
        userRole,
        requiredPermissions: []
      };
    } catch (error) {
      console.error('Role check failed:', error);
      return {
        allowed: false,
        reason: 'Role check failed'
      };
    }
  }
}

// Route Protection Middleware
export async function requirePermission(permission: Permission, fallback: string = '/unauthorized') {
  const result = await PermissionChecker.checkPermission(permission);
  
  if (!result.allowed) {
    // Log the access attempt
    await logAudit({
      action: 'PAGE_ACCESS',
      resourceType: 'PAGE',
      resourceId: 'permission-check',
      reason: result.reason || 'Permission check failed',
      metadata: {
        requiredPermission: permission,
        userRole: result.userRole,
        fallbackRoute: fallback
      }
    });
    
    redirect(fallback);
  }
  
  return result;
}

export async function requireAnyPermission(permissions: Permission[], fallback: string = '/unauthorized') {
  const result = await PermissionChecker.checkAnyPermission(permissions);
  
  if (!result.allowed) {
    // Log the access attempt
    await logAudit({
      action: 'PAGE_ACCESS',
      resourceType: 'PAGE',
      resourceId: 'permission-check',
      reason: result.reason || 'Permission check failed',
      metadata: {
        requiredPermissions: permissions,
        userRole: result.userRole,
        fallbackRoute: fallback
      }
    });
    
    redirect(fallback);
  }
  
  return result;
}

export async function requireAllPermissions(permissions: Permission[], fallback: string = '/unauthorized') {
  const result = await PermissionChecker.checkAllPermissions(permissions);
  
  if (!result.allowed) {
    // Log the access attempt
    await logAudit({
      action: 'PAGE_ACCESS',
      resourceType: 'PAGE',
      resourceId: 'permission-check',
      reason: result.reason || 'Permission check failed',
      metadata: {
        requiredPermissions: permissions,
        userRole: result.userRole,
        fallbackRoute: fallback
      }
    });
    
    redirect(fallback);
  }
  
  return result;
}

export async function requireRole(roles: Role[], fallback: string = '/unauthorized') {
  console.log("=== REQUIRE ROLE DEBUG ===");
  console.log("Requested roles:", roles);
  
  try {
    // Use custom HIPAA authentication instead of Clerk
    const { cookies } = await import('next/headers');
    const { HIPAAAuthService } = await import('./auth/hipaa-auth');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      console.log("No auth token found, redirecting to:", fallback);
      redirect(fallback);
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      console.log("Invalid session, redirecting to:", fallback);
      redirect(fallback);
    }

    const user = sessionResult.user;
    const userRole = user.role?.toLowerCase() as Role;
    
    console.log("Current user ID:", user.id);
    console.log("Current user role:", userRole);
    console.log("User role in requested roles:", roles.includes(userRole));
    
    if (!userRole || !roles.includes(userRole)) {
      console.log("User role not in allowed roles, redirecting to:", fallback);
      console.log("User role:", userRole);
      console.log("Allowed roles:", roles);
      redirect(fallback);
    }

    console.log("Role check passed successfully");
    return true;
  } catch (error) {
    console.error("requireRole error:", error);
    redirect(fallback);
  }
}

// Action Protection (for Server Actions)
export async function protectAction(permission: Permission, userId?: string): Promise<boolean> {
  try {
    const result = await PermissionChecker.checkPermission(permission);
    
    if (!result.allowed) {
      // Log the denied action
      await logAudit({
        action: 'PAGE_ACCESS',
        resourceType: 'SYSTEM',
        resourceId: 'action-protection',
        reason: result.reason || 'Permission check failed',
        metadata: {
          requiredPermission: permission,
          userRole: result.userRole
        }
      });
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Action protection failed:', error);
    return false;
  }
}

export async function protectActionWithMultiplePermissions(
  permissions: Permission[], 
  requireAll: boolean = false,
  userId?: string
): Promise<boolean> {
  try {
    const result = requireAll 
      ? await PermissionChecker.checkAllPermissions(permissions)
      : await PermissionChecker.checkAnyPermission(permissions);
    
    if (!result.allowed) {
      // Log the denied action
      await logAudit({
        action: 'PAGE_ACCESS',
        resourceType: 'SYSTEM',
        resourceId: 'action-protection',
        reason: result.reason || 'Permission check failed',
        metadata: {
          requiredPermissions: permissions,
          requireAll,
          userRole: result.userRole
        }
      });
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Action protection failed:', error);
    return false;
  }
}

// Utility function to get current user's role
export async function getCurrentUserRole(): Promise<Role | null> {
  try {
    const user = await getCurrentUser();
    return user?.role?.toLowerCase() as Role || null;
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
}

// Utility function to check if user is admin
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'admin';
}

// Utility function to check if user has any admin-like permissions
export async function hasAdminAccess(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'admin' || role === 'doctor';
}
