import { requirePermission } from "@/lib/permission-guards";
import { WardManagement } from "@/components/admin/ward-management";

export default async function WardsPage() {
  // Ensure user has permission to manage wards
  await requirePermission('WARD_READ', '/unauthorized');

  return <WardManagement />;
}
