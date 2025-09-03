import { Metadata } from "next";
import { requireRole } from "@/lib/permission-guards";
import { ServiceTemplatesManagement } from "@/components/admin/service-templates-management";

export const metadata: Metadata = {
  title: "Service Templates Management | Healthcare System",
  description: "Manage service templates for common procedures",
};

export default async function ServiceTemplatesPage() {
  // Ensure only admins can access this page
  await requireRole(['admin'], '/unauthorized');

  return <ServiceTemplatesManagement />;
}
