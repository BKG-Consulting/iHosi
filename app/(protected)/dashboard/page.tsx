import { verifyAuth } from "@/lib/auth/auth-helper";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const authResult = await verifyAuth();
  
  if (!authResult.isValid || !authResult.user) {
    redirect("/sign-in");
  }

  const user = authResult.user;

  // Redirect to appropriate portal based on role
  const role = user.role?.toLowerCase().replace(/_/g, '-');

  console.log('🔄 Dashboard redirect:', { role: user.role, normalizedRole: role });

  switch (role) {
    case 'super-admin':
      redirect('/super-admin');
    case 'admin':
    case 'facility-admin':
      redirect('/admin');
    case 'doctor':
      redirect('/doctor');
    case 'patient':
      redirect('/patient');
    case 'nurse':
    case 'lab-technician':
    case 'cashier':
    case 'admin-assistant':
      redirect('/staff');
    default:
      // Fallback to patient dashboard
      redirect('/patient');
  }
}

