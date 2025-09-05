"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard';
import { doctorDashboardService } from '@/services/doctor-dashboard-service';
import { OverviewTab } from './tabs/OverviewTab';
import { DashboardProps } from '@/types/doctor-dashboard';

export const DoctorDashboardContainer: React.FC<Omit<DashboardProps, 'onTabChange' | 'onAlertAction' | 'onAppointmentAction'>> = ({
  doctor,
  appointments,
  patients,
  analytics,
}) => {
  const {
    activeTab,
    urgentAlerts,
    patientAlerts,
    todaySchedule,
    isLoading,
    error,
    setActiveTab,
    markAlertAsRead,
    resolvePatientAlert,
    refreshDashboard,
  } = useDoctorDashboard({
    doctorId: doctor.id,
    initialAppointments: appointments,
  });

  // Get next appointment
  const nextAppointment = todaySchedule
    .filter(apt => {
      const now = new Date();
      const appointmentTime = new Date(`${apt.appointment_date}T${apt.time}`);
      return appointmentTime > now && apt.status === 'SCHEDULED';
    })
    .sort((a, b) => {
      const timeA = new Date(`${a.appointment_date}T${a.time}`);
      const timeB = new Date(`${b.appointment_date}T${b.time}`);
      return timeA.getTime() - timeB.getTime();
    })[0] || null;

  // Event handlers
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log('Tab changed to:', tabId);
  };

  const handleMarkAlertAsRead = async (alertId: number) => {
    try {
      await doctorDashboardService.markAlertAsRead(alertId);
      markAlertAsRead(alertId);
      console.log('Alert action:', alertId, 'mark_read');
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleDismissAlert = async (alertId: number) => {
    try {
      // In a real app, this would call an API to dismiss the alert
      markAlertAsRead(alertId);
      console.log('Alert action:', alertId, 'dismiss');
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const handleViewAlertDetails = (alertId: number) => {
    console.log('Alert action:', alertId, 'view_details');
  };

  const handleViewAppointment = (appointmentId: number) => {
    console.log('Appointment action:', appointmentId, 'view');
  };

  const handleMessagePatient = async (patientId: string) => {
    try {
      // In a real app, this would open a messaging interface
      console.log('Messaging patient:', patientId);
    } catch (error) {
      console.error('Failed to message patient:', error);
    }
  };

  const handleVideoCall = async (patientId: string) => {
    try {
      const { roomId, token } = await doctorDashboardService.startVideoCall(patientId);
      // In a real app, this would open a video call interface
      console.log('Starting video call:', { roomId, token });
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  };

  const handleCallPatient = (patientId: string) => {
    // In a real app, this would initiate a phone call
    console.log('Calling patient:', patientId);
  };

  const handleViewAppointmentDetails = (appointmentId: number) => {
    console.log('Appointment action:', appointmentId, 'view_details');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refreshDashboard} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Good {getGreeting()}, Dr. {doctor.name}
            </h1>
            <p className="text-gray-600">
              {doctor.specialization} • {doctor.department || 'General Practice'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab
            doctor={doctor}
            appointments={appointments}
            patients={patients}
            analytics={analytics}
            urgentAlerts={urgentAlerts}
            patientAlerts={patientAlerts}
            todaySchedule={todaySchedule}
            nextAppointment={nextAppointment}
            onMarkAlertAsRead={handleMarkAlertAsRead}
            onDismissAlert={handleDismissAlert}
            onViewAlertDetails={handleViewAlertDetails}
            onViewAppointment={handleViewAppointment}
            onMessagePatient={handleMessagePatient}
            onVideoCall={handleVideoCall}
            onCallPatient={handleCallPatient}
            onViewAppointmentDetails={handleViewAppointmentDetails}
          />
        </TabsContent>


        <TabsContent value="patients" className="space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Patient Management</h2>
            <p className="text-gray-600">Patient management features will be implemented here</p>
          </div>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Clinical Tools</h2>
            <p className="text-gray-600">Clinical tools will be implemented here</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Analytics & Reports</h2>
            <p className="text-gray-600">Analytics and reporting features will be implemented here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};
