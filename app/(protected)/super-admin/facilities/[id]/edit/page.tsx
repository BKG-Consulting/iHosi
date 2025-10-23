import { verifyAuth } from "@/lib/auth/auth-helper";
import { redirect, notFound } from "next/navigation";
import db from "@/lib/db";
import { EditFacilityForm } from "@/components/admin/edit-facility-form";

export default async function EditFacilityPage({ params }: { params: Promise<{ id: string }> }) {
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
  });

  if (!facility) {
    notFound();
  }

  return <EditFacilityForm facility={facility} />;
}

