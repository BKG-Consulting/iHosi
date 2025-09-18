'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  Activity, 
  AlertCircle, 
  FileText,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Brain,
  Plus,
  Settings
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import DragDropScheduler from './drag-drop-scheduler';
import { ScheduleSetup } from './schedule-setup';

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

interface Appointment {
  id: number;
  patient_id: string;
  type: string;
  appointment_date: string;
  time: string;
  status: string;
  note?: string;
  reason?: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
    img?: string;
    date_of_birth: string;
    colorCode?: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    colorCode?: string;
    img?: string;
  };
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

interface EnhancedDoctorDashboardProps {
  readonly doctor: Doctor;
  readonly appointments: Appointment[];
  readonly patients: Patient[];
  readonly analytics: Analytics;
}

export function EnhancedDoctorDashboard({
  doctor,
  appointments,
  patients,
  analytics
}: EnhancedDoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isAvailable, setIsAvailable] = useState(doctor.availability_status === 'AVAILABLE');

  const handleAvailabilityToggle = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    // Update availability status on the server
    try {
      await fetch('/api/doctors/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          availability_status: newStatus ? 'AVAILABLE' : 'BUSY'
        })
      });
    } catch (error) {
      console.error('Failed to update availability:', error);
      // Revert on error
      setIsAvailable(!newStatus);
    }
  };

  // Filter appointments based on search
  const filteredAppointments = appointments.filter(appointment => {
    const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.toLowerCase();
    const doctorName = appointment.doctor.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return patientName.includes(query) || 
           doctorName.includes(query) || 
           appointment.type.toLowerCase().includes(query);
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'SCHEDULED': return <Calendar className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Activity className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
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
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(apt => 
                      new Date(apt.appointment_date).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
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

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
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
        </div>

        {/* AI Insights Banner */}
        {aiEnabled && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900">AI Scheduling Assistant Active</h3>
                  <p className="text-sm text-purple-700">
                    Your schedule is being optimized with AI. Drag and drop appointments for instant scheduling.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-purple-600">
                  <div className="text-center">
                    <div className="font-bold">94%</div>
                    <div className="text-xs">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">2.3h</div>
                    <div className="text-xs">Time Saved</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Schedule Setup
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Smart Scheduler
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Schedule Setup Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <ScheduleSetup 
              doctorId={doctor.id} 
              onScheduleUpdated={() => {
                // Refresh the scheduler when schedule is updated
                setActiveTab('scheduler');
              }}
            />
          </TabsContent>

          {/* Smart Scheduler Tab */}
          <TabsContent value="scheduler" className="space-y-6">
            <DragDropScheduler doctorId={doctor.id} />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
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
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No appointments found</p>
                    </div>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-white/50"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={appointment.patient.img} />
                            <AvatarFallback>
                              {appointment.patient.first_name[0]}{appointment.patient.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {appointment.patient.first_name} {appointment.patient.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.time}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={cn("flex items-center gap-1", getStatusColor(appointment.status))}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
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
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patients
                </CardTitle>
                <CardDescription>
                  Manage your patient list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Patient management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Chart visualization would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}