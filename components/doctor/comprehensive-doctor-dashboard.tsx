'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  Activity, 
  Search,
  Eye,
  Brain,
  Plus,
  Settings,
  Stethoscope,
  TrendingUp,
  BarChart3,
  UserPlus,
  FileSearch,
  TestTube,
  Scan,
  PillBottle,
  MessageCircle,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  FileText as FileTextIcon,
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { EnhancedSmartScheduler } from './enhanced-smart-scheduler';
import { TypeScriptScheduleSetup } from './typescript-schedule-setup';
import { Appointment } from '@/types/schedule-types';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  department: string;
  phone: string;
  address: string;
  img?: string;
  colorCode?: string;
  availability_status: string;
  working_days: any[];
  created_at: Date;
  updated_at: Date;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  img?: string;
  date_of_birth: string;
  colorCode?: string;
}

interface Analytics {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
  cancellationRate: number;
  averageAppointmentDuration: number;
  appointmentTrends: Array<{
    date: Date;
    count: number;
  }>;
}

interface ComprehensiveDoctorDashboardProps {
  readonly doctor: Doctor;
  readonly appointments: Appointment[];
  readonly patients: Patient[];
  readonly analytics: Analytics;
}

export function ComprehensiveDoctorDashboard({
  doctor,
  appointments,
  patients,
  analytics
}: ComprehensiveDoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isAvailable, setIsAvailable] = useState(doctor.availability_status === 'AVAILABLE');
  
  // Sync availability state when doctor prop changes
  useEffect(() => {
    const shouldBeAvailable = doctor.availability_status === 'AVAILABLE';
    console.log('🔄 Syncing availability state:', {
      doctorId: doctor.id,
      availabilityStatus: doctor.availability_status,
      currentIsAvailable: isAvailable,
      shouldBeAvailable,
      needsUpdate: isAvailable !== shouldBeAvailable
    });
    
    if (isAvailable !== shouldBeAvailable) {
      console.log('✅ Updating availability state from', isAvailable, 'to', shouldBeAvailable);
      setIsAvailable(shouldBeAvailable);
    }
  }, [doctor.availability_status, isAvailable]);
  
  // Debug initial state
  console.log('🏥 Doctor availability state:', {
    doctorId: doctor.id,
    availabilityStatus: doctor.availability_status,
    isAvailable,
    comparison: doctor.availability_status === 'AVAILABLE',
    shouldBeAvailable: doctor.availability_status === 'AVAILABLE'
  });

  // Debug logging
  console.log('ComprehensiveDoctorDashboard - appointments:', appointments.length);
  console.log('ComprehensiveDoctorDashboard - patients:', patients.length);
  console.log('ComprehensiveDoctorDashboard - doctor ID:', doctor.id);

  const handleAvailabilityToggle = async () => {
    const newStatus = !isAvailable;
    const newAvailabilityStatus = newStatus ? 'AVAILABLE' : 'BUSY';
    
    console.log('🔄 Toggling doctor availability:', {
      doctorId: doctor.id,
      currentStatus: isAvailable,
      newStatus,
      newAvailabilityStatus
    });
    
    setIsAvailable(newStatus);
    
    try {
      const response = await fetch('/api/doctors/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          availability_status: newAvailabilityStatus
        })
      });
      
      const result = await response.json();
      console.log('📡 Availability update response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update availability');
      }
      
      console.log('✅ Availability updated successfully');
    } catch (error) {
      console.error('❌ Failed to update availability:', error);
      setIsAvailable(!newStatus); // Revert on error
    }
  };


  const recentPatients = patients.slice(0, 5);
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date).toDateString() === new Date().toDateString()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, Dr. {doctor.name.split(' ').pop()}
            </h1>
            <p className="text-gray-600 mt-1">
              {doctor.specialization} • {doctor.department}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* AI Toggle */}
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">AI</span>
              <Button
                variant={aiEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`h-8 px-3 text-xs ${aiEnabled ? "bg-purple-600 hover:bg-purple-700" : ""}`}
              >
                {aiEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
            
            {/* Compact Availability Status */}
            <button
              onClick={handleAvailabilityToggle}
              className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${
                isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-gray-600">
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </button>
          </div>
        </div>


        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalPatients}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(analytics.completionRate)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(apt => apt.status === 'PENDING').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Smart Scheduler
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
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
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayAppointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No appointments today</p>
                      </div>
                    ) : (
                      todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg bg-white/50">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.time}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {appointment.patient?.first_name} {appointment.patient?.last_name}
                              </div>
                              <div className="text-sm text-gray-600">{appointment.type}</div>
                            </div>
                          </div>
                          <Badge className={cn("flex items-center gap-1", getStatusColor(appointment.status))}>
                            {appointment.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Patients */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Recent Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={patient.img} />
                          <AvatarFallback>
                            {patient.first_name[0]}{patient.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{patient.phone}</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700">
                    <UserPlus className="h-6 w-6" />
                    <span className="text-sm">New Patient</span>
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-green-50 hover:bg-green-100 text-green-700">
                    <FileSearch className="h-6 w-6" />
                    <span className="text-sm">Search Records</span>
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700">
                    <PillBottle className="h-6 w-6" />
                    <span className="text-sm">Prescriptions</span>
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700">
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-sm">Messages</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <TypeScriptScheduleSetup 
              doctorId={doctor.id} 
              onScheduleUpdate={(schedule) => {
                console.log('Schedule updated:', schedule);
                // Optionally switch to scheduler tab
                // setActiveTab('scheduler');
              }}
            />
          </TabsContent>

          {/* Smart Scheduler Tab */}
          <TabsContent value="scheduler" className="space-y-6">
            <EnhancedSmartScheduler 
              doctorId={doctor.id} 
              appointments={appointments}
            />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5" />
                      All Appointments
                    </CardTitle>
                    <CardDescription>
                      Manage and view all your appointments
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search appointments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Appointment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No appointments found</p>
                    </div>
                  ) : (
                    appointments
                      .filter(appointment => {
                        const patientName = `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.toLowerCase();
                        const doctorName = appointment.doctor?.name || '';
                        const query = searchQuery.toLowerCase();
                        
                        return patientName.includes(query) || 
                               doctorName.includes(query) || 
                               appointment.type.toLowerCase().includes(query);
                      })
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-white/50"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={appointment.patient?.img} />
                              <AvatarFallback>
                                {appointment.patient?.first_name?.[0]}{appointment.patient?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {appointment.patient?.first_name} {appointment.patient?.last_name}
                              </h4>
                              <p className="text-sm text-gray-600">{appointment.type}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.time}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={cn("flex items-center gap-1", getStatusColor(appointment.status))}>
                              {appointment.status}
                            </Badge>
                            
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UsersIcon className="h-5 w-5" />
                      Patient Management
                    </CardTitle>
                    <CardDescription>
                      Manage your patient records and medical history
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Patient
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Patient management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Tab */}
          <TabsContent value="clinical" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Diagnoses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Diagnosis management</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PillBottle className="h-5 w-5" />
                    Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <PillBottle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Prescription management</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Lab Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Lab results management</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5" />
                    Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Medical records management</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="h-5 w-5" />
                    Imaging
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Scan className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Medical imaging management</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round(analytics.completionRate)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cancellation Rate</span>
                    <span className="text-lg font-bold text-red-600">
                      {Math.round(analytics.cancellationRate)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg. Duration</span>
                    <span className="text-lg font-bold text-blue-600">
                      {analytics.averageAppointmentDuration} min
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Patient Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Patient outcome analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
