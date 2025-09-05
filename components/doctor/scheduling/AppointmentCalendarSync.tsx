"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Sync, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Appointment } from '@/types/doctor-dashboard';

interface AppointmentCalendarSyncProps {
  appointments: Appointment[];
  doctorId: string;
  onSyncComplete: () => void;
}

interface CalendarIntegration {
  id: string;
  provider: string;
  calendar_name: string;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at?: Date;
}

export const AppointmentCalendarSync: React.FC<AppointmentCalendarSyncProps> = ({
  appointments,
  doctorId,
  onSyncComplete,
}) => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<Record<string, 'pending' | 'syncing' | 'success' | 'error'>>({});
  const [autoSync, setAutoSync] = useState(false);

  useEffect(() => {
    loadCalendarIntegrations();
  }, [doctorId]);

  const loadCalendarIntegrations = async () => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/calendar-integrations`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
        if (data.length > 0) {
          setSelectedIntegration(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading calendar integrations:', error);
    }
  };

  const syncAppointmentToCalendar = async (appointment: Appointment) => {
    if (!selectedIntegration) return;

    setSyncStatus(prev => ({ ...prev, [appointment.id]: 'syncing' }));

    try {
      const response = await fetch(`/api/appointments/${appointment.id}/sync-calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: selectedIntegration,
          calendar_id: integrations.find(i => i.id === selectedIntegration)?.calendar_name
        }),
      });

      if (response.ok) {
        setSyncStatus(prev => ({ ...prev, [appointment.id]: 'success' }));
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Error syncing appointment:', error);
      setSyncStatus(prev => ({ ...prev, [appointment.id]: 'error' }));
    }
  };

  const syncAllAppointments = async () => {
    const unsyncedAppointments = appointments.filter(apt => 
      !apt.calendar_event_id && apt.status === 'SCHEDULED'
    );

    for (const appointment of unsyncedAppointments) {
      await syncAppointmentToCalendar(appointment);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    onSyncComplete();
  };

  const getSyncStatusIcon = (appointmentId: string) => {
    const status = syncStatus[appointmentId];
    switch (status) {
      case 'syncing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSyncStatusText = (appointment: Appointment) => {
    if (appointment.calendar_event_id) {
      return 'Synced';
    }
    const status = syncStatus[appointment.id];
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Failed';
      default:
        return 'Not synced';
    }
  };

  const getSyncStatusBadge = (appointment: Appointment) => {
    if (appointment.calendar_event_id) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Synced</Badge>;
    }
    const status = syncStatus[appointment.id];
    switch (status) {
      case 'syncing':
        return <Badge variant="secondary">Syncing...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Synced</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not synced</Badge>;
    }
  };

  const unsyncedCount = appointments.filter(apt => 
    !apt.calendar_event_id && apt.status === 'SCHEDULED'
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sync className="w-5 h-5" />
          Calendar Sync
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Calendar Integration Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Calendar</label>
            <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
              <SelectTrigger>
                <SelectValue placeholder="Select a calendar" />
              </SelectTrigger>
              <SelectContent>
                {integrations.map(integration => (
                  <SelectItem key={integration.id} value={integration.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {integration.calendar_name}
                      <Badge variant={integration.is_active ? 'default' : 'secondary'} className="text-xs">
                        {integration.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {integrations.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No calendar integrations</p>
              <p className="text-sm mb-4">Connect your Google Calendar to sync appointments</p>
              <Button>
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect Calendar
              </Button>
            </div>
          )}
        </div>

        {/* Auto Sync Toggle */}
        {integrations.length > 0 && (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Auto-sync new appointments</h4>
              <p className="text-sm text-gray-600">
                Automatically sync new appointments to your calendar
              </p>
            </div>
            <Switch
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>
        )}

        {/* Sync Actions */}
        {integrations.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Sync Status</h4>
              <p className="text-sm text-gray-600">
                {unsyncedCount} appointments not synced
              </p>
            </div>
            <Button 
              onClick={syncAllAppointments}
              disabled={unsyncedCount === 0}
            >
              <Sync className="w-4 h-4 mr-2" />
              Sync All ({unsyncedCount})
            </Button>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-3">
          <h4 className="font-medium">Appointments</h4>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No appointments</p>
              <p className="text-sm">Appointments will appear here when created</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {appointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getSyncStatusIcon(appointment.id)}
                    <div>
                      <p className="font-medium">
                        {appointment.patient.first_name} {appointment.patient.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getSyncStatusBadge(appointment)}
                    
                    {!appointment.calendar_event_id && appointment.status === 'SCHEDULED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncAppointmentToCalendar(appointment)}
                        disabled={syncStatus[appointment.id] === 'syncing'}
                      >
                        {syncStatus[appointment.id] === 'syncing' ? (
                          <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sync className="w-4 h-4" />
                        )}
                      </Button>
                    )}

                    {appointment.calendar_event_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://calendar.google.com/calendar/event?eid=${appointment.calendar_event_id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

