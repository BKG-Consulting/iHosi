'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Edit,
  Copy,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Coffee,
  Moon,
  Sun,
  Zap,
  Users,
  Timer,
  Repeat,
  MapPin,
  Phone,
  Mail,
  Star
} from 'lucide-react';
import { ScheduleExport } from './ScheduleExport';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WorkingHours {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments?: number;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  workingHours: WorkingHours[];
  appointmentDuration: number;
  bufferTime: number;
  isDefault: boolean;
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'CONFERENCE' | 'OTHER';
}

interface ScheduleSetupProps {
  doctorId: string;
  onScheduleUpdate?: (schedule: any) => void;
}

export const ScheduleSetup: React.FC<ScheduleSetupProps> = ({
  doctorId,
  onScheduleUpdate
}) => {
  const [activeTab, setActiveTab] = useState('working-hours');
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', maxAppointments: 20 },
    { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', maxAppointments: 20 },
    { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', maxAppointments: 20 },
    { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', maxAppointments: 20 },
    { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', maxAppointments: 20 },
    { day: 'Saturday', isWorking: false, startTime: '09:00', endTime: '13:00', maxAppointments: 10 },
    { day: 'Sunday', isWorking: false, startTime: '09:00', endTime: '13:00', maxAppointments: 5 },
  ]);
  
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([
    {
      id: 'default',
      name: 'Standard Schedule',
      description: 'Regular 9-5 schedule with lunch break',
      workingHours: workingHours,
      appointmentDuration: 30,
      bufferTime: 5,
      isDefault: true
    }
  ]);
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleWorkingHoursChange = (day: string, field: keyof WorkingHours, value: any) => {
    setWorkingHours(prev => prev.map(dayHours => 
      dayHours.day === day ? { ...dayHours, [field]: value } : dayHours
    ));
  };

  const handleSaveSchedule = async () => {
    setIsLoading(true);
    try {
      // Call the actual API to save the schedule
      const response = await fetch(`/api/doctors/${doctorId}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          workingHours,
          appointmentDuration,
          bufferTime,
          templates
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save schedule');
      }
      
      toast.success('Schedule saved successfully!');
      onScheduleUpdate?.({
        workingHours,
        appointmentDuration,
        bufferTime,
        templates
      });
    } catch (error) {
      toast.error('Failed to save schedule');
      console.error('Error saving schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplate = () => {
    const newTemplate: ScheduleTemplate = {
      id: `template-${Date.now()}`,
      name: `Template ${templates.length + 1}`,
      description: 'Custom schedule template',
      workingHours: [...workingHours],
      appointmentDuration,
      bufferTime,
      isDefault: false
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleApplyTemplate = (template: ScheduleTemplate) => {
    setWorkingHours(template.workingHours);
    setAppointmentDuration(template.appointmentDuration);
    setBufferTime(template.bufferTime);
    toast.success(`Applied template: ${template.name}`);
  };

  const handleAddLeaveRequest = async () => {
    try {
      const newLeave: LeaveRequest = {
        id: `leave-${Date.now()}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        status: 'PENDING',
        type: 'VACATION'
      };
      
      // Save to database
      const response = await fetch(`/api/doctors/${doctorId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          startDate: newLeave.startDate,
          endDate: newLeave.endDate,
          reason: newLeave.reason,
          type: newLeave.type
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create leave request');
      }

      setLeaveRequests(prev => [...prev, result.data]);
      toast.success('Leave request created successfully!');
    } catch (error) {
      toast.error('Failed to create leave request');
      console.error('Error creating leave request:', error);
    }
  };

  const getDayIcon = (day: string) => {
    switch (day) {
      case 'Monday': return <Sun className="w-4 h-4" />;
      case 'Tuesday': return <Zap className="w-4 h-4" />;
      case 'Wednesday': return <Users className="w-4 h-4" />;
      case 'Thursday': return <Timer className="w-4 h-4" />;
      case 'Friday': return <Star className="w-4 h-4" />;
      case 'Saturday': return <Coffee className="w-4 h-4" />;
      case 'Sunday': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#046658]">Schedule Setup</h2>
          <p className="text-[#3E4C4B]">Configure your working hours, breaks, and availability</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            onClick={handleSaveSchedule}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border-0 rounded-2xl p-2">
          <TabsTrigger 
            value="working-hours" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
          >
            <Clock className="w-4 h-4 mr-2" />
            Working Hours
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
          >
            <Copy className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="leave" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Leave Management
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
          >
            <Users className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="export" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Working Hours Tab */}
        <TabsContent value="working-hours" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
              <CardTitle className="text-xl font-bold">Weekly Schedule</CardTitle>
              <CardDescription className="text-white/90">
                Set your working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {workingHours.map((dayHours, index) => (
                  <div key={dayHours.day} className="p-6 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getDayIcon(dayHours.day)}
                        <h3 className="text-lg font-semibold text-[#046658]">{dayHours.day}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`working-${index}`} className="text-sm font-medium text-[#3E4C4B]">
                          Working
                        </Label>
                        <Switch
                          id={`working-${index}`}
                          checked={dayHours.isWorking}
                          onCheckedChange={(checked) => handleWorkingHoursChange(dayHours.day, 'isWorking', checked)}
                        />
                      </div>
                    </div>

                    {dayHours.isWorking && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-[#3E4C4B]">Start Time</Label>
                          <Input
                            type="time"
                            value={dayHours.startTime}
                            onChange={(e) => handleWorkingHoursChange(dayHours.day, 'startTime', e.target.value)}
                            className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-[#3E4C4B]">End Time</Label>
                          <Input
                            type="time"
                            value={dayHours.endTime}
                            onChange={(e) => handleWorkingHoursChange(dayHours.day, 'endTime', e.target.value)}
                            className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-[#3E4C4B]">Break Start</Label>
                          <Input
                            type="time"
                            value={dayHours.breakStart || ''}
                            onChange={(e) => handleWorkingHoursChange(dayHours.day, 'breakStart', e.target.value)}
                            className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-[#3E4C4B]">Break End</Label>
                          <Input
                            type="time"
                            value={dayHours.breakEnd || ''}
                            onChange={(e) => handleWorkingHoursChange(dayHours.day, 'breakEnd', e.target.value)}
                            className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
                          />
                        </div>
                        <div className="md:col-span-2 lg:col-span-4">
                          <Label className="text-sm font-medium text-[#3E4C4B]">Max Appointments</Label>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={dayHours.maxAppointments || 20}
                            onChange={(e) => handleWorkingHoursChange(dayHours.day, 'maxAppointments', parseInt(e.target.value))}
                            className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#046658]">Schedule Templates</h3>
              <p className="text-[#3E4C4B]">Create and manage different schedule configurations</p>
            </div>
            <Button 
              onClick={handleAddTemplate}
              className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
                    {template.isDefault && (
                      <Badge className="bg-white/20 text-white border-white/30">
                        Default
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-white/90">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#3E4C4B]">Appointment Duration:</span>
                      <span className="font-semibold text-[#046658]">{template.appointmentDuration} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#3E4C4B]">Buffer Time:</span>
                      <span className="font-semibold text-[#046658]">{template.bufferTime} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#3E4C4B]">Working Days:</span>
                      <span className="font-semibold text-[#046658]">
                        {template.workingHours.filter(h => h.isWorking).length}/7
                      </span>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleApplyTemplate(template)}
                        className="flex-1 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
                      >
                        Apply
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
              <CardTitle className="text-xl font-bold">Appointment Settings</CardTitle>
              <CardDescription className="text-white/90">
                Configure default appointment durations and buffer times
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-[#3E4C4B]">Default Appointment Duration (minutes)</Label>
                  <Select value={appointmentDuration.toString()} onValueChange={(value) => setAppointmentDuration(parseInt(value))}>
                    <SelectTrigger className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#3E4C4B]">Buffer Time Between Appointments (minutes)</Label>
                  <Select value={bufferTime.toString()} onValueChange={(value) => setBufferTime(parseInt(value))}>
                    <SelectTrigger className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Management Tab */}
        <TabsContent value="leave" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#046658]">Leave Management</h3>
              <p className="text-[#3E4C4B]">Manage your vacation and leave requests</p>
            </div>
            <Button 
              onClick={handleAddLeaveRequest}
              className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Leave Request
            </Button>
          </div>

          <div className="space-y-4">
            {leaveRequests.map((leave) => (
              <Card key={leave.id} className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#046658]">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-[#3E4C4B]">{leave.reason}</p>
                        <p className="text-xs text-[#2EB6B0] capitalize">{leave.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(leave.status)}>
                        {leave.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {leaveRequests.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-[#2EB6B0]" />
                  <h3 className="text-lg font-semibold text-[#046658] mb-2">No Leave Requests</h3>
                  <p className="text-[#3E4C4B]">You haven't submitted any leave requests yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
              <CardTitle className="text-xl font-bold">Schedule Analytics</CardTitle>
              <CardDescription className="text-white/90">
                Insights into your schedule efficiency and utilization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-[#3E4C4B]">
                <Users className="w-16 h-16 mx-auto mb-4 text-[#2EB6B0]" />
                <h3 className="text-lg font-semibold text-[#046658] mb-2">Analytics Coming Soon</h3>
                <p className="text-sm">Schedule analytics and insights will be available in the next update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <ScheduleExport doctorId={doctorId} doctorName="Dr. Smith" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
