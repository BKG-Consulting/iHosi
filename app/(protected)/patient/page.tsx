import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stat-summary";
import { PatientRatingContainer } from "@/components/patient-rating-container";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { Button } from "@/components/ui/button";
import { AvailableDoctorProps } from "@/types/data-types";
import { getPatientDashboardStatistics } from "@/utils/services/patient";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const PatientDashboard = async () => {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  const {
    data,
    appointmentCounts,
    last5Records,
    totalAppointments,
    availableDoctor,
    monthlyData,
  } = await getPatientDashboardStatistics(user.id);

  if (user && !data) {
    redirect("/patient/registration");
  }

  if (!data) return null;

  const cardData = [
    {
      title: "Total Appointments",
      value: totalAppointments || 0,
      icon: Calendar,
      className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      iconClassName: "bg-blue-500 text-white",
      note: "All time appointments",
      link: "/record/appointments",
    },
    {
      title: "Cancelled",
      value: appointmentCounts?.CANCELLED || 0,
      icon: XCircle,
      className: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
      iconClassName: "bg-red-500 text-white",
      note: "Cancelled appointments",
      link: "/record/appointments",
    },
    {
      title: "Pending",
      value: (appointmentCounts?.PENDING || 0) + (appointmentCounts?.SCHEDULED || 0),
      icon: AlertCircle,
      className: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
      iconClassName: "bg-amber-500 text-white",
      note: "Upcoming appointments",
      link: "/record/appointments",
    },
    {
      title: "Completed",
      value: appointmentCounts?.COMPLETED || 0,
      icon: CheckCircle,
      className: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
      iconClassName: "bg-emerald-500 text-white",
      note: "Successful appointments",
      link: "/record/appointments",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {data?.first_name || user?.firstName}
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your health journey today
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button size="sm" variant="outline" className="border-gray-300 hover:bg-gray-50">
              <Link href="/patient/self" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                View Profile
              </Link>
            </Button>
            <UserButton />
          </div>
        </div>
        
        {/* Current Year Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">{new Date().getFullYear()}</span>
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Appointment Trends</h2>
              <p className="text-gray-600">Your appointment activity over the past months</p>
            </div>
            <div className="h-[400px]">
              <AppointmentChart data={monthlyData || []} />
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <RecentAppointments data={last5Records || []} />
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-8">
          {/* Summary Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <StatSummary data={appointmentCounts || {}} total={totalAppointments || 0} />
          </div>

          {/* Available Doctors */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <AvailableDoctors data={availableDoctor as AvailableDoctorProps} />
          </div>

          {/* Patient Ratings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <PatientRatingContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
