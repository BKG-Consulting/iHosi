"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Settings, 
  Plus, 
  CheckCircle,
  ArrowRight,
  Info,
  AlertCircle
} from 'lucide-react';

interface ScheduleCreationGuideProps {
  doctorId: string;
  onScheduleCreated?: () => void;
}

export const ScheduleCreationGuide: React.FC<ScheduleCreationGuideProps> = ({
  doctorId,
  onScheduleCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [scheduleData, setScheduleData] = useState({
    // Step 1: Basic Information
    name: '',
    description: '',
    schedule_type: 'REGULAR',
    timezone: 'UTC',
    
    // Step 2: Schedule Settings
    auto_accept_bookings: true,
    require_confirmation: false,
    max_advance_booking_days: 30,
    min_advance_booking_hours: 2,
    conflict_resolution: 'PREVENT_BOOKING',
    
    // Step 3: Working Hours Template
    working_days: [] as number[],
    start_time: '09:00',
    end_time: '17:00',
    appointment_duration: 30,
    buffer_time: 15,
    break_start: '12:00',
    break_end: '13:00',
    max_appointments_per_day: 20,
  });

  const [isCreating, setIsCreating] = useState(false);

  const daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' },
  ];

  const scheduleTypes = [
    { value: 'REGULAR', label: 'Regular Schedule', description: 'Standard working hours' },
    { value: 'EMERGENCY', label: 'Emergency Coverage', description: 'Emergency appointments only' },
    { value: 'ON_CALL', label: 'On-Call Schedule', description: 'On-call availability' },
    { value: 'CONSULTATION', label: 'Consultation Hours', description: 'Consultation appointments' },
  ];

  const conflictResolutions = [
    { value: 'PREVENT_BOOKING', label: 'Prevent Booking', description: 'Block conflicting appointments' },
    { value: 'AUTO_RESCHEDULE', label: 'Auto Reschedule', description: 'Automatically suggest alternatives' },
    { value: 'MANUAL_REVIEW', label: 'Manual Review', description: 'Require manual approval' },
    { value: 'OVERRIDE_ALLOWED', label: 'Allow Override', description: 'Allow with warning' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleWorkingDay = (dayValue: number) => {
    setScheduleData(prev => ({
      ...prev,
      working_days: prev.working_days.includes(dayValue)
        ? prev.working_days.filter(d => d !== dayValue)
        : [...prev.working_days, dayValue]
    }));
  };

  const handleCreateSchedule = async () => {
    setIsCreating(true);
    try {
      // Step 1: Create the main schedule
      const scheduleResponse = await fetch(`/api/scheduling/doctor/${doctorId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scheduleData.name,
          description: scheduleData.description,
          schedule_type: scheduleData.schedule_type,
          timezone: scheduleData.timezone,
          auto_accept_bookings: scheduleData.auto_accept_bookings,
          require_confirmation: scheduleData.require_confirmation,
          max_advance_booking_days: scheduleData.max_advance_booking_days,
          min_advance_booking_hours: scheduleData.min_advance_booking_hours,
          conflict_resolution: scheduleData.conflict_resolution,
        }),
      });

      if (!scheduleResponse.ok) {
        throw new Error('Failed to create schedule');
      }

      const schedule = await scheduleResponse.json();

      // Step 2: Create schedule templates for each working day
      for (const dayValue of scheduleData.working_days) {
        const dayInfo = daysOfWeek.find(d => d.value === dayValue);
        const templateResponse = await fetch(`/api/scheduling/schedules/${schedule.id}/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${dayInfo?.label} Schedule`,
            day_of_week: dayValue,
            start_time: scheduleData.start_time,
            end_time: scheduleData.end_time,
            is_working: true,
            break_start: scheduleData.break_start,
            break_end: scheduleData.break_end,
            appointment_duration: scheduleData.appointment_duration,
            buffer_time: scheduleData.buffer_time,
            max_appointments: scheduleData.max_appointments_per_day,
          }),
        });

        if (!templateResponse.ok) {
          console.error(`Failed to create template for ${dayInfo?.label}`);
        }
      }

      onScheduleCreated?.();
      setCurrentStep(4); // Success step
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Basic Schedule Information</h3>
        <p className="text-gray-600">Let's start by setting up your basic schedule details</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Schedule Name *</Label>
          <Input
            id="name"
            value={scheduleData.name}
            onChange={(e) => setScheduleData({ ...scheduleData, name: e.target.value })}
            placeholder="e.g., Regular Schedule, Emergency Coverage"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={scheduleData.description}
            onChange={(e) => setScheduleData({ ...scheduleData, description: e.target.value })}
            placeholder="Optional description of this schedule"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="schedule_type">Schedule Type *</Label>
          <Select
            value={scheduleData.schedule_type}
            onValueChange={(value) => setScheduleData({ ...scheduleData, schedule_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scheduleTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={scheduleData.timezone}
            onValueChange={(value) => setScheduleData({ ...scheduleData, timezone: value })}
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
              <SelectItem value="Europe/London">London</SelectItem>
              <SelectItem value="Europe/Paris">Paris</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Schedule Settings</h3>
        <p className="text-gray-600">Configure how your schedule behaves</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto_accept">Auto Accept Bookings</Label>
            <p className="text-sm text-gray-500">Automatically accept new appointment requests</p>
          </div>
          <Switch
            id="auto_accept"
            checked={scheduleData.auto_accept_bookings}
            onCheckedChange={(checked) => setScheduleData({ ...scheduleData, auto_accept_bookings: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="require_confirmation">Require Confirmation</Label>
            <p className="text-sm text-gray-500">Require manual confirmation for appointments</p>
          </div>
          <Switch
            id="require_confirmation"
            checked={scheduleData.require_confirmation}
            onCheckedChange={(checked) => setScheduleData({ ...scheduleData, require_confirmation: checked })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="max_advance_days">Max Advance Booking (Days)</Label>
            <Input
              id="max_advance_days"
              type="number"
              value={scheduleData.max_advance_booking_days}
              onChange={(e) => setScheduleData({ ...scheduleData, max_advance_booking_days: parseInt(e.target.value) })}
              min="1"
              max="365"
            />
          </div>
          <div>
            <Label htmlFor="min_advance_hours">Min Advance Booking (Hours)</Label>
            <Input
              id="min_advance_hours"
              type="number"
              value={scheduleData.min_advance_booking_hours}
              onChange={(e) => setScheduleData({ ...scheduleData, min_advance_booking_hours: parseInt(e.target.value) })}
              min="1"
              max="168"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="conflict_resolution">Conflict Resolution Strategy</Label>
          <Select
            value={scheduleData.conflict_resolution}
            onValueChange={(value) => setScheduleData({ ...scheduleData, conflict_resolution: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conflictResolutions.map(strategy => (
                <SelectItem key={strategy.value} value={strategy.value}>
                  <div>
                    <div className="font-medium">{strategy.label}</div>
                    <div className="text-sm text-gray-500">{strategy.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Working Hours</h3>
        <p className="text-gray-600">Set up your weekly working schedule</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Working Days *</Label>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {daysOfWeek.map(day => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleWorkingDay(day.value)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  scheduleData.working_days.includes(day.value)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="time"
              value={scheduleData.start_time}
              onChange={(e) => setScheduleData({ ...scheduleData, start_time: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="time"
              value={scheduleData.end_time}
              onChange={(e) => setScheduleData({ ...scheduleData, end_time: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="break_start">Break Start</Label>
            <Input
              id="break_start"
              type="time"
              value={scheduleData.break_start}
              onChange={(e) => setScheduleData({ ...scheduleData, break_start: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="break_end">Break End</Label>
            <Input
              id="break_end"
              type="time"
              value={scheduleData.break_end}
              onChange={(e) => setScheduleData({ ...scheduleData, break_end: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="appointment_duration">Appointment Duration (min)</Label>
            <Input
              id="appointment_duration"
              type="number"
              value={scheduleData.appointment_duration}
              onChange={(e) => setScheduleData({ ...scheduleData, appointment_duration: parseInt(e.target.value) })}
              min="15"
              max="120"
              step="15"
            />
          </div>
          <div>
            <Label htmlFor="buffer_time">Buffer Time (min)</Label>
            <Input
              id="buffer_time"
              type="number"
              value={scheduleData.buffer_time}
              onChange={(e) => setScheduleData({ ...scheduleData, buffer_time: parseInt(e.target.value) })}
              min="0"
              max="30"
              step="5"
            />
          </div>
          <div>
            <Label htmlFor="max_appointments">Max Appointments/Day</Label>
            <Input
              id="max_appointments"
              type="number"
              value={scheduleData.max_appointments_per_day}
              onChange={(e) => setScheduleData({ ...scheduleData, max_appointments_per_day: parseInt(e.target.value) })}
              min="1"
              max="50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold mb-2">Schedule Created Successfully!</h3>
        <p className="text-gray-600 mb-4">
          Your schedule "{scheduleData.name}" has been created with {scheduleData.working_days.length} working days.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Info className="w-4 h-4" />
          <span>Time slots will be automatically generated for the next 30 days</span>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return scheduleData.name.trim() !== '';
      case 2:
        return true; // All fields have defaults
      case 3:
        return scheduleData.working_days.length > 0;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Schedule
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Step {currentStep} of 3</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {currentStep === 4 ? renderStep4() : (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex items-center justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {currentStep < 3 ? (
                  <Button 
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCreateSchedule}
                    disabled={!canProceed() || isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Schedule'}
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

