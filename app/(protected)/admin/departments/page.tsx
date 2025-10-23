import { requireRole } from "@/lib/permission-guards";
import { DepartmentList } from "@/components/admin/department-list";

export const metadata = {
  title: "Departments | Admin Dashboard",
  description: "Manage facility departments",
};

export default async function DepartmentsPage() {
  // Ensure only facility admins can access this page
  await requireRole(['facility_admin', 'facility_manager'], '/unauthorized');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <DepartmentList />
      </div>
    </div>
  );
}




