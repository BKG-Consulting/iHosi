import { verifyAuth } from "@/lib/auth/auth-helper";
import { redirect } from "next/navigation";
import { SuperAdminDashboard } from "@/components/admin/super-admin-dashboard";
import db from "@/lib/db";

export default async function SuperAdminPage() {
  // Verify authentication
  const authResult = await verifyAuth();
  
  if (!authResult.isValid || !authResult.user) {
    redirect("/sign-in");
  }

  const user = authResult.user;

  // Check if user is super admin
  if (user.role !== 'SUPER_ADMIN') {
    redirect("/unauthorized");
  }

  // Get facilities count and stats
  const [facilitiesCount, activeFacilities, totalDoctors, totalPatients, totalStaff] = await Promise.all([
    db.facility.count(),
    db.facility.count({ where: { status: 'ACTIVE' } }),
    db.doctor.count(),
    db.patient.count(),
    db.staff.count(),
  ]);

  // Get recent facilities
  const recentFacilities = await db.facility.findMany({
    take: 10,
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          doctor_facilities: true,
          patient_facilities: true,
          appointments: true,
        },
      },
    },
  });

  return (
    <SuperAdminDashboard
      user={user}
      stats={{
        totalFacilities: facilitiesCount,
        activeFacilities,
        totalDoctors,
        totalPatients,
        totalStaff,
      }}
      recentFacilities={recentFacilities}
    />
  );
}

