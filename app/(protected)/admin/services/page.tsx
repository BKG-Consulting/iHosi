import { requireRole } from "@/lib/permission-guards";
import { ServicesManagement } from "@/components/admin/services-management";

export default async function ServicesPage() {
  await requireRole(['admin']);
  
  return (
    <div className="container mx-auto py-6">
      <ServicesManagement />
    </div>
  );
}