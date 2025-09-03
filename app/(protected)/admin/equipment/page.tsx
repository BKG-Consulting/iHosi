import { requirePermission } from "@/lib/permission-guards";
import EquipmentManagement from "@/components/admin/equipment-management";

export default async function EquipmentPage() {
  // Ensure user has permission to manage equipment
  await requirePermission('EQUIPMENT_READ', '/unauthorized');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <EquipmentManagement />
      </div>
    </div>
  );
}
