import { DoctorDashboard as DoctorDashboardComponent } from "@/components/doctor/dashboard/DoctorDashboard";
import { getDoctorDashboardStats } from "@/utils/services/doctor";
import { redirect } from "next/navigation";
import React from "react";
import { HIPAAAuthService } from "@/lib/auth/hipaa-auth";
import { cookies } from "next/headers";

const DoctorDashboard = async () => {
  // Get user from our custom authentication system
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect("/sign-in");
  }

  const sessionResult = await HIPAAAuthService.verifySession(token);
  
  if (!sessionResult.valid || !sessionResult.user) {
    redirect("/sign-in");
  }

  const user = sessionResult.user;

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
  const transformedAppointments: any[] = (last5Records || []).map(apt => ({
    ...apt,
    appointment_date: apt.appointment_date instanceof Date ? apt.appointment_date.toISOString() : apt.appointment_date,
    note: apt.note || undefined, // Convert null to undefined
    reason: apt.reason || undefined, // Convert null to undefined
    patient: {
      ...apt.patient,
      date_of_birth: apt.patient.date_of_birth instanceof Date ? apt.patient.date_of_birth.toISOString() : apt.patient.date_of_birth,
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
      email: user.email || '',
      specialization: 'General Practice', // This should come from doctor profile
      department: 'General Medicine',
      phone: '',
      address: '',
      img: undefined, // No image in our custom user object
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
    <DoctorDashboardComponent
      doctor={dashboardData.doctor}
      appointments={dashboardData.appointments}
      patients={dashboardData.patients}
      analytics={dashboardData.analytics}
    />
  );
};

export default DoctorDashboard;
