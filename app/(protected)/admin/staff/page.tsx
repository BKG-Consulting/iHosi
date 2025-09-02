import { requirePermission } from "@/lib/permission-guards";
import { StaffManagement } from "@/components/admin/staff-management";

export default async function StaffManagementPage() {
  // Ensure user has permission to manage staff
  await requirePermission('STAFF_READ', '/unauthorized');

  return <StaffManagement />;
}
