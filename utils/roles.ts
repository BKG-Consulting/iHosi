import { Roles } from "@/types/globals";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === role.toLowerCase();
};

export const getRole = async () => {
  const { sessionClaims } = await auth();

  // Debug: Log what we're getting from Clerk
  console.log("=== ROLE DEBUGGING ===");
  console.log("Session claims:", sessionClaims);
  console.log("Metadata:", sessionClaims?.metadata);
  console.log("Raw role:", sessionClaims?.metadata?.role);
  console.log("Role type:", typeof sessionClaims?.metadata?.role);

  const rawRole = sessionClaims?.metadata?.role;

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
    "patient": "patient"
  };

  const mappedRole = roleMapping[normalizedRole] || "patient";
  console.log(`Role mapping: ${normalizedRole} -> ${mappedRole}`);

  return mappedRole;
};
