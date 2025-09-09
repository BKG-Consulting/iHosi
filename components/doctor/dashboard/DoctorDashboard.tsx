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
  FileText,
  Settings,
  Search,
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
import { AppointmentCalendar } from '@/components/scheduling/AppointmentCalendar';
import { useScheduling } from '@/hooks/useScheduling';
import { CreateAppointmentRequest, UpdateAppointmentRequest } from '@/types/scheduling';
import { AvailabilityToggle } from '@/components/doctor/availability-toggle';
import { EnhancedAppointmentRequests } from '@/components/doctor/enhanced-appointment-requests';
import { RealTimeNotifications } from '@/components/doctor/real-time-notifications';
import { ScheduleSetup } from '@/components/doctor/schedule-setup/ScheduleSetup';
import { AppointmentSkeleton } from '@/components/doctor/appointment-skeleton';
import { PatientList } from '@/components/doctor/patient-list';

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
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  img?: string;
  colorCode?: string;
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
  note?: string;
  reason?: string;
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
  const [currentAppointments, setCurrentAppointments] = useState<Appointment[]>(appointments);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  
  // Initialize scheduling hook
  const {
    appointments: schedulingAppointments,
    isLoading: schedulingLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    loadAppointments,
  } = useScheduling({
    doctorId: doctor.id,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const response = await fetch(`/api/scheduling/appointments?doctorId=${doctor.id}&page=1&limit=50`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform the data to match the expected format
          const transformedAppointments = result.data.appointments.map((apt: any) => ({
            id: apt.id,
            patient_id: apt.patientId,
            doctor_id: apt.doctorId,
            appointment_date: apt.appointmentDate,
            time: apt.time,
            status: apt.status,
            type: apt.type,
            note: apt.note,
            reason: apt.reason,
            service_id: apt.serviceId,
            calendar_event_id: apt.calendarEventId,
            calendar_synced_at: apt.calendarSyncedAt,
            created_at: apt.created_at,
            updated_at: apt.updated_at,
            patient: {
              id: apt.patient.id,
              first_name: apt.patient.first_name,
              last_name: apt.patient.last_name,
              email: apt.patient.email || '',
              phone: apt.patient.phone || '',
              img: apt.patient.img,
              colorCode: apt.patient.colorCode,
            },
            doctor: {
              id: apt.doctor.id,
              name: apt.doctor.name,
              specialization: apt.doctor.specialization,
              img: apt.doctor.img,
              colorCode: apt.doctor.colorCode,
            },
            service: apt.service ? {
              id: apt.service.id,
              service_name: apt.service.service_name,
              duration_minutes: apt.service.duration_minutes,
              price: apt.service.price,
            } : undefined,
          }));
          console.log('📅 Fetched appointments:', transformedAppointments);
          setCurrentAppointments(transformedAppointments);
        } else {
          console.log('❌ No appointments data in response:', result);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // Refresh appointments when tab changes to appointments
  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab, doctor.id]);

  // Listen for appointment scheduled events
  useEffect(() => {
    const handleAppointmentScheduled = () => {
      fetchAppointments();
    };

    window.addEventListener('appointmentScheduled', handleAppointmentScheduled);
    return () => {
      window.removeEventListener('appointmentScheduled', handleAppointmentScheduled);
    };
  }, []);

  // Get today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = schedulingAppointments.filter(apt => 
    new Date(apt.appointmentDate).toISOString().split('T')[0] === today
  );

  // Get next appointment
  const nextAppointment = todayAppointments
    .filter(apt => apt.status === 'SCHEDULED')
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  // Filter appointments based on search and status
  const filteredAppointments = currentAppointments.filter(apt => {
    const matchesSearch = searchTerm === '' || 
      `${apt.patient.first_name} ${apt.patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Debug logging
  console.log('🔍 Current appointments:', currentAppointments.length);
  console.log('🔍 Filtered appointments:', filteredAppointments.length);
  console.log('🔍 Status filter:', statusFilter);
  console.log('🔍 Search term:', searchTerm);

  // Handle appointment actions
  const handleAppointmentCreate = async (appointment: CreateAppointmentRequest) => {
    try {
      await createAppointment(appointment);
      await loadAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleAppointmentUpdate = async (appointment: UpdateAppointmentRequest) => {
    try {
      await updateAppointment(appointment);
      await loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleAppointmentDelete = async (appointmentId: number) => {
    try {
      await deleteAppointment(appointmentId);
      await loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const handleAppointmentClick = (appointment: any) => {
    // Handle appointment click - could open details modal
    console.log('Appointment clicked:', appointment);
  };

  const handleTimeSlotClick = (timeSlot: any, date: Date) => {
    // Handle time slot click - could open create appointment form
    console.log('Time slot clicked:', timeSlot, date);
  };

  const handleAvailabilityToggle = () => {
    setIsAvailable(!isAvailable);
    // Note: Availability status should be updated in database
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">D</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Doctor Dashboard
              </h1>
              <p className="text-slate-600 text-lg">Welcome back, Dr. {doctor.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-[#046658]/10 text-[#046658] text-sm font-medium rounded-full">
                  {doctor.specialization}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 text-sm">{doctor.department}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <RealTimeNotifications 
              doctorId={doctor.id}
              doctorName={doctor.name}
              doctorEmail={doctor.email}
            />
            <Button
              onClick={handleAvailabilityToggle}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg",
                isAvailable 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200" 
                  : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200"
              )}
            >
              {isAvailable ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isAvailable ? 'Available' : 'Unavailable'}
            </Button>
            <Button variant="outline" className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Today's Appointments</p>
                  <p className="text-3xl font-bold text-slate-800">{todayAppointments.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Scheduled for today</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-emerald-600">{analytics.completedAppointments}</p>
                  <p className="text-xs text-slate-500 mt-1">This month</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-[#046658]">{analytics.totalPatients}</p>
                  <p className="text-xs text-slate-500 mt-1">Under your care</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.completionRate.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500 mt-1">Success rate</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Appointment Alert */}
        {nextAppointment && (
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-0 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Next Appointment</h3>
                    <p className="text-slate-200 text-lg">
                      {nextAppointment.patient.first_name} {nextAppointment.patient.last_name} at {nextAppointment.time}
                    </p>
                    <p className="text-sm text-slate-300">{nextAppointment.type} • {nextAppointment.reason}</p>
                  </div>
                </div>
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200"
            >
              Requests
            </TabsTrigger>
            <TabsTrigger 
              value="scheduling" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200"
            >
              Scheduling
            </TabsTrigger>
            <TabsTrigger 
              value="schedule-setup" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200"
            >
              Schedule Setup
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200"
            >
              Patients
            </TabsTrigger>
            <TabsTrigger 
              value="records" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200"
            >
              Medical Records
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Availability Toggle */}
              <div className="lg:col-span-1">
                <AvailabilityToggle 
                  doctorId={doctor.id} 
                  currentStatus={doctor.availability_status || 'AVAILABLE'}
                  onStatusChange={(status) => {
                    // Update local state if needed
                    console.log('Availability changed to:', status);
                  }}
                />
              </div>
              
              {/* Today's Schedule */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-2xl">
                    <CardTitle className="text-xl font-bold text-slate-800">Today's Schedule</CardTitle>
                    <CardDescription className="text-slate-600">
                      {todayAppointments.length} appointments scheduled for today
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {todayAppointments.slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 ring-2 ring-white">
                              <AvatarImage src={appointment.patient.img} />
                              <AvatarFallback className="bg-gradient-to-br from-[#046658] to-[#2EB6B0] text-white font-semibold">
                                {appointment.patient.first_name[0]}{appointment.patient.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {appointment.patient.first_name} {appointment.patient.last_name}
                              </p>
                              <p className="text-sm text-slate-600">{appointment.time} • {appointment.type}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </Badge>
                        </div>
                      ))}
                      {todayAppointments.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-medium">No appointments scheduled for today</p>
                          <p className="text-sm text-slate-500 mt-1">Your schedule is clear</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-2xl">
                    <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
                    <CardDescription className="text-slate-600">
                      Common tasks and shortcuts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="h-20 flex flex-col gap-2 bg-slate-800 hover:bg-slate-700 text-white shadow-lg">
                        <FileText className="w-6 h-6" />
                        <span className="text-sm font-medium">New Patient</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                        <Search className="w-6 h-6" />
                        <span className="text-sm font-medium">Search Patient</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                        <Calendar className="w-6 h-6" />
                        <span className="text-sm font-medium">Schedule</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                        <Activity className="w-6 h-6" />
                        <span className="text-sm font-medium">Vital Signs</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Appointments</CardTitle>
                    <CardDescription className="text-slate-600">
                      Manage your daily schedule and patient appointments
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 border-slate-200 rounded-xl focus:border-slate-400 focus:ring-slate-400"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-slate-400 bg-white text-slate-700"
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                    <Button
                      onClick={fetchAppointments}
                      disabled={isLoadingAppointments}
                      variant="outline"
                      size="sm"
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingAppointments ? (
                  <AppointmentSkeleton />
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Appointments Found</h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                          {currentAppointments.length === 0 
                            ? "You don't have any appointments yet. They will appear here once scheduled." 
                            : "No appointments match your current filters. Try adjusting your search criteria."}
                        </p>
                        {currentAppointments.length === 0 && (
                          <Button 
                            onClick={fetchAppointments}
                            className="bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            Refresh Appointments
                          </Button>
                        )}
                      </div>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 group">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 ring-2 ring-slate-100">
                              <AvatarImage src={appointment.patient.img} />
                              <AvatarFallback className="bg-gradient-to-br from-[#046658] to-[#2EB6B0] text-white font-semibold">
                                {appointment.patient.first_name[0]}{appointment.patient.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-slate-800 text-lg group-hover:text-[#046658] transition-colors">
                                {appointment.patient.first_name} {appointment.patient.last_name}
                              </h3>
                              <p className="text-slate-600">{appointment.time} • {appointment.type}</p>
                              {appointment.reason && (
                                <p className="text-sm text-[#046658] mt-1 font-medium">{appointment.reason}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status}</span>
                            </Badge>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <EnhancedAppointmentRequests doctorId={doctor.id} />
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            <AppointmentCalendar
              doctorId={doctor.id}
              appointments={schedulingAppointments}
              onAppointmentCreate={handleAppointmentCreate}
              onAppointmentUpdate={handleAppointmentUpdate}
              onAppointmentDelete={handleAppointmentDelete}
              onAppointmentClick={handleAppointmentClick}
              onTimeSlotClick={handleTimeSlotClick}
              isLoading={schedulingLoading}
            />
          </TabsContent>

          {/* Schedule Setup Tab */}
          <TabsContent value="schedule-setup" className="space-y-6">
            <ScheduleSetup 
              doctorId={doctor.id}
              onScheduleUpdate={(schedule) => {
                console.log('Schedule updated:', schedule);
                // Handle schedule update
              }}
            />
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-2xl">
                <CardTitle className="text-2xl font-bold text-slate-800">My Patients</CardTitle>
                <CardDescription className="text-slate-600">
                  Patients you are actively engaged with through appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <PatientList doctorId={doctor.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-2xl">
                <CardTitle className="text-2xl font-bold text-slate-800">Medical Records</CardTitle>
                <CardDescription className="text-slate-600">
                  Access and manage patient medical records
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Medical Records</h3>
                  <p className="text-slate-600 max-w-md mx-auto">This feature will be implemented in the next phase. You'll have access to comprehensive patient medical records and documentation.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
