import { TenantManagement } from "@/components/admin/tenant-management";
import { requirePermission } from "@/lib/permission-guards";

export default async function TenantsPage() {
  await requirePermission('SYSTEM_CONFIG_VIEW', '/unauthorized');
  
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <TenantManagement />
      </div>
    </div>
  );
}
