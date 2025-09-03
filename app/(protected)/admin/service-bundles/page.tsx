import { Metadata } from "next";
import { requireRole } from "@/lib/permission-guards";
import { ServiceBundlesManagement } from "@/components/admin/service-bundles-management";

export const metadata: Metadata = {
  title: "Service Bundles Management | Healthcare System",
  description: "Manage service packages and bundles",
};

export default async function ServiceBundlesPage() {
  // Ensure only admins can access this page
  await requireRole(['admin'], '/unauthorized');

  return <ServiceBundlesManagement />;
}
