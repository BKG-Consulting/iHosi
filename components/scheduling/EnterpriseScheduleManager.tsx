"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Settings,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  CalendarDays,
  Timer,
  Shield
} from 'lucide-react';
import { useEnterpriseScheduling } from '@/hooks/useEnterpriseScheduling';
import { ScheduleTemplateData, AvailabilityOverrideData } from '@/lib/enterprise-scheduling-service';
import { ScheduleCreationGuide } from './ScheduleCreationGuide';

interface EnterpriseScheduleManagerProps {
  doctorId: string;
  onScheduleUpdate?: () => void;
}

export const EnterpriseScheduleManager: React.FC<EnterpriseScheduleManagerProps> = ({
  doctorId,
  onScheduleUpdate,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isCreatingOverride, setIsCreatingOverride] = useState(false);
  const [showScheduleGuide, setShowScheduleGuide] = useState(false);

  const {
    schedules,
    availableSlots,
    conflicts,
    loading,
    error,
    fetchSchedules,
    fetchAvailableSlots,
    checkConflicts,
    bookAppointment,
    createSchedule,
    createScheduleTemplate,
    createAvailabilityOverride,
    getSchedulingAnalytics,
    clearError,
  } = useEnterpriseScheduling({
    doctorId,
    autoRefresh: true,
  });

  // Fetch available slots when date changes
  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate, fetchAvailableSlots]);

  const handleCreateSchedule = async (scheduleData: any) => {
    try {
      await createSchedule(scheduleData);
      setIsCreatingSchedule(false);
      onScheduleUpdate?.();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleCreateTemplate = async (templateData: ScheduleTemplateData) => {
    if (!selectedSchedule) return;
    
    try {
      await createScheduleTemplate(selectedSchedule, templateData);
      setIsCreatingTemplate(false);
      onScheduleUpdate?.();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleCreateOverride = async (overrideData: AvailabilityOverrideData) => {
    try {
      await createAvailabilityOverride(overrideData);
      setIsCreatingOverride(false);
      onScheduleUpdate?.();
    } catch (error) {
      console.error('Failed to create override:', error);
    }
  };

  const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-600 mb-4">Error loading schedule data</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schedule Management</h2>
          <p className="text-gray-600">Manage your availability and appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const now = new Date();
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              fetchSchedules(startOfMonth, endOfMonth);
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowScheduleGuide(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Active Schedules</p>
                <p className="text-lg font-bold">
                  {schedules.filter((s: any) => s.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Available Slots</p>
                <p className="text-lg font-bold">{availableSlots.length}</p>
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
                <p className="text-xs font-medium text-gray-600">Today's Slots</p>
                <p className="text-lg font-bold">
                  {availableSlots.filter((slot: any) => 
                    new Date(slot.date).toDateString() === new Date().toDateString()
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
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Conflicts</p>
                <p className="text-lg font-bold">
                  {conflicts?.hasConflict ? conflicts.conflicts.length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="overrides">Overrides</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Your Schedules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : schedules.length > 0 ? (
                <div className="space-y-3">
                  {schedules.map((schedule: any) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div>
                          <h3 className="font-medium">{schedule.name}</h3>
                          <p className="text-sm text-gray-600">{schedule.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(schedule.status)}>
                              {schedule.status}
                            </Badge>
                            {schedule.is_default && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSchedule(schedule.id)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
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
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Available Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                </div>
                <Button onClick={() => setIsCreatingTemplate(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSlots.map((slot: any) => (
                    <div
                      key={slot.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {slot.duration} minutes
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {slot.isEmergencyOnly && (
                            <Badge variant="destructive" className="text-xs">
                              Emergency
                            </Badge>
                          )}
                          {slot.requiresApproval && (
                            <Badge variant="outline" className="text-xs">
                              Approval
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No available slots</p>
                  <p className="text-sm">No time slots available for the selected date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overrides Tab */}
        <TabsContent value="overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Availability Overrides
                </CardTitle>
                <Button onClick={() => setIsCreatingOverride(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Override
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No overrides yet</p>
                <p className="text-sm">Create overrides to manage special availability periods</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Scheduling Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Analytics coming soon</p>
                <p className="text-sm">View detailed scheduling metrics and insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Schedule Dialog */}
      {isCreatingSchedule && (
        <CreateScheduleDialog
          onClose={() => setIsCreatingSchedule(false)}
          onSubmit={handleCreateSchedule}
        />
      )}

      {/* Create Template Dialog */}
      {isCreatingTemplate && (
        <CreateTemplateDialog
          onClose={() => setIsCreatingTemplate(false)}
          onSubmit={handleCreateTemplate}
        />
      )}

      {/* Create Override Dialog */}
      {isCreatingOverride && (
        <CreateOverrideDialog
          onClose={() => setIsCreatingOverride(false)}
          onSubmit={handleCreateOverride}
        />
      )}

      {/* Schedule Creation Guide Dialog */}
      {showScheduleGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ScheduleCreationGuide
              doctorId={doctorId}
              onScheduleCreated={() => {
                setShowScheduleGuide(false);
                onScheduleUpdate?.();
              }}
            />
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowScheduleGuide(false)}
              >
                Close Guide
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dialog Components (simplified for brevity)
const CreateScheduleDialog: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule_type: 'REGULAR',
    timezone: 'UTC',
    auto_accept_bookings: true,
    require_confirmation: false,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Regular Schedule"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => onSubmit(formData)}>Create</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CreateTemplateDialog: React.FC<{
  onClose: () => void;
  onSubmit: (data: ScheduleTemplateData) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ScheduleTemplateData>({
    name: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_working: true,
    appointment_duration: 30,
    buffer_time: 15,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Schedule Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Monday Morning"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => onSubmit(formData)}>Create</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CreateOverrideDialog: React.FC<{
  onClose: () => void;
  onSubmit: (data: AvailabilityOverrideData) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AvailabilityOverrideData>({
    override_type: 'PERSONAL_LEAVE',
    title: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    is_available: false,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Availability Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Personal Leave"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date.toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date.toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, end_date: new Date(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => onSubmit(formData)}>Create</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
