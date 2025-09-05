import { DoctorDashboardContainer } from "@/components/doctor/dashboard/DoctorDashboardContainer";
import { getDoctorDashboardStats } from "@/utils/services/doctor";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const DoctorDashboard = async () => {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  // Get dashboard data
  const {
    totalPatient,
    totalNurses,
    totalAppointment,
    appointmentCounts,
    availableDoctors,
    monthlyData,
    last5Records,
  } = await getDoctorDashboardStats();

  // Transform data to match new interface
  const transformedAppointments = (last5Records || []).map(apt => ({
    ...apt,
    note: apt.note || undefined, // Convert null to undefined
    patient: {
      ...apt.patient,
      email: '', // Add missing email
      phone: '', // Add missing phone
      img: apt.patient.img || undefined, // Convert null to undefined
      colorCode: apt.patient.colorCode || undefined, // Convert null to undefined
    },
    doctor: {
      ...apt.doctor,
      email: '', // Add missing email
      phone: '', // Add missing phone
      address: '', // Add missing address
      img: apt.doctor.img || undefined, // Convert null to undefined
      colorCode: apt.doctor.colorCode || undefined, // Convert null to undefined
      created_at: new Date(), // Add missing created_at
      updated_at: new Date(), // Add missing updated_at
    },
  }));

  const transformedAnalytics = {
    totalPatients: totalPatient || 0,
    totalAppointments: totalAppointment || 0,
    completedAppointments: appointmentCounts?.COMPLETED || 0,
    cancelledAppointments: appointmentCounts?.CANCELLED || 0,
    completionRate: totalAppointment ? (appointmentCounts?.COMPLETED || 0) / totalAppointment * 100 : 0,
    cancellationRate: totalAppointment ? (appointmentCounts?.CANCELLED || 0) / totalAppointment * 100 : 0,
    averageAppointmentDuration: 30,
    appointmentTrends: (monthlyData || []).map(item => ({
      date: new Date(item.name), // Assuming 'name' contains date info
      count: item.appointment,
    })),
  };

  const dashboardData = {
    doctor: {
      id: user.id,
      name: user.firstName || 'Doctor',
      email: user.emailAddresses[0]?.emailAddress || '',
      specialization: 'General Practice', // This should come from doctor profile
      department: 'General Medicine',
      phone: '',
      address: '',
      img: user.imageUrl,
      colorCode: '#3b82f6',
      availability_status: 'AVAILABLE',
      working_days: [],
      created_at: new Date(),
      updated_at: new Date(),
    },
    appointments: transformedAppointments,
    patients: [], // This should be fetched from a separate API
    analytics: transformedAnalytics,
  };

  return (
    <DoctorDashboardContainer
      doctor={dashboardData.doctor}
      appointments={dashboardData.appointments}
      patients={dashboardData.patients}
      analytics={dashboardData.analytics}
    />
  );
};

export default DoctorDashboard;
