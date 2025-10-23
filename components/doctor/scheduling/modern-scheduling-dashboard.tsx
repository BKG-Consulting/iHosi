'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Settings,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { ModernAvailabilitySetup } from './modern-availability-setup';
import { ModernCalendarView } from './modern-calendar-view';
import { QuickScheduleModal } from './quick-schedule-modal';
import { Appointment } from '@/types/schedule-types';

interface ModernSchedulingDashboardProps {
  doctorId: string;
  appointments: Appointment[];
}

export function ModernSchedulingDashboard({ 
  doctorId, 
  appointments 
}: ModernSchedulingDashboardProps) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{date: Date; time: string} | null>(null);

  // Get pending appointments
  const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING');
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time });
    setShowScheduleModal(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log('Appointment clicked:', appointment);
    // TODO: Show appointment details modal
  };

  const handleScheduleComplete = () => {
    // Reload page to refresh appointments
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Today's Schedule</p>
                <p className="text-2xl font-bold text-blue-900">{todayAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Pending Requests</p>
                <p className="text-2xl font-bold text-purple-900">{pendingAppointments.length}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">This Week</p>
                <p className="text-2xl font-bold text-green-900">
                  {appointments.filter(apt => {
                    const aptDate = new Date(apt.appointment_date);
                    const today = new Date();
                    const weekFromNow = new Date(today);
                    weekFromNow.setDate(today.getDate() + 7);
                    return aptDate >= today && aptDate <= weekFromNow;
                  }).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar & Scheduling
            {pendingAppointments.length > 0 && (
              <Badge className="ml-2 bg-orange-500">{pendingAppointments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Availability Setup
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <ModernCalendarView
            doctorId={doctorId}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        </TabsContent>

        {/* Availability Setup Tab */}
        <TabsContent value="availability" className="space-y-4">
          <ModernAvailabilitySetup
            doctorId={doctorId}
            onSave={(schedule) => {
              console.log('Schedule saved:', schedule);
              // Optionally switch back to calendar
              // setActiveTab('calendar');
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Schedule Modal */}
      {selectedSlot && (
        <QuickScheduleModal
          open={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedSlot(null);
          }}
          doctorId={doctorId}
          selectedDate={selectedSlot.date}
          selectedTime={selectedSlot.time}
          pendingAppointments={pendingAppointments}
          onScheduleComplete={handleScheduleComplete}
        />
      )}
    </div>
  );
}


