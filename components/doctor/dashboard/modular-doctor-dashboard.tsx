'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Activity,
  Settings,
  Stethoscope,
  TrendingUp,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react';
import { DashboardHeader } from './dashboard-header';
import { StatCard } from './stat-card';
import { OverviewTab } from './tabs/overview-tab';
import { AppointmentsTab } from './tabs/appointments-tab';
import { PatientsTab } from './tabs/patients-tab';
import { ClinicalTab } from './tabs/clinical-tab';
import { AnalyticsTab } from './tabs/analytics-tab';
import { EnhancedSmartScheduler } from '../enhanced-smart-scheduler';
import { TypeScriptScheduleSetup } from '../typescript-schedule-setup';
import { ModernSchedulingDashboard } from '../scheduling';
import { useAvailabilityToggle } from '@/hooks/use-availability-toggle';
import { useAppointmentFilter } from '@/hooks/use-appointment-filter';
import { Doctor, Patient, Analytics } from '@/types/doctor-dashboard';
import { Appointment } from '@/types/schedule-types';

interface ModularDoctorDashboardProps {
  readonly doctor: Doctor;
  readonly appointments: Appointment[];
  readonly patients: Patient[];
  readonly analytics: Analytics;
}

export function ModularDoctorDashboard({
  doctor,
  appointments,
  patients,
  analytics
}: ModularDoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [aiEnabled, setAiEnabled] = useState(true);
  
  const { isAvailable, toggleAvailability } = useAvailabilityToggle(
    doctor.id, 
    doctor.availability_status
  );
  
  const {
    searchQuery,
    setSearchQuery,
    filteredAppointments,
    todayAppointments
  } = useAppointmentFilter(appointments);

  const recentPatients = patients.slice(0, 5);
  const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader
          doctor={doctor}
          isAvailable={isAvailable}
          aiEnabled={aiEnabled}
          onAvailabilityToggle={toggleAvailability}
          onAiToggle={() => setAiEnabled(!aiEnabled)}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Appointments"
            value={todayAppointments.length}
            icon={Calendar}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Active Patients"
            value={analytics.totalPatients}
            icon={Users}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            title="Completion Rate"
            value={`${Math.round(analytics.completionRate)}%`}
            icon={Activity}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Pending Requests"
            value={pendingAppointments}
            icon={Clock}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center gap-2 relative">
              <Calendar className="h-4 w-4" />
              Scheduling
              <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5">
                New
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="clinical" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Clinical
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Legacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab 
              todayAppointments={todayAppointments}
              recentPatients={recentPatients}
            />
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            <ModernSchedulingDashboard
              doctorId={doctor.id}
              appointments={appointments}
            />
          </TabsContent>

          <TabsContent value="legacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legacy Scheduling Tools</CardTitle>
                <CardDescription>
                  Original scheduling interfaces (kept for reference)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="setup" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="setup">Schedule Setup</TabsTrigger>
                    <TabsTrigger value="scheduler">Smart Scheduler</TabsTrigger>
                  </TabsList>
                  <TabsContent value="setup">
                    <TypeScriptScheduleSetup 
                      doctorId={doctor.id} 
                      onScheduleUpdate={(schedule) => {
                        console.log('Schedule updated:', schedule);
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="scheduler">
                    <EnhancedSmartScheduler 
                      doctorId={doctor.id} 
                      appointments={appointments}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <AppointmentsTab
              appointments={filteredAppointments}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientsTab
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="clinical" className="space-y-6">
            <ClinicalTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab analytics={analytics} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

