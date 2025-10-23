import { requireRole } from "@/lib/permission-guards";
import { DepartmentDetails } from "@/components/admin/department-details";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Department Details | Admin Dashboard",
  description: "View department information",
};

export default async function DepartmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Ensure only facility admins can access this page
  await requireRole(['facility_admin', 'facility_manager', 'billing_admin'], '/unauthorized');

  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <DepartmentDetails departmentId={id} />
      </div>
    </div>
  );
}


