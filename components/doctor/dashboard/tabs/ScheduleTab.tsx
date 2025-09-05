"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle,
  ExternalLink,
  CalendarDays,
  Timer,
  Edit3,
  Save,
  X,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { Doctor, Appointment } from '@/types/doctor-dashboard';

interface ScheduleTabProps {
  doctor: Doctor;
  appointments: Appointment[];
  onScheduleUpdate: () => void;
}

interface DoctorSchedule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  timezone: string;
  schedule_templates: any[];
  calendar_integrations: any[];
}

// Type guard to ensure we always have arrays
const ensureArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? value : [];
};

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  doctor,
  appointments,
  onScheduleUpdate,
}) => {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [calendarIntegrations, setCalendarIntegrations] = useState<any[]>([]);
  
  // Safety check to ensure schedules is always an array
  // Remove these useEffect hooks as they cause infinite loops
  // The ensureArray function already handles type safety
  const [isLoading, setIsLoading] = useState(true);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadScheduleData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if doctor has any schedules
      const schedulesResponse = await fetch(`/api/doctors/${doctor.id}/schedules`);
      const schedulesData = schedulesResponse.ok ? await schedulesResponse.json() : [];
      
      // Check calendar integrations
      const integrationsResponse = await fetch(`/api/doctors/${doctor.id}/calendar-integrations`);
      let integrationsData = [];
      
      if (integrationsResponse.ok) {
        const integrationsResponseData = await integrationsResponse.json();
        // Handle the new response format
        integrationsData = integrationsResponseData.integrations || integrationsResponseData;
      } else {
        console.warn('Calendar integrations not available:', integrationsResponse.status);
      }
      
      setSchedules(ensureArray<DoctorSchedule>(schedulesData));
      setCalendarIntegrations(ensureArray(integrationsData));
      setHasSchedule(ensureArray<DoctorSchedule>(schedulesData).length > 0);
      
    } catch (error) {
      console.error('Error loading schedule data:', error);
      setError('Failed to load schedule data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [doctor.id]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  const handleCreateSchedule = async () => {
    if (!newScheduleName.trim()) return;
    
    try {
      setError(null);
      setIsSubmittingSchedule(true);
      
      const response = await fetch(`/api/doctors/${doctor.id}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newScheduleName,
          description: 'Regular working schedule',
          timezone: 'UTC',
          is_default: schedules.length === 0, // First schedule is default
        }),
      });

      if (response.ok) {
        setNewScheduleName('');
        setIsCreatingSchedule(false); // Close modal
        await loadScheduleData();
        onScheduleUpdate();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create schedule');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      setError('Failed to create schedule. Please try again.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      setIsConnectingCalendar(true);
      setError(null);
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError('Failed to get Google Calendar authorization URL');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setError('Failed to connect to Google Calendar. Please try again.');
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Error Loading Schedule Data</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setError(null);
                  loadScheduleData();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Schedule Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Management
            </div>
            <Button 
              onClick={() => setIsCreatingSchedule(true)}
              disabled={isSubmittingSchedule}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasSchedule ? (
            <div className="space-y-4">
              <p className="text-gray-600">You have {schedules.length} schedule(s) configured.</p>
              <div className="grid gap-3">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{schedule.name}</h3>
                      <p className="text-sm text-gray-600">{schedule.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={schedule.is_active ? "default" : "secondary"}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {schedule.is_default && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Schedules Found</h3>
              <p className="text-gray-600 mb-4">Create your first schedule to start managing your availability.</p>
              <Button onClick={() => setIsCreatingSchedule(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Creation Dialog */}
      {isCreatingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div>
                <Label htmlFor="schedule-name">Schedule Name *</Label>
                <Input
                  id="schedule-name"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                  placeholder="e.g., Regular Working Hours"
                />
              </div>
              <div>
                <Label htmlFor="schedule-description">Description</Label>
                <Input
                  id="schedule-description"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label htmlFor="schedule-timezone">Timezone</Label>
                <Select defaultValue="UTC">
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
              <div className="flex items-center space-x-2">
                <Switch id="default-schedule" />
                <Label htmlFor="default-schedule">Set as default schedule</Label>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Button 
                  onClick={handleCreateSchedule}
                  disabled={!newScheduleName.trim() || isSubmittingSchedule}
                  className="flex-1"
                >
                  {isSubmittingSchedule ? 'Creating...' : 'Create Schedule'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsCreatingSchedule(false);
                    setNewScheduleName('');
                    setError(null);
                  }}
                  className="flex-1"
                  disabled={isSubmittingSchedule}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Schedules</p>
                <p className="text-lg font-bold">{ensureArray<DoctorSchedule>(schedules).filter((s: DoctorSchedule) => s.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Calendar</p>
                <p className="text-lg font-bold">{ensureArray(calendarIntegrations).filter((i: any) => i.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Timer className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Today</p>
                <p className="text-lg font-bold">
                  {ensureArray(appointments).filter((apt: any) => 
                    new Date(apt.appointment_date).toDateString() === new Date().toDateString() && 
                    apt.status === 'SCHEDULED'
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">This Week</p>
                <p className="text-lg font-bold">
                  {ensureArray(appointments).filter((apt: any) => {
                    const aptDate = new Date(apt.appointment_date);
                    const now = new Date();
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                    return aptDate >= weekStart && aptDate <= weekEnd && apt.status === 'SCHEDULED';
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Your Schedules
              </CardTitle>
              {!isCreatingSchedule && (
                <Button 
                  size="sm" 
                  onClick={() => setIsCreatingSchedule(true)}
                  disabled={schedules.length >= 3}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Schedule Inline */}
            {isCreatingSchedule && (
              <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Schedule name (e.g., Regular Hours)"
                    value={newScheduleName}
                    onChange={(e) => setNewScheduleName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCreateSchedule}
                    disabled={!newScheduleName.trim()}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsCreatingSchedule(false);
                      setNewScheduleName('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Schedules */}
            {ensureArray<DoctorSchedule>(schedules).length > 0 ? (
              <div className="space-y-3">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <h3 className="font-medium">{schedule.name}</h3>
                        <p className="text-sm text-gray-600">{schedule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.is_default && (
                        <Badge variant="default" className="text-xs">Default</Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No schedules yet</p>
                <p className="text-sm">Create your first schedule to manage availability</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Calendar Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Calendar Connection */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Google Calendar</h3>
                    <p className="text-sm text-gray-600">Sync appointments automatically</p>
                  </div>
                </div>
                {ensureArray(calendarIntegrations).filter((i: any) => i.is_active).length > 0 ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={handleConnectGoogleCalendar}
                    disabled={isConnectingCalendar}
                  >
                    {isConnectingCalendar ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Connect
                  </Button>
                )}
              </div>
              
              {ensureArray(calendarIntegrations).filter((i: any) => i.is_active).length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Appointments will sync automatically to your Google Calendar
                  </p>
                </div>
              )}
            </div>

            {/* Quick Sync Actions */}
            {ensureArray(calendarIntegrations).filter((i: any) => i.is_active).length > 0 && (
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All Appointments
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments Quick View */}
      {ensureArray(appointments).filter((apt: any) => 
        new Date(apt.appointment_date).toDateString() === new Date().toDateString()
      ).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appointments
                .filter((apt: any) => 
                  new Date(apt.appointment_date).toDateString() === new Date().toDateString() &&
                  apt.status === 'SCHEDULED'
                )
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-medium">
                          {appointment.patient.first_name} {appointment.patient.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{appointment.time}</span>
                      {ensureArray(calendarIntegrations).filter((i: any) => i.is_active).length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Synced
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
