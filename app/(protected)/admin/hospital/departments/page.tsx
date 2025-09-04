import { getDepartments } from "@/app/actions/department";
import { DepartmentList } from "@/components/lists/department-list";
import { DepartmentManagement } from "@/components/admin/department-management";
import { requirePermission } from "@/lib/permission-guards";

export default async function DepartmentsPage() {
  // Check permissions
  await requirePermission('DEPARTMENT_READ', '/unauthorized');
  
  const departmentsResponse = await getDepartments();
  const departments = departmentsResponse.success ? departmentsResponse.data || [] : [];

  return (
    <DepartmentManagement departments={departments as any} />
  );
}
