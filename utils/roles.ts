import { Roles } from "@/types/globals";
import { HIPAAAuthService } from "@/lib/auth/hipaa-auth";
import { cookies } from "next/headers";

export const checkRole = async (role: Roles) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return false;
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      return false;
    }

    return sessionResult.user.role.toLowerCase() === role.toLowerCase();
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

export const getRole = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      console.log("No auth token found, defaulting to patient");
      return "patient";
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      console.log("Invalid session, defaulting to patient");
      return "patient";
    }

    const rawRole = sessionResult.user.role;

    // Debug: Log what we're getting from our auth system (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log("=== ROLE DEBUGGING ===");
      console.log("User data:", sessionResult.user);
      console.log("Raw role:", rawRole);
      console.log("Role type:", typeof rawRole);
    }

    // Handle different role formats
    if (!rawRole) {
      console.log("No role found, defaulting to patient");
      return "patient";
    }

    // Convert to lowercase for routing
    const normalizedRole = rawRole.toString().toLowerCase();
    console.log("Normalized role for routing:", normalizedRole);

    // Map roles to proper routing paths
    const roleMapping: { [key: string]: string } = {
      "admin": "admin",
      "administrator": "admin",
      "doctor": "doctor", 
      "nurse": "staff",
      "lab_technician": "staff",
      "cashier": "staff",
      "admin_assistant": "staff",
      "patient": "patient"
    };

    const mappedRole = roleMapping[normalizedRole] || "patient";
    console.log(`Role mapping: ${normalizedRole} -> ${mappedRole}`);

    return mappedRole;
  } catch (error) {
    console.error('Error getting role:', error);
    return "patient";
  }
};
