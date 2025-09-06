'use client';

import React, { useState, useEffect } from 'react';
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
  Stethoscope,
  FileText,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Pause,
  Play
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  department: string;
  phone: string;
  address: string;
  img?: string | undefined;
  colorCode?: string | undefined;
  availability_status: string;
  working_days: any[];
  created_at: Date;
  updated_at: Date;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  img?: string | undefined;
  colorCode?: string | undefined;
  medical_conditions?: string;
  allergies?: string;
}

interface Appointment {
  id: number;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  time: string;
  status: 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  type: string;
  note?: string | undefined;
  reason?: string | undefined;
  patient: Patient;
  doctor: Doctor;
}

interface DashboardProps {
  doctor: Doctor;
  appointments: Appointment[];
  patients: Patient[];
  analytics: {
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    completionRate: number;
    cancellationRate: number;
    averageAppointmentDuration: number;
    appointmentTrends: Array<{ date: Date; count: number }>;
  };
}

export const DoctorDashboard: React.FC<DashboardProps> = ({
  doctor,
  appointments,
  patients,
  analytics
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAvailable, setIsAvailable] = useState(doctor.availability_status === 'AVAILABLE');

  // Get today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => 
    apt.appointment_date.split('T')[0] === today
  );

  // Get next appointment
  const nextAppointment = todayAppointments
    .filter(apt => apt.status === 'SCHEDULED')
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  // Filter appointments based on search and status
  const filteredAppointments = todayAppointments.filter(apt => {
    const matchesSearch = searchTerm === '' || 
      `${apt.patient.first_name} ${apt.patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAvailabilityToggle = () => {
    setIsAvailable(!isAvailable);
    // TODO: Update doctor availability status in database
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#046658]">Doctor Dashboard</h1>
              <p className="text-[#3E4C4B]">Welcome back, Dr. {doctor.name}</p>
              <p className="text-sm text-[#2EB6B0]">{doctor.specialization} • {doctor.department}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAvailabilityToggle}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200",
                isAvailable 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {isAvailable ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isAvailable ? 'Available' : 'Unavailable'}
            </Button>
            <Button variant="outline" className="border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Today's Appointments</p>
                  <p className="text-3xl font-bold text-[#046658]">{todayAppointments.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.completedAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Total Patients</p>
                  <p className="text-3xl font-bold text-[#2EB6B0]">{analytics.totalPatients}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Completion Rate</p>
                  <p className="text-3xl font-bold text-[#046658]">{analytics.completionRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Appointment Alert */}
        {nextAppointment && (
          <Card className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] border-0 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Next Appointment</h3>
                    <p className="text-white/90">
                      {nextAppointment.patient.first_name} {nextAppointment.patient.last_name} at {nextAppointment.time}
                    </p>
                    <p className="text-sm text-white/80">{nextAppointment.type} • {nextAppointment.reason}</p>
                  </div>
                </div>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl p-2">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
            >
              Patients
            </TabsTrigger>
            <TabsTrigger 
              value="records" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
            >
              Medical Records
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
                  <CardTitle className="text-xl font-bold">Today's Schedule</CardTitle>
                  <CardDescription className="text-white/90">
                    {todayAppointments.length} appointments scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {todayAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={appointment.patient.img} />
                            <AvatarFallback className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white">
                              {appointment.patient.first_name[0]}{appointment.patient.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-[#046658]">
                              {appointment.patient.first_name} {appointment.patient.last_name}
                            </p>
                            <p className="text-sm text-[#3E4C4B]">{appointment.time} • {appointment.type}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{appointment.status}</span>
                        </Badge>
                      </div>
                    ))}
                    {todayAppointments.length === 0 && (
                      <div className="text-center py-8 text-[#3E4C4B]">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-[#2EB6B0]" />
                        <p>No appointments scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
                  <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                  <CardDescription className="text-white/90">
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex flex-col gap-2 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white">
                      <FileText className="w-6 h-6" />
                      <span className="text-sm">New Patient</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                      <Search className="w-6 h-6" />
                      <span className="text-sm">Search Patient</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                      <Calendar className="w-6 h-6" />
                      <span className="text-sm">Schedule</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                      <Activity className="w-6 h-6" />
                      <span className="text-sm">Vital Signs</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Today's Appointments</CardTitle>
                    <CardDescription className="text-white/90">
                      Manage your daily schedule
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-4 h-4" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appointment.patient.img} />
                          <AvatarFallback className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white">
                            {appointment.patient.first_name[0]}{appointment.patient.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-[#046658] text-lg">
                            {appointment.patient.first_name} {appointment.patient.last_name}
                          </h3>
                          <p className="text-[#3E4C4B]">{appointment.time} • {appointment.type}</p>
                          {appointment.reason && (
                            <p className="text-sm text-[#2EB6B0] mt-1">{appointment.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{appointment.status}</span>
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <div className="text-center py-12 text-[#3E4C4B]">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-[#2EB6B0]" />
                      <p className="text-lg font-medium">No appointments found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
                <CardTitle className="text-xl font-bold">Patient Management</CardTitle>
                <CardDescription className="text-white/90">
                  View and manage your patients
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-[#3E4C4B]">
                  <Users className="w-16 h-16 mx-auto mb-4 text-[#2EB6B0]" />
                  <p className="text-lg font-medium">Patient Management</p>
                  <p className="text-sm">This feature will be implemented in the next phase</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
                <CardTitle className="text-xl font-bold">Medical Records</CardTitle>
                <CardDescription className="text-white/90">
                  Access and manage patient medical records
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-[#3E4C4B]">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-[#2EB6B0]" />
                  <p className="text-lg font-medium">Medical Records</p>
                  <p className="text-sm">This feature will be implemented in the next phase</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
