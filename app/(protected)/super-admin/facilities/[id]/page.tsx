import { verifyAuth } from "@/lib/auth/auth-helper";
import { redirect, notFound } from "next/navigation";
import db from "@/lib/db";
import { FacilityDetailsView } from "@/components/admin/facility-details-view";

export default async function FacilityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Verify super admin authentication
  const authResult = await verifyAuth();
  
  if (!authResult.isValid || !authResult.user) {
    redirect("/sign-in");
  }

  if (authResult.user.role !== 'SUPER_ADMIN') {
    redirect("/unauthorized");
  }

  const { id } = await params;
  
  // Get facility details
  const facility = await db.facility.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          doctor_facilities: true,
          patient_facilities: true,
          staff_facilities: true,
          appointments: true,
          admins: true,
        },
      },
      admins: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          last_login_at: true,
          created_at: true,
        },
      },
      doctor_facilities: {
        take: 10,
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              specialization: true,
              phone: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });

  if (!facility) {
    notFound();
  }

  // Get recent appointments
  const recentAppointments = await db.appointment.findMany({
    where: {
      facility_id: facility.id,
    },
    include: {
      patient: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          specialization: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 10,
  });

  return (
    <FacilityDetailsView 
      facility={facility} 
      recentAppointments={recentAppointments}
    />
  );
}

