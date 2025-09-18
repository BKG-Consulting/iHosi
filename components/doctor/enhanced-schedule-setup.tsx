'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Save,
  CheckCircle,
  AlertCircle,
  Brain,
  Settings,
  Plus,
  Trash2,
  Clock,
  Globe,
  AlertTriangle,
  RefreshCw,
  LayoutTemplate,
  CalendarDays,
  Zap,
  Shield,
  Smartphone,
  Mail,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';

interface WorkingDayConfig {
  dayOfWeek: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments: number;
  appointmentDuration: number;
  bufferTime: number;
}

interface ScheduleTemplate {
  id: number;
  name: string;
  description?: string;
  templateType: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  isDefault: boolean;
  workingDays: WorkingDayConfig[];
  recurrenceRules?: any;
  timezone: string;
}

interface ScheduleException {
  id: number;
  exceptionType: 'HOLIDAY' | 'VACATION' | 'SICK_LEAVE' | 'EMERGENCY' | 'CUSTOM';
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  isRecurring: boolean;
  affectsAppointments: boolean;
}

interface CalendarIntegration {
  id: number;
  provider: 'GOOGLE' | 'OUTLOOK' | 'APPLE' | 'CUSTOM';
  providerId: string;
  calendarId: string;
  syncEnabled: boolean;
  syncDirection: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
  lastSync?: Date;
}

interface EnhancedScheduleSetupProps {
  readonly doctorId: string;
  readonly onScheduleUpdated?: () => void;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Australia/Sydney', 'Africa/Lagos', 'Asia/Dubai'
];

const EXCEPTION_TYPES = [
  { value: 'HOLIDAY', label: 'Holiday', icon: '🎉' },
  { value: 'VACATION', label: 'Vacation', icon: '🏖️' },
  { value: 'SICK_LEAVE', label: 'Sick Leave', icon: '🤒' },
  { value: 'EMERGENCY', label: 'Emergency', icon: '🚨' },
  { value: 'CUSTOM', label: 'Custom', icon: '📝' }
];

export function EnhancedScheduleSetup({ doctorId, onScheduleUpdated }: EnhancedScheduleSetupProps) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [workingDays, setWorkingDays] = useState<WorkingDayConfig[]>([]);
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [aiOptimization, setAiOptimization] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadScheduleData();
  }, [doctorId]);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      // Load working days, templates, exceptions, and integrations
      const [workingDaysRes, templatesRes, exceptionsRes, integrationsRes] = await Promise.all([
        fetch(`/api/doctors/${doctorId}/schedule`),
        fetch(`/api/doctors/${doctorId}/schedule/templates`),
        fetch(`/api/doctors/${doctorId}/schedule/exceptions`),
        fetch(`/api/doctors/${doctorId}/schedule/integrations`)
      ]);

      if (workingDaysRes.ok) {
        const data = await workingDaysRes.json();
        const days = DAYS_OF_WEEK.map(day => {
          const existingDay = data.data?.workingHours?.find((d: any) => d.day === day);
          return {
            dayOfWeek: day,
            isWorking: existingDay?.isWorking || false,
            startTime: existingDay?.startTime || '09:00',
            endTime: existingDay?.endTime || '17:00',
            breakStart: existingDay?.breakStart,
            breakEnd: existingDay?.breakEnd,
            maxAppointments: existingDay?.maxAppointments || 16,
            appointmentDuration: existingDay?.appointmentDuration || 30,
            bufferTime: existingDay?.bufferTime || 5
          };
        });
        setWorkingDays(days);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.data || []);
      }

      if (exceptionsRes.ok) {
        const data = await exceptionsRes.json();
        setExceptions(data.data || []);
      }

      if (integrationsRes.ok) {
        const data = await integrationsRes.json();
        setIntegrations(data.data || []);
      }
    } catch (error) {
      console.error('Error loading schedule data:', error);
      setMessage({ type: 'error', text: 'Failed to load schedule data' });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingDay = (dayIndex: number, updates: Partial<WorkingDayConfig>) => {
    setWorkingDays(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, ...updates } : day
    ));
  };

  const toggleWorkingDay = (dayIndex: number) => {
    updateWorkingDay(dayIndex, { 
      isWorking: !workingDays[dayIndex].isWorking 
    });
  };

  const addBreakTime = (dayIndex: number) => {
    updateWorkingDay(dayIndex, {
      breakStart: '12:00',
      breakEnd: '13:00'
    });
  };

  const removeBreakTime = (dayIndex: number) => {
    updateWorkingDay(dayIndex, {
      breakStart: undefined,
      breakEnd: undefined
    });
  };

  const calculateAppointmentSlots = (startTime: string, endTime: string, breakStart?: string, breakEnd?: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    if (breakStart && breakEnd) {
      const [breakStartHour, breakStartMin] = breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMin] = breakEnd.split(':').map(Number);
      const breakMinutes = (breakEndHour * 60 + breakEndMin) - (breakStartHour * 60 + breakStartMin);
      totalMinutes -= breakMinutes;
    }
    
    return Math.floor(totalMinutes / 30); // 30-minute slots
  };

  const saveSchedule = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/doctors/${doctorId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingHours: workingDays.map(day => ({
            day: day.dayOfWeek,
            isWorking: day.isWorking,
            startTime: day.startTime,
            endTime: day.endTime,
            breakStart: day.breakStart,
            breakEnd: day.breakEnd,
            maxAppointments: day.maxAppointments,
            appointmentDuration: day.appointmentDuration,
            bufferTime: day.bufferTime
          })),
          timezone: selectedTimezone,
          aiOptimization
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Schedule updated successfully!' });
        onScheduleUpdated?.();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to save schedule' });
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setMessage({ type: 'error', text: 'Failed to save schedule' });
    } finally {
      setSaving(false);
    }
  };

  const getDayStatus = (day: WorkingDayConfig) => {
    if (!day.isWorking) return { status: 'Off', color: 'bg-gray-100 text-gray-600' };
    
    const slots = calculateAppointmentSlots(day.startTime, day.endTime, day.breakStart, day.breakEnd);
    if (slots >= 16) return { status: 'Full Day', color: 'bg-green-100 text-green-600' };
    if (slots >= 8) return { status: 'Half Day', color: 'bg-blue-100 text-blue-600' };
    return { status: 'Short Day', color: 'bg-yellow-100 text-yellow-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Schedule Setup</h2>
          <p className="text-gray-600">Comprehensive scheduling with templates, exceptions, and calendar sync</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">AI Optimization</span>
            <Switch
              checked={aiOptimization}
              onCheckedChange={setAiOptimization}
            />
          </div>
        </div>
      </div>

      {/* AI Optimization Info */}
      {aiOptimization && (
        <Alert className="bg-purple-50 border-purple-200">
          <Brain className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            AI will optimize your schedule by analyzing patient preferences, appointment patterns, 
            and your working habits to suggest the most efficient time slots.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Exceptions
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {/* Timezone Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Timezone & Global Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Time</Label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm font-mono">
                    {new Date().toLocaleString('en-US', { 
                      timeZone: selectedTimezone,
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Days Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Working Days & Hours
              </CardTitle>
              <CardDescription>
                Set your availability for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workingDays.map((day, index) => {
                const dayStatus = getDayStatus(day);
                const appointmentSlots = calculateAppointmentSlots(
                  day.startTime, 
                  day.endTime, 
                  day.breakStart, 
                  day.breakEnd
                );

                return (
                  <div key={day.dayOfWeek} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={day.isWorking}
                          onCheckedChange={() => toggleWorkingDay(index)}
                        />
                        <Label className="text-lg font-medium">{day.dayOfWeek}</Label>
                        <Badge className={dayStatus.color}>
                          {dayStatus.status}
                        </Badge>
                        {day.isWorking && (
                          <Badge variant="outline">
                            {appointmentSlots} slots
                          </Badge>
                        )}
                      </div>
                    </div>

                    {day.isWorking && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ml-8">
                        {/* Working Hours */}
                        <div className="space-y-2">
                          <Label htmlFor={`start-${index}`}>Start Time</Label>
                          <Input
                            id={`start-${index}`}
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateWorkingDay(index, { startTime: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`end-${index}`}>End Time</Label>
                          <Input
                            id={`end-${index}`}
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateWorkingDay(index, { endTime: e.target.value })}
                          />
                        </div>

                        {/* Break Time */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Break Time</Label>
                            {!day.breakStart ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addBreakTime(index)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Break
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeBreakTime(index)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                          {day.breakStart && (
                            <div className="flex gap-2">
                              <Input
                                type="time"
                                value={day.breakStart}
                                onChange={(e) => updateWorkingDay(index, { breakStart: e.target.value })}
                                className="text-sm"
                              />
                              <Input
                                type="time"
                                value={day.breakEnd}
                                onChange={(e) => updateWorkingDay(index, { breakEnd: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {/* Max Appointments */}
                        <div className="space-y-2">
                          <Label htmlFor={`max-${index}`}>Max Appointments</Label>
                          <Input
                            id={`max-${index}`}
                            type="number"
                            min="1"
                            max="32"
                            value={day.maxAppointments}
                            onChange={(e) => updateWorkingDay(index, { 
                              maxAppointments: parseInt(e.target.value) || 16 
                            })}
                          />
                        </div>

                        {/* Appointment Duration */}
                        <div className="space-y-2">
                          <Label htmlFor={`duration-${index}`}>Duration (min)</Label>
                          <Input
                            id={`duration-${index}`}
                            type="number"
                            min="15"
                            max="120"
                            step="15"
                            value={day.appointmentDuration}
                            onChange={(e) => updateWorkingDay(index, { 
                              appointmentDuration: parseInt(e.target.value) || 30 
                            })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Schedule Templates
            </CardTitle>
              <CardDescription>
                Create and manage reusable schedule patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <LayoutTemplate className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Schedule templates coming soon!</p>
                <p className="text-sm text-gray-400 mt-2">
                  Create reusable schedule patterns for different scenarios
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exceptions Tab */}
        <TabsContent value="exceptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Schedule Exceptions
              </CardTitle>
              <CardDescription>
                Manage holidays, vacations, and special days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Schedule exceptions coming soon!</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add holidays, vacations, and special days to your schedule
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Integration Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Calendar Integration
              </CardTitle>
              <CardDescription>
                Sync with external calendars (Google, Outlook, Apple)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Calendar integration coming soon!</p>
                <p className="text-sm text-gray-400 mt-2">
                  Connect your external calendars for seamless scheduling
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Schedule Analytics
              </CardTitle>
              <CardDescription>
                AI-powered insights and optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Schedule analytics coming soon!</p>
                <p className="text-sm text-gray-400 mt-2">
                  Get AI-powered insights to optimize your schedule
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {workingDays.filter(day => day.isWorking).length}
              </div>
              <div className="text-sm text-green-700">Working Days</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {workingDays
                  .filter(day => day.isWorking)
                  .reduce((total, day) => total + calculateAppointmentSlots(
                    day.startTime, 
                    day.endTime, 
                    day.breakStart, 
                    day.breakEnd
                  ), 0)}
              </div>
              <div className="text-sm text-blue-700">Total Weekly Slots</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {aiOptimization ? 'ON' : 'OFF'}
              </div>
              <div className="text-sm text-purple-700">AI Optimization</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {selectedTimezone}
              </div>
              <div className="text-sm text-orange-700">Timezone</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <Alert className={message.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSchedule}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Schedule
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
