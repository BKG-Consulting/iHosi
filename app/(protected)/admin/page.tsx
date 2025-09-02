import { requireRole } from "@/lib/permission-guards";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminDashboardStats } from "@/utils/services/admin";

export default async function AdminPage() {
  console.log("=== ADMIN PAGE DEBUG ===");
  
  try {
    // Ensure only admins can access this page
    console.log("Calling requireRole with ['admin']");
    await requireRole(['admin'], '/unauthorized');
    console.log("requireRole passed successfully");
  } catch (error) {
    console.error("requireRole failed:", error);
    throw error;
  }

  // Fetch data server-side
  console.log("Fetching admin dashboard stats...");
  const dashboardStats = await getAdminDashboardStats();
  console.log("Dashboard stats result:", dashboardStats);

  // Check if we got valid stats or an error
  if (!dashboardStats.success) {
    console.log("Dashboard stats failed, showing error page");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Error</h1>
          <p className="text-gray-600">{dashboardStats.message || 'Failed to load dashboard data'}</p>
        </div>
      </div>
    );
  }

  console.log("Rendering AdminDashboard component");
  return <AdminDashboard initialStats={dashboardStats} />;
}
