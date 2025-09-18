import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { AvailableDoctorProps } from "@/types/data-types";
import { getPatientDashboardStatistics } from "@/utils/services/patient";

import { verifyAuth } from "@/lib/auth/auth-helper";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { SuccessTransition } from "@/components/success-transition";

// Lazy load heavy components with better loading states
const AvailableDoctors = dynamic(() => import("@/components/available-doctor").then(mod => ({ default: mod.AvailableDoctors })), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-4 w-32 bg-gradient-to-r from-[#046658]/20 to-[#2EB6B0]/20 rounded animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-[#046658]/20 to-[#2EB6B0]/20 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gradient-to-r from-[#046658]/20 to-[#2EB6B0]/20 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gradient-to-r from-[#5AC5C8]/20 to-[#2EB6B0]/20 rounded animate-pulse" />
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

const StatSummary = dynamic(() => import("@/components/charts/stat-summary").then(mod => ({ default: mod.StatSummary })), {
  loading: () => (
    <div className="h-32 bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-[#5AC5C8] text-sm">Loading summary...</div>
    </div>
  )
});

const PatientRatingContainer = dynamic(() => import("@/components/patient-rating-container").then(mod => ({ default: mod.PatientRatingContainer })), {
  loading: () => (
    <div className="h-32 bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-[#5AC5C8] text-sm">Loading ratings...</div>
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

  // Enhanced debugging for patient data retrieval
  console.log("=== PATIENT DASHBOARD DEBUG ===");
  console.log("About to call getPatientDashboardStatistics with user ID:", user.id);
  console.log("User object:", user);
  
  let result;
  try {
    result = await getPatientDashboardStatistics(user.id);
    console.log("getPatientDashboardStatistics completed successfully");
    console.log("Full result from getPatientDashboardStatistics:", JSON.stringify(result, null, 2));
    console.log("Result success:", result.success);
    console.log("Result data:", result.data);
    console.log("Result message:", (result as any).message);
    console.log("Result status:", result.status);
  } catch (error) {
    console.error("=== ERROR IN getPatientDashboardStatistics CALL ===");
    console.error("Error:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
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
  console.log("=== REDIRECT CHECK ===");
  console.log("Result success:", result.success);
  console.log("Result data exists:", !!result.data);
  console.log("Result data:", result.data);
  
  if (!result.success || !result.data) {
    console.log("❌ REDIRECTING TO REGISTRATION - Patient data not found");
    console.log("Result:", result);
    redirect("/patient/registration");
  } else {
    console.log("✅ NO REDIRECT - Patient data found, proceeding to dashboard");
  }

  const {
    data,
    appointmentCounts = {},
    last5Records = [],
    totalAppointments = 0,
    availableDoctor = [],
    monthlyData = [],
  } = result as any;

  const cardData = [
    {
      title: "Total Appointments",
      value: totalAppointments || 0,
      icon: Calendar,
      className: "bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 border-[#D1F1F2] shadow-lg hover:shadow-xl transition-all duration-300",
      iconClassName: "bg-gradient-to-br from-[#046658] to-[#2EB6B0] text-white shadow-lg",
      note: "All time appointments",
      link: "/record/appointments",
    },
    {
      title: "Cancelled",
      value: appointmentCounts?.CANCELLED || 0,
      icon: XCircle,
      className: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300",
      iconClassName: "bg-red-500 text-white shadow-lg",
      note: "Cancelled appointments",
      link: "/record/appointments",
    },
    {
      title: "Pending",
      value: (appointmentCounts?.PENDING || 0) + (appointmentCounts?.SCHEDULED || 0),
      icon: AlertCircle,
      className: "bg-gradient-to-br from-[#5AC5C8]/10 to-[#2EB6B0]/10 border-[#D1F1F2] shadow-lg hover:shadow-xl transition-all duration-300",
      iconClassName: "bg-gradient-to-br from-[#5AC5C8] to-[#2EB6B0] text-white shadow-lg",
      note: "Upcoming appointments",
      link: "/record/appointments",
    },
    {
      title: "Completed",
      value: appointmentCounts?.COMPLETED || 0,
      icon: CheckCircle,
      className: "bg-gradient-to-br from-[#2EB6B0]/10 to-[#5AC5C8]/10 border-[#D1F1F2] shadow-lg hover:shadow-xl transition-all duration-300",
      iconClassName: "bg-gradient-to-br from-[#2EB6B0] to-[#5AC5C8] text-white shadow-lg",
      note: "Successful appointments",
      link: "/record/appointments",
    },
  ];

  console.log("=== RENDERING DASHBOARD ===");
  console.log("About to render patient dashboard with data:", data);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3E4C4B] mb-2">
              Welcome back, {data?.first_name || user?.firstName}
            </h1>
            <p className="text-[#3E4C4B]/80 text-lg">
              Here's what's happening with your health journey today
            </p>
          </div>
          <div className="flex items-center gap-4">
            
          </div>
        </div>
        
        {/* Current Year Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#D1F1F2] shadow-lg">
          <Calendar className="w-4 h-4 text-[#5AC5C8] mr-2" />
          <span className="text-sm font-medium text-[#3E4C4B]">{new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cardData?.map((card, id) => (
          <StatCard key={id} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content - Left Side */}
        <div className="xl:col-span-2 space-y-8">
          {/* Appointment Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D1F1F2] hover:shadow-xl transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#3E4C4B] mb-2">Appointment Trends</h2>
              <p className="text-[#3E4C4B]/80">Your appointment activity over the past months</p>
            </div>
            <Suspense fallback={<div className="h-[400px] bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center"><div className="text-[#5AC5C8] text-sm">Loading chart...</div></div>}>
              <AppointmentChart data={monthlyData || []} />
            </Suspense>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D1F1F2] hover:shadow-xl transition-all duration-300">
            <Suspense fallback={<div className="h-32 bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center"><div className="text-[#5AC5C8] text-sm">Loading appointments...</div></div>}>
              <RecentAppointments data={last5Records || []} />
            </Suspense>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-8">
          {/* Summary Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D1F1F2] hover:shadow-xl transition-all duration-300">
            <Suspense fallback={<div className="h-32 bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center"><div className="text-[#5AC5C8] text-sm">Loading summary...</div></div>}>
              <StatSummary data={appointmentCounts || {}} total={totalAppointments || 0} />
            </Suspense>
          </div>

          {/* Available Doctors */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D1F1F2] hover:shadow-xl transition-all duration-300">
            <Suspense fallback={<div className="h-32 bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center"><div className="text-[#5AC5C8] text-sm">Loading doctors...</div></div>}>
              <AvailableDoctors data={availableDoctor as AvailableDoctorProps} />
            </Suspense>
          </div>

          {/* Patient Ratings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D1F1F2] hover:shadow-xl transition-all duration-300">
            <Suspense fallback={<div className="h-32 bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/10 rounded-lg animate-pulse flex items-center justify-center"><div className="text-[#5AC5C8] text-sm">Loading ratings...</div></div>}>
              <PatientRatingContainer />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
