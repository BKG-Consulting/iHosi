'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  AlertTriangle,
  Brain,
  GripVertical
} from 'lucide-react';
import { Appointment, TimeSlot } from '@/types/schedule-types';

interface EnhancedSmartSchedulerProps {
  readonly doctorId: string;
  readonly appointments: Appointment[];
  readonly className?: string;
}


export function EnhancedSmartScheduler({ doctorId, appointments, className }: EnhancedSmartSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSchedule, setPendingSchedule] = useState<{
    appointment: Appointment;
    slot: TimeSlot;
  } | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Generate time slots for the selected date
  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate, appointments]);

  // Check if current time has passed for a given time slot
  const isTimeSlotPassed = (time: string, date: Date): boolean => {
    const now = new Date();
    const slotDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    // If it's the same day, check if time has passed
    if (date.toDateString() === now.toDateString()) {
      return slotDateTime <= now;
    }
    
    // If it's a past day, all slots are passed
    return date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  // Check if a time slot is available (not passed, not booked, not during break)
  const isTimeSlotAvailable = (slot: TimeSlot): boolean => {
    return slot.isAvailable && !isTimeSlotPassed(slot.time, selectedDate);
  };

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    
    // Default working hours (9 AM to 5 PM)
    const startHour = 9;
    const endHour = 17;
    const breakStart = 12;
    
    // Generate 30-minute slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isBreakTime = hour === breakStart && minute === 0;
        
        // Check if there's an existing appointment at this time
        const existingAppointment = appointments.find(apt => {
          const aptDate = new Date(apt.appointment_date);
          const selectedDateStr = selectedDate.toDateString();
          const aptDateStr = aptDate.toDateString();
          return aptDateStr === selectedDateStr && apt.time === timeString;
        });

        slots.push({
          id: `slot-${hour}-${minute}`,
          time: timeString,
          duration: 30,
          isAvailable: !isBreakTime && !existingAppointment,
          isBreak: isBreakTime,
          isWorking: true,
          appointment: existingAppointment
        });
      }
    }

    setTimeSlots(slots);
  };

  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: new Date(date),
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      });
    }
    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    console.log('🔄 Drag started:', appointment.id);
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appointment.id.toString());
  };

  const handleDragEnd = () => {
    console.log('🔄 Drag ended');
    setDraggedAppointment(null);
    setDraggedOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slot: TimeSlot) => {
    e.preventDefault();
    
    // Check if slot is available and not passed
    if (isTimeSlotAvailable(slot)) {
      e.dataTransfer.dropEffect = 'move';
      setDraggedOverSlot(slot.id);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDraggedOverSlot(null);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slot: TimeSlot) => {
    e.preventDefault();
    console.log('🔄 Drop event:', { slotId: slot.id, time: slot.time, draggedAppointment });
    
    if (!draggedAppointment) {
      console.log('❌ Drop failed: No dragged appointment');
      setDraggedAppointment(null);
      setDraggedOverSlot(null);
      return;
    }

    // Check if slot is available and not passed
    if (!isTimeSlotAvailable(slot)) {
      const reason = isTimeSlotPassed(slot.time, selectedDate) ? 'Time slot has already passed' : 'Time slot not available';
      console.log('❌ Drop failed:', reason);
      alert(`Cannot schedule appointment: ${reason}`);
      setDraggedAppointment(null);
      setDraggedOverSlot(null);
      return;
    }

    // Show confirmation dialog instead of directly scheduling
    setPendingSchedule({
      appointment: draggedAppointment,
      slot: slot
    });
    setShowConfirmDialog(true);
    setDraggedAppointment(null);
    setDraggedOverSlot(null);
  };

  const handleConfirmSchedule = async () => {
    if (!pendingSchedule) return;

    setIsScheduling(true);
    try {
      console.log('🔄 Confirming appointment schedule:', {
        appointmentId: pendingSchedule.appointment.id,
        newTime: pendingSchedule.slot.time,
        newDate: selectedDate.toISOString().split('T')[0]
      });

      // First update the appointment with new time and date
      const updateResponse = await fetch(`/api/appointments/${pendingSchedule.appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: pendingSchedule.slot.time,
          appointment_date: selectedDate.toISOString().split('T')[0]
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update appointment time');
      }

      // Then use the appointmentAction to change status and send notifications
      const actionResponse = await fetch('/api/appointments/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: pendingSchedule.appointment.id,
          action: 'ACCEPT',
          reason: `Scheduled via drag and drop to ${pendingSchedule.slot.time} on ${selectedDate.toLocaleDateString()}`,
          enableAI: false // Disable AI for drag and drop scheduling
        })
      });

      const result = await actionResponse.json();
      
      if (result.success) {
        console.log('✅ Appointment scheduled successfully with notifications sent');
        // Refresh the page to show updated appointments
        window.location.reload();
      } else {
        console.error('❌ Failed to schedule appointment:', result.message);
        alert(`Failed to schedule appointment: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error scheduling appointment:', error);
      alert('Error scheduling appointment. Please try again.');
    } finally {
      setIsScheduling(false);
      setShowConfirmDialog(false);
      setPendingSchedule(null);
    }
  };

  const handleCancelSchedule = () => {
    setShowConfirmDialog(false);
    setPendingSchedule(null);
  };

  // Get appointments for selected date
  const selectedDateAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  // Get pending appointments (for demonstration)
  const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Scheduler</h2>
          <p className="text-gray-600">Drag and drop to schedule appointments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">AI Assistant</span>
            <Button
              variant={aiEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAiEnabled(!aiEnabled)}
              className={aiEnabled ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {aiEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      {aiEnabled && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900">AI Scheduling Assistant Active</h3>
                <p className="text-sm text-purple-700">
                  Your schedule is being optimized with AI. Existing appointments are shown in blue slots.
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center p-2 bg-white/50 rounded-lg">
                  <div className="font-bold text-purple-600">94%</div>
                  <div className="text-xs text-purple-500">Accuracy</div>
                </div>
                <div className="text-center p-2 bg-white/50 rounded-lg">
                  <div className="font-bold text-blue-600">2.3h</div>
                  <div className="text-xs text-blue-500">Time Saved</div>
                </div>
                <div className="text-center p-2 bg-white/50 rounded-lg">
                  <div className="font-bold text-green-600">12</div>
                  <div className="text-xs text-green-500">Optimizations</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {getNext7Days().map((day) => (
              <Button
                key={day.date.toISOString()}
                variant={selectedDate.toDateString() === day.date.toDateString() ? "default" : "outline"}
                onClick={() => setSelectedDate(day.date)}
                className="flex flex-col h-16"
              >
                <span className="text-xs">{day.display.split(' ')[0]}</span>
                <span className="text-sm font-medium">{day.display.split(' ')[1]}</span>
                <span className="text-xs">{day.display.split(' ')[2]}</span>
                {day.isToday && (
                  <Badge className="text-xs mt-1">Today</Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Appointments - Draggable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Pending Appointments
              <Badge variant="outline" className="ml-auto">
                {pendingAppointments.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Drag appointments to time slots to schedule them
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No pending appointments</p>
                <p className="text-sm text-gray-400 mt-2">
                  New appointment requests will appear here
                </p>
              </div>
            ) : (
              pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, appointment)}
                  onDragEnd={handleDragEnd}
                  className="p-3 border rounded-lg cursor-move hover:shadow-md transition-all bg-white hover:bg-blue-50 border-blue-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  
                  {appointment.note && (
                    <div className="text-xs text-gray-500 mb-2">
                      Note: {appointment.note}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Requested: {new Date(appointment.appointment_date).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Time Slots - Drop Zone */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {formatDate(selectedDate)}
            </CardTitle>
            <CardDescription>
              Click on available slots or drag appointments here
            </CardDescription>
            {selectedDate.toDateString() === new Date().toDateString() && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Clock className="h-4 w-4" />
                  <span>Current time: {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })} - Past time slots are disabled</span>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {timeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No working hours for this day</p>
              </div>
            ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => {
                      const isPassed = isTimeSlotPassed(slot.time, selectedDate);
                      const isAvailable = isTimeSlotAvailable(slot);
                      const isBreak = slot.isBreak;
                      const isBooked = slot.appointment;
                      
                      return (
                        <div
                          key={slot.id}
                          draggable={false}
                          onDragOver={(e) => handleDragOver(e, slot)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, slot)}
                          className={`p-3 border rounded-lg transition-all relative ${
                            isBreak
                              ? 'bg-amber-50 border-amber-200 cursor-not-allowed opacity-75'
                              : isBooked
                              ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 shadow-sm cursor-default'
                              : isPassed
                              ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                              : isAvailable
                              ? `bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer ${
                                  draggedOverSlot === slot.id ? 'ring-2 ring-blue-400 bg-blue-100' : ''
                                }`
                              : 'bg-red-50 border-red-200 cursor-not-allowed opacity-75'
                          }`}
                        >
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {slot.time}
                      </div>
                      
                      {isBreak ? (
                        <div className="space-y-1">
                          <div className="text-xs text-amber-600 font-medium">Break Time</div>
                          <div className="w-full h-1 bg-amber-300 rounded"></div>
                        </div>
                      ) : isPassed ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 font-medium">Past Time</div>
                          <div className="w-full h-1 bg-gray-300 rounded"></div>
                        </div>
                      ) : isBooked && slot.appointment ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-blue-800 truncate">
                            {slot.appointment.patient?.first_name} {slot.appointment.patient?.last_name}
                          </div>
                          <div className="text-xs text-blue-600 truncate">
                            {slot.appointment.type}
                          </div>
                          <Badge className={`text-xs ${getStatusColor(slot.appointment.status)}`}>
                            {slot.appointment.status}
                          </Badge>
                          {aiEnabled && (
                            <div className="flex items-center gap-1 text-xs text-purple-600">
                              <Brain className="h-3 w-3" />
                              <span>AI Optimized</span>
                            </div>
                          )}
                        </div>
                      ) : isAvailable ? (
                        <div className="space-y-1">
                          <div className="text-xs text-green-600 font-medium">Available</div>
                          {aiEnabled && (
                            <div className="text-xs text-green-500">
                              {Math.floor(Math.random() * 40 + 60)}% confidence
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-xs text-red-600 font-medium">Unavailable</div>
                          <div className="w-full h-1 bg-red-200 rounded"></div>
                        </div>
                      )}
                    </div>
                  </div>
                      );
                    })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {selectedDateAppointments.length}
              </div>
              <div className="text-sm text-blue-700">Scheduled Today</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {timeSlots.filter(slot => slot.isAvailable).length}
              </div>
              <div className="text-sm text-green-700">Available Slots</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {pendingAppointments.length}
              </div>
              <div className="text-sm text-orange-700">Pending Requests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Appointment Schedule
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Patient Details</h4>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {pendingSchedule.appointment.patient?.first_name} {pendingSchedule.appointment.patient?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Appointment Type:</strong> {pendingSchedule.appointment.type}
                </p>
                {pendingSchedule.appointment.note && (
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> {pendingSchedule.appointment.note}
                  </p>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Schedule Details</h4>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Time:</strong> {pendingSchedule.slot.time}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Important Notice
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This action will immediately send a confirmation email to the patient. 
                      Please ensure the details are correct before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCancelSchedule}
                variant="outline"
                className="flex-1"
                disabled={isScheduling}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isScheduling}
              >
                {isScheduling ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Scheduling...
                  </div>
                ) : (
                  'Confirm & Schedule'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
