'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Save,
  CheckCircle,
  AlertCircle,
  Brain,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';

interface WorkingDay {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments?: number;
}

interface ScheduleSetupProps {
  readonly doctorId: string;
  readonly onScheduleUpdated?: () => void;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export function ScheduleSetup({ doctorId, onScheduleUpdated }: ScheduleSetupProps) {
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [aiOptimization, setAiOptimization] = useState(true);

  useEffect(() => {
    loadCurrentSchedule();
  }, [doctorId]);

  const loadCurrentSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/doctors/${doctorId}/schedule`);
      if (response.ok) {
        const data = await response.json();
        const schedule = data.data;
        
        // Initialize working days with current schedule or defaults
        const days = DAYS_OF_WEEK.map(day => {
          const existingDay = schedule.workingHours?.find((d: any) => d.day === day);
          return {
            day,
            isWorking: existingDay?.isWorking || false,
            startTime: existingDay?.startTime || '09:00',
            endTime: existingDay?.endTime || '17:00',
            breakStart: existingDay?.breakStart || '12:00',
            breakEnd: existingDay?.breakEnd || '13:00',
            maxAppointments: existingDay?.maxAppointments || 16
          };
        });
        
        setWorkingDays(days);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      setMessage({ type: 'error', text: 'Failed to load current schedule' });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingDay = (dayIndex: number, updates: Partial<WorkingDay>) => {
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
            day: day.day,
            isWorking: day.isWorking,
            startTime: day.startTime,
            endTime: day.endTime,
            breakStart: day.breakStart,
            breakEnd: day.breakEnd,
            maxAppointments: day.maxAppointments
          })),
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

  const getDayStatus = (day: WorkingDay) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Schedule Setup</h2>
          <p className="text-gray-600">Configure your working hours and availability</p>
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
              <div key={day.day} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={day.isWorking}
                      onCheckedChange={() => toggleWorkingDay(index)}
                    />
                    <Label className="text-lg font-medium">{day.day}</Label>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ml-8">
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
                        value={day.maxAppointments || 16}
                        onChange={(e) => updateWorkingDay(index, { 
                          maxAppointments: parseInt(e.target.value) || 16 
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

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
