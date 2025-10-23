import { AvailableDoctorProps } from "@/types/data-types";
import { getPatientDashboardStatistics } from "@/utils/services/patient";
import { verifyAuth } from "@/lib/auth/auth-helper";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { SuccessTransition } from "@/components/success-transition";

// Lazy load heavy components with better loading states
const AvailableDoctorsBooking = dynamic(() => import("@/components/patient/available-doctors-booking").then(mod => ({ default: mod.AvailableDoctorsBooking })), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
            <div className="h-14 w-14 bg-slate-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
});

const AppointmentChart = dynamic(() => import("@/components/charts/appointment-chart").then(mod => ({ default: mod.AppointmentChart })), {
  loading: () => (
    <div className="h-[400px] bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-[#5AC5C8] text-sm">Loading chart...</div>
    </div>
  )
});


const RecentVitalsWidget = dynamic(() => import("@/components/patient/recent-vitals-widget").then(mod => ({ default: mod.RecentVitalsWidget })), {
  loading: () => (
    <div className="h-32 bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-[#5AC5C8] text-sm">Loading vitals...</div>
    </div>
  )
});

const RecentAppointments = dynamic(() => import("@/components/tables/recent-appointment").then(mod => ({ default: mod.RecentAppointments })), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-6 w-48 bg-gradient-to-r from-[#046658]/20 to-[#2EB6B0]/20 rounded animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border border-[#D1F1F2] rounded-lg bg-white/50">
            <div className="h-10 w-10 bg-gradient-to-br from-[#046658]/20 to-[#2EB6B0]/20 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gradient-to-r from-[#046658]/20 to-[#2EB6B0]/20 rounded animate-pulse" />
              <div className="h-3 w-48 bg-gradient-to-r from-[#5AC5C8]/20 to-[#2EB6B0]/20 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-gradient-to-r from-[#5AC5C8]/20 to-[#2EB6B0]/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
});

const PatientDashboard = async ({ searchParams }: { searchParams?: Promise<{ success?: string }> }) => {
  // Get user from our custom authentication system using centralized helper
  const authResult = await verifyAuth();
  
  if (!authResult.isValid || !authResult.user) {
    redirect("/sign-in");
  }

  const user = authResult.user;

  // Show success transition if coming from registration
  const resolvedSearchParams = await searchParams;
  if (resolvedSearchParams?.success === "true") {
    return (
      <SuccessTransition
        title="Registration Successful!"
        message="Welcome to Ihosi Healthcare Management System. Your patient profile has been created successfully."
        redirectTo="/patient"
        redirectDelay={4000}
      />
    );
  }

  // Fetch patient dashboard statistics
  let result;
  try {
    result = await getPatientDashboardStatistics(user.id);
  } catch (error) {
    console.error("Error retrieving patient data:", error);
    
    // Return error result to prevent redirect loop
    result = {
      success: false,
      message: "Error retrieving patient data",
      data: null,
      status: 500,
      appointmentCounts: {},
      last5Records: [],
      totalAppointments: 0,
      availableDoctor: [],
      monthlyData: []
    };
  }

  // Check if patient data exists
  if (!result.success || !result.data) {
    redirect("/patient/registration");
  }

  const {
    data,
    appointmentCounts = {},
    last5Records = [],
    totalAppointments = 0,
    availableDoctor = [],
    monthlyData = [],
  } = result as any;

  // Get all doctors for the booking form
  const { getDoctors } = await import('@/utils/services/doctor');
  const { data: allDoctors } = await getDoctors(true);
  
  return (
    <div className="min-h-screen p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
          Welcome back, {data?.first_name || user?.firstName}
        </h1>
        <p className="text-slate-600 text-lg mb-6">
          Here's what's happening with your health journey today
        </p>

        {/* Balanced Stats Grid - 4 Equal Width Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Appointments */}
          <Link href="/record/appointments" className="group">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{totalAppointments || 0}</p>
              <p className="text-sm text-slate-500">Total Appointments</p>
            </div>
          </Link>

          {/* Pending */}
          <Link href="/record/appointments" className="group">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-amber-300 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{(appointmentCounts?.PENDING || 0) + (appointmentCounts?.SCHEDULED || 0)}</p>
              <p className="text-sm text-slate-500">Upcoming</p>
            </div>
          </Link>

          {/* Completed */}
          <Link href="/record/appointments" className="group">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{appointmentCounts?.COMPLETED || 0}</p>
              <p className="text-sm text-slate-500">Completed</p>
            </div>
          </Link>

          {/* Cancelled */}
          <Link href="/record/appointments" className="group">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-red-300 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{appointmentCounts?.CANCELLED || 0}</p>
              <p className="text-sm text-slate-500">Cancelled</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Grid - Functional First */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Primary Content - Takes 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Appointments - Most Important */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <Suspense fallback={<div className="h-32 bg-slate-50 rounded-lg animate-pulse flex items-center justify-center"><div className="text-slate-500 text-sm">Loading appointments...</div></div>}>
              <RecentAppointments data={last5Records || []} />
            </Suspense>
          </div>

          {/* Appointment Trends - Secondary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-1">Appointment Trends</h2>
              <p className="text-sm text-slate-600">Your appointment activity over time</p>
            </div>
            <Suspense fallback={<div className="h-[300px] bg-slate-50 rounded-lg animate-pulse flex items-center justify-center"><div className="text-slate-500 text-sm">Loading chart...</div></div>}>
              <AppointmentChart data={monthlyData || []} />
            </Suspense>
          </div>
        </div>

        {/* Sidebar - Actionable Items */}
        <div className="space-y-6">
          {/* Recent Vitals - Critical Health Data */}
          <Suspense fallback={<div className="h-32 bg-slate-50 rounded-lg animate-pulse flex items-center justify-center"><div className="text-slate-500 text-sm">Loading vitals...</div></div>}>
            <RecentVitalsWidget patientId={user.id} />
          </Suspense>

          {/* Available Doctors with Integrated Booking */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <Suspense fallback={<div className="h-32 bg-slate-50 rounded-lg animate-pulse flex items-center justify-center"><div className="text-slate-500 text-sm">Loading doctors...</div></div>}>
              <AvailableDoctorsBooking 
                data={availableDoctor as AvailableDoctorProps} 
                patientData={data!} 
                allDoctors={allDoctors || []} 
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
