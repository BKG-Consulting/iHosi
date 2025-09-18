'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Clock, Calendar, Settings } from 'lucide-react';
import { WorkingDay, WorkingDayFormData, ApiResponse, ScheduleData, DayOfWeekType } from '@/types/schedule-types';
import { ScheduleFrequencyControls } from './schedule-frequency-controls';
import { ScheduleTemplateManager } from './schedule-template-manager';

interface ScheduleSetupProps {
  doctorId: string;
  onScheduleUpdate?: (schedule: ScheduleData) => void;
}

const DAYS_OF_WEEK: DayOfWeekType[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

export function TypeScriptScheduleSetup({ doctorId, onScheduleUpdate }: ScheduleSetupProps) {
  const [workingDays, setWorkingDays] = useState<WorkingDayFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Frequency and template controls
  const [recurrenceType, setRecurrenceType] = useState('WEEKLY');
  const [effectiveFrom, setEffectiveFrom] = useState<Date | undefined>();
  const [effectiveUntil, setEffectiveUntil] = useState<Date | undefined>();
  const [customPattern, setCustomPattern] = useState<string>('');
  const [isTemplate, setIsTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'templates' | 'frequency'>('schedule');

  // Initialize working days
  useEffect(() => {
    const initialDays: WorkingDayFormData[] = DAYS_OF_WEEK.map(day => ({
      day,
      isWorking: day !== 'Saturday' && day !== 'Sunday',
      startTime: '09:00',
      endTime: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      maxAppointments: 20,
      appointmentDuration: 30,
      bufferTime: 5,
      timezone: 'UTC'
    }));
    setWorkingDays(initialDays);
  }, []);

  // Load existing schedule
  const loadSchedule = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/doctors/${doctorId}/schedule`);
      const result: ApiResponse<ScheduleData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to load schedule');
      }

      // Convert WorkingDay to WorkingDayFormData
      const formData: WorkingDayFormData[] = result.data.workingHours.map(day => ({
        day: day.day,
        isWorking: day.isWorking,
        startTime: day.startTime,
        endTime: day.endTime,
        breakStart: day.breakStart || undefined,
        breakEnd: day.breakEnd || undefined,
        maxAppointments: day.maxAppointments,
        appointmentDuration: day.appointmentDuration || 30,
        bufferTime: day.bufferTime || 5,
        timezone: day.timezone || 'UTC'
      }));

      setWorkingDays(formData);
      
      // Load frequency data
      if (result.data.recurrenceType) {
        setRecurrenceType(result.data.recurrenceType);
      }
      if (result.data.effectiveFrom) {
        setEffectiveFrom(new Date(result.data.effectiveFrom));
      }
      if (result.data.effectiveUntil) {
        setEffectiveUntil(new Date(result.data.effectiveUntil));
      }
      if (result.data.customPattern) {
        setCustomPattern(result.data.customPattern);
      }
      if (result.data.isTemplate !== undefined) {
        setIsTemplate(result.data.isTemplate);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load schedule';
      setError(errorMessage);
      console.error('Error loading schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save schedule
  const saveSchedule = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate data
      const validationErrors = validateWorkingDays(workingDays);
      if (validationErrors.length > 0) {
        setError(`Validation errors: ${validationErrors.join(', ')}`);
        return;
      }

      const response = await fetch(`/api/doctors/${doctorId}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workingHours: workingDays,
          aiOptimization: false,
          recurrenceType,
          effectiveFrom: effectiveFrom?.toISOString(),
          effectiveUntil: effectiveUntil?.toISOString(),
          customPattern,
          isTemplate
        }),
      });

      const result: ApiResponse<{ doctorId: string; workingDaysCount: number; aiOptimization: boolean }> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save schedule');
      }

      setSuccess('Schedule updated successfully!');
      
      // Notify parent component
      if (onScheduleUpdate) {
        // Reload the schedule data
        await loadSchedule();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save schedule';
      setError(errorMessage);
      console.error('Error saving schedule:', err);
    } finally {
      setSaving(false);
    }
  };

  // Validate working days
  const validateWorkingDays = (days: WorkingDayFormData[]): string[] => {
    const errors: string[] = [];

    days.forEach((day, index) => {
      if (day.isWorking) {
        // Validate time format
        const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
        
        if (!timeRegex.test(day.startTime)) {
          errors.push(`${day.day}: Invalid start time format`);
        }
        
        if (!timeRegex.test(day.endTime)) {
          errors.push(`${day.day}: Invalid end time format`);
        }

        // Validate time logic
        const startTime = new Date(`2000-01-01T${day.startTime}:00`);
        const endTime = new Date(`2000-01-01T${day.endTime}:00`);
        
        if (startTime >= endTime) {
          errors.push(`${day.day}: Start time must be before end time`);
        }

        // Validate break times
        if (day.breakStart && day.breakEnd && day.breakStart !== 'none' && day.breakEnd !== 'none') {
          if (!timeRegex.test(day.breakStart) || !timeRegex.test(day.breakEnd)) {
            errors.push(`${day.day}: Invalid break time format`);
          }
          
          const breakStart = new Date(`2000-01-01T${day.breakStart}:00`);
          const breakEnd = new Date(`2000-01-01T${day.breakEnd}:00`);
          
          if (breakStart >= breakEnd) {
            errors.push(`${day.day}: Break start time must be before break end time`);
          }
          
          if (breakStart <= startTime || breakEnd >= endTime) {
            errors.push(`${day.day}: Break time must be within working hours`);
          }
        }

        // Validate appointment limits
        if (day.maxAppointments < 1 || day.maxAppointments > 32) {
          errors.push(`${day.day}: Max appointments must be between 1 and 32`);
        }

        if (day.appointmentDuration && (day.appointmentDuration < 15 || day.appointmentDuration > 480)) {
          errors.push(`${day.day}: Appointment duration must be between 15 and 480 minutes`);
        }

        if (day.bufferTime && (day.bufferTime < 0 || day.bufferTime > 60)) {
          errors.push(`${day.day}: Buffer time must be between 0 and 60 minutes`);
        }
      }
    });

    return errors;
  };

  // Update working day
  const updateWorkingDay = (index: number, field: keyof WorkingDayFormData, value: any): void => {
    setWorkingDays(prev => prev.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    ));
  };

  // Toggle working day
  const toggleWorkingDay = (index: number): void => {
    updateWorkingDay(index, 'isWorking', !workingDays[index].isWorking);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading schedule...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'schedule'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4 mr-2 inline" />
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('frequency')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'frequency'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4 mr-2 inline" />
          Frequency
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="h-4 w-4 mr-2 inline" />
          Templates
        </button>
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Working Days & Hours
            </CardTitle>
            <CardDescription>
              Set your availability for each day of the week. Configure working hours, breaks, and appointment limits.
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {workingDays.map((day, index) => (
              <Card key={day.day} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={day.isWorking}
                      onCheckedChange={() => toggleWorkingDay(index)}
                    />
                    <Label className="text-sm font-medium">{day.day}</Label>
                  </div>
                  {day.isWorking && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{day.startTime} - {day.endTime}</span>
                    </div>
                  )}
                </div>

                {day.isWorking && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Start Time */}
                    <div className="space-y-2">
                      <Label htmlFor={`start-${index}`}>Start Time</Label>
                      <Select
                        value={day.startTime}
                        onValueChange={(value) => updateWorkingDay(index, 'startTime', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* End Time */}
                    <div className="space-y-2">
                      <Label htmlFor={`end-${index}`}>End Time</Label>
                      <Select
                        value={day.endTime}
                        onValueChange={(value) => updateWorkingDay(index, 'endTime', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Break Start */}
                    <div className="space-y-2">
                      <Label htmlFor={`break-start-${index}`}>Break Start</Label>
                      <Select
                        value={day.breakStart || 'none'}
                        onValueChange={(value) => updateWorkingDay(index, 'breakStart', value === 'none' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No break" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No break</SelectItem>
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Break End */}
                    <div className="space-y-2">
                      <Label htmlFor={`break-end-${index}`}>Break End</Label>
                      <Select
                        value={day.breakEnd || 'none'}
                        onValueChange={(value) => updateWorkingDay(index, 'breakEnd', value === 'none' ? undefined : value)}
                        disabled={!day.breakStart || day.breakStart === 'none'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No break" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No break</SelectItem>
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Max Appointments */}
                    <div className="space-y-2">
                      <Label htmlFor={`max-appointments-${index}`}>Max Appointments</Label>
                      <Input
                        id={`max-appointments-${index}`}
                        type="number"
                        min="1"
                        max="32"
                        value={day.maxAppointments}
                        onChange={(e) => updateWorkingDay(index, 'maxAppointments', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    {/* Appointment Duration */}
                    <div className="space-y-2">
                      <Label htmlFor={`duration-${index}`}>Duration (min)</Label>
                      <Input
                        id={`duration-${index}`}
                        type="number"
                        min="15"
                        max="480"
                        value={day.appointmentDuration || 30}
                        onChange={(e) => updateWorkingDay(index, 'appointmentDuration', parseInt(e.target.value) || 30)}
                      />
                    </div>

                    {/* Buffer Time */}
                    <div className="space-y-2">
                      <Label htmlFor={`buffer-${index}`}>Buffer (min)</Label>
                      <Input
                        id={`buffer-${index}`}
                        type="number"
                        min="0"
                        max="60"
                        value={day.bufferTime || 5}
                        onChange={(e) => updateWorkingDay(index, 'bufferTime', parseInt(e.target.value) || 5)}
                      />
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                      <Label htmlFor={`timezone-${index}`}>Timezone</Label>
                      <Select
                        value={day.timezone || 'UTC'}
                        onValueChange={(value) => updateWorkingDay(index, 'timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

        </CardContent>
      </Card>
      )}

      {/* Frequency Tab */}
      {activeTab === 'frequency' && (
        <ScheduleFrequencyControls
          recurrenceType={recurrenceType}
          onRecurrenceChange={setRecurrenceType}
          effectiveFrom={effectiveFrom}
          onEffectiveFromChange={setEffectiveFrom}
          effectiveUntil={effectiveUntil}
          onEffectiveUntilChange={setEffectiveUntil}
          customPattern={customPattern}
          onCustomPatternChange={setCustomPattern}
          isTemplate={isTemplate}
          onTemplateChange={setIsTemplate}
        />
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <ScheduleTemplateManager
          doctorId={doctorId}
          onTemplateSelect={(template) => {
            // Apply template to current working days
            setWorkingDays(template.workingDays.map(day => ({
              day: day.day_of_week as DayOfWeekType,
              isWorking: day.is_working,
              startTime: day.start_time,
              endTime: day.end_time,
              breakStart: day.break_start_time || undefined,
              breakEnd: day.break_end_time || undefined,
              maxAppointments: day.max_appointments,
              appointmentDuration: day.appointment_duration,
              bufferTime: day.buffer_time,
              timezone: day.timezone
            })));
            setActiveTab('schedule');
          }}
          onTemplateSave={async (template) => {
            // Save current working days as template
            console.log('Saving template:', template);
          }}
          onTemplateDelete={async (templateId) => {
            // Delete template
            console.log('Deleting template:', templateId);
          }}
        />
      )}

      {/* Global Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Global Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={loadSchedule}
              disabled={loading}
            >
              <Settings className="h-4 w-4 mr-2" />
              Reload
            </Button>
            <Button
              onClick={saveSchedule}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
