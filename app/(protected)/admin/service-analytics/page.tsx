import { Metadata } from "next";
import { requireRole } from "@/lib/permission-guards";
import { ServiceAnalytics } from "@/components/admin/service-analytics";

export const metadata: Metadata = {
  title: "Service Analytics | Healthcare System",
  description: "Service utilization and performance analytics",
};

export default async function ServiceAnalyticsPage() {
  // Ensure only admins can access this page
  await requireRole(['admin'], '/unauthorized');

  return <ServiceAnalytics />;
}
