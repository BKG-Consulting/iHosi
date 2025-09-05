import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export interface UserRole {
  role: string;
  userId: string;
  isAuthenticated: boolean;
}

export async function getOptimizedUserRole(): Promise<UserRole> {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return {
        role: "guest",
        userId: "",
        isAuthenticated: false
      };
    }

    const role = sessionClaims?.metadata?.role || "patient";
    
    return {
      role: role.toLowerCase(),
      userId,
      isAuthenticated: true
    };
  } catch (error) {
    console.error("Error getting user role:", error);
    return {
      role: "guest", 
      userId: "",
      isAuthenticated: false
    };
  }
}

export function getDefaultRouteForRole(role: string): string {
  const roleRoutes = {
    admin: "/admin",
    doctor: "/doctor", 
    nurse: "/nurse",
    "lab technician": "/lab",
    patient: "/patient",
    guest: "/sign-in"
  };
  
  return roleRoutes[role as keyof typeof roleRoutes] || "/sign-in";
}

export async function requireRole(allowedRoles: string[]): Promise<UserRole> {
  const userRole = await getOptimizedUserRole();
  
  if (!userRole.isAuthenticated) {
    redirect("/sign-in");
  }
  
  if (!allowedRoles.includes(userRole.role)) {
    redirect(getDefaultRouteForRole(userRole.role));
  }
  
  return userRole;
}

export function createRoleBasedRedirect(role: string) {
  return () => redirect(getDefaultRouteForRole(role));
}
