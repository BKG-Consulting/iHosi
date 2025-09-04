import { requirePermission } from "@/lib/permission-guards";
import { DepartmentDetails } from "@/components/admin/department-details";
import { getDepartmentWithDetails } from "@/utils/services/department";

interface DepartmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  await requirePermission('DEPARTMENT_READ', '/unauthorized');
  
  const { id } = await params;
  const departmentData = await getDepartmentWithDetails(id);
  
  if (!departmentData.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Department Not Found</h1>
          <p className="text-gray-600">{departmentData.message || 'The requested department could not be found'}</p>
        </div>
      </div>
    );
  }

  return <DepartmentDetails department={departmentData.department!} />;
}
