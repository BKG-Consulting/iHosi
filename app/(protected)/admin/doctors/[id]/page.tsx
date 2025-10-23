import { requireRole } from "@/lib/permission-guards";
import { DoctorDetails } from "@/components/admin/doctor-details";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Doctor Details | Admin Dashboard",
  description: "View doctor information",
};

export default async function DoctorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Ensure only facility admins can access this page
  await requireRole(['facility_admin', 'facility_manager', 'billing_admin'], '/unauthorized');

  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <DoctorDetails doctorId={id} />
      </div>
    </div>
  );
}


