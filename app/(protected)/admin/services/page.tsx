import { Metadata } from "next";
import { requireRole } from "@/lib/permission-guards";
import { ServicesManagement } from "@/components/admin/services-management";

export const metadata: Metadata = {
  title: "Services Management | Healthcare System",
  description: "Manage hospital services, procedures, and pricing",
};

export default async function ServicesPage() {
  // Ensure only admins can access this page
  await requireRole(['admin'], '/unauthorized');

  return <ServicesManagement />;
}
