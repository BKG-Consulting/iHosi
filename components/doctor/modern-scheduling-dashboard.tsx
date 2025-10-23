'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Users, 
  Activity, 
  Bell, 
  Settings, 
  Search,
  Filter,
  Plus,
  RefreshCw,
  Zap,
  Brain,
  Smartphone,
  Globe,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Video,
  Phone,
  MessageCircle,
  Star,
  Heart,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ModernSchedulingDashboardProps {
  doctorId: string;
  doctorName: string;
  specialization: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  isVirtual: boolean;
  color: string;
  avatar?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
  isBreak: boolean;
  isLunch: boolean;
}

interface ScheduleAnalytics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowRate: number;
  averageWaitTime: number;
  patientSatisfaction: number;
  revenue: number;
  efficiency: number;
}

export function ModernSchedulingDashboard({ 
  doctorId, 
  doctorName, 
  specialization 
}: ModernSchedulingDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [analytics, setAnalytics] = useState<ScheduleAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments();
      fetchAnalytics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedDate]);

  // Initial data load
  useEffect(() => {
    fetchAppointments();
    fetchAnalytics();
    generateTimeSlots();
  }, [selectedDate, doctorId]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/scheduling/appointments?doctorId=${doctorId}&date=${selectedDate.toISOString().split('T')[0]}`);
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/scheduling/analytics?doctorId=${doctorId}&date=${selectedDate.toISOString().split('T')[0]}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const appointment = appointments.find(apt => apt.time === time);
        
        slots.push({
          time,
          available: !appointment,
          appointment,
          isBreak: time === '12:00' || time === '12:30',
          isLunch: time === '12:00' || time === '12:30'
        });
      }
    }
    
    setTimeSlots(slots);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-appointment':
        toast.info('Opening appointment creation dialog...');
        break;
      case 'block-time':
        toast.info('Opening time blocking dialog...');
        break;
      case 'view-analytics':
        toast.info('Opening analytics dashboard...');
        break;
      case 'sync-calendar':
        toast.info('Syncing with external calendar...');
        break;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Scheduling</h1>
            <p className="text-gray-600">Dr. {doctorName} • {specialization}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              isOnline ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-sm text-gray-600">
              {isOnline ? "Live" : "Offline"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAppointments()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2 bg-white hover:bg-blue-50"
                onClick={() => handleQuickAction('add-appointment')}
              >
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Add Appointment</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2 bg-white hover:bg-orange-50"
                onClick={() => handleQuickAction('block-time')}
              >
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Block Time</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2 bg-white hover:bg-green-50"
                onClick={() => handleQuickAction('view-analytics')}
              >
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="text-sm">Analytics</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2 bg-white hover:bg-purple-50"
                onClick={() => handleQuickAction('sync-calendar')}
              >
                <Globe className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Sync Calendar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.completedAppointments}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">No-Show Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.noShowRate}%</p>
                </div>
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.efficiency}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Scheduling Interface */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Time Slots */}
                <div className="lg:col-span-2">
                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                          slot.appointment 
                            ? "bg-white border-gray-200" 
                            : slot.isBreak 
                            ? "bg-orange-50 border-orange-200" 
                            : "bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-gray-900">
                              {slot.time}
                            </div>
                            {slot.isBreak && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-700">
                                Break
                              </Badge>
                            )}
                            {slot.appointment && (
                              <Badge className={getStatusColor(slot.appointment.status)}>
                                {slot.appointment.status}
                              </Badge>
                            )}
                          </div>
                          
                          {slot.appointment && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-700">
                                {slot.appointment.patientName}
                              </div>
                              <div className="flex items-center gap-1">
                                {slot.appointment.isVirtual && (
                                  <Video className="h-4 w-4 text-blue-600" />
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={getPriorityColor(slot.appointment.priority)}
                                >
                                  {slot.appointment.priority}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                  {/* AI Suggestions */}
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Brain className="h-5 w-5" />
                        AI Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Optimization Tip</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Consider adding a 15-minute buffer between virtual appointments for better patient experience.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Trend Alert</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Your 2:00 PM slot has a 85% no-show rate. Consider sending reminder notifications.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Appointments</span>
                        <span className="font-semibold">{appointments.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-semibold text-green-600">
                          {appointments.filter(apt => apt.status === 'completed').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-semibold text-blue-600">
                          {appointments.filter(apt => apt.status === 'scheduled').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Virtual</span>
                        <span className="font-semibold text-purple-600">
                          {appointments.filter(apt => apt.isVirtual).length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments List View */}
        <TabsContent value="list" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointments</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments
                  .filter(apt => 
                    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    apt.type.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.time}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {appointment.type}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                            {appointment.priority}
                          </Badge>
                          {appointment.isVirtual && (
                            <Video className="h-4 w-4 text-blue-600" />
                          )}
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Appointment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Analytics chart will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Patient Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-3/4 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Wait Time</span>
                    <span className="text-sm font-medium">12 min</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue Today</span>
                    <span className="text-sm font-medium text-green-600">$2,450</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings View */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Scheduling Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">AI-Powered Scheduling</h3>
                  <p className="text-sm text-gray-600">Enable intelligent scheduling suggestions</p>
                </div>
                <Button
                  variant={aiEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAiEnabled(!aiEnabled)}
                >
                  {aiEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Real-time Notifications</h3>
                  <p className="text-sm text-gray-600">Get instant updates for schedule changes</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Calendar Integration</h3>
                  <p className="text-sm text-gray-600">Sync with external calendars</p>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


