import { ComprehensiveDoctorDashboard } from "@/components/doctor/comprehensive-doctor-dashboard";
import { getDoctorDashboardStats } from "@/utils/services/doctor";
import { redirect } from "next/navigation";
import React from "react";
import { verifyAuth } from "@/lib/auth/auth-helper";
import db from "@/lib/db";

const DoctorDashboard = async () => {
  // Get user from our custom authentication system using centralized helper
  const authResult = await verifyAuth();
  
  if (!authResult.isValid || !authResult.user) {
    redirect("/sign-in");
  }

  const user = authResult.user;

  // Get dashboard data
  const {
    totalPatient,
    totalNurses,
    totalAppointment,
    appointmentCounts,
    availableDoctors,
    monthlyData,
    last5Records,
    allAppointments,
    patients,
  } = await getDoctorDashboardStats();

  // Fetch the actual doctor data from database to get real availability status
  const actualDoctor = await db.doctor.findUnique({
    where: { id: user.id },
    include: {
      working_days: true
    }
  });

  console.log('🏥 ACTUAL DOCTOR DATA FROM DATABASE:', {
    id: actualDoctor?.id,
    name: actualDoctor?.name,
    availability_status: actualDoctor?.availability_status,
    working_days_count: actualDoctor?.working_days?.length || 0
  });

  // Debug logging
  console.log('Doctor page - allAppointments:', allAppointments?.length || 0);
  console.log('Doctor page - patients:', patients?.length || 0);
  console.log('Doctor page - user ID:', user.id);

  // Transform data to match new interface - use ALL appointments, not just last 5
  const transformedAppointments: any[] = (allAppointments || []).map((apt: any) => ({
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
      id: actualDoctor?.id || user.id,
      name: actualDoctor?.name || user.firstName || 'Doctor',
      email: actualDoctor?.email || user.email || '',
      specialization: actualDoctor?.specialization || 'General Practice',
      department: actualDoctor?.department || 'General Medicine',
      phone: actualDoctor?.phone || '',
      address: actualDoctor?.address || '',
      img: actualDoctor?.img || undefined,
      colorCode: actualDoctor?.colorCode || '#3b82f6',
      availability_status: actualDoctor?.availability_status || 'AVAILABLE', // Use real database value
      working_days: actualDoctor?.working_days || [],
      created_at: actualDoctor?.created_at || new Date(),
      updated_at: actualDoctor?.updated_at || new Date(),
    },
    appointments: transformedAppointments,
    patients: patients || [], // Use patients from appointments
    analytics: transformedAnalytics,
  };

    return (
      <ComprehensiveDoctorDashboard
        doctor={dashboardData.doctor}
        appointments={dashboardData.appointments}
        patients={dashboardData.patients}
        analytics={dashboardData.analytics}
      />
    );
};

export default DoctorDashboard;
