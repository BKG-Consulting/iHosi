import { requireRole } from "@/lib/permission-guards";
import { DoctorList } from "@/components/admin/doctor-list";

export const metadata = {
  title: "Doctor Management | Admin Dashboard",
  description: "Manage facility doctors",
};

export default async function DoctorsPage() {
  // Ensure only facility admins can access this page
  await requireRole(['facility_admin', 'facility_manager'], '/unauthorized');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <DoctorList />
      </div>
    </div>
  );
}




