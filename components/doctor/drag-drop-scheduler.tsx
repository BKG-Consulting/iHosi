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

interface DragDropSchedulerProps {
  readonly doctorId: string;
  readonly className?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  duration: number;
  isAvailable: boolean;
  appointment?: Appointment;
  isBreak?: boolean;
  isWorking?: boolean;
}

interface Appointment {
  id: number;
  patientName: string;
  type: string;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notes?: string;
  aiSuggested?: boolean;
  confidence?: number;
}

interface PendingAppointment extends Appointment {
  preferredTime?: string;
  preferredDate?: string;
  reason?: string;
}

export default function DragDropScheduler({ doctorId, className }: DragDropSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [draggedAppointment, setDraggedAppointment] = useState<PendingAppointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  // Load schedule data
  useEffect(() => {
    loadScheduleData();
  }, [doctorId, selectedDate]);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      // Load doctor's schedule for selected date
      const scheduleResponse = await fetch(`/api/doctors/${doctorId}/schedule`);
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        
        // Load existing appointments for the selected date
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        const appointmentsResponse = await fetch(`/api/scheduling/appointments?doctorId=${doctorId}&date=${selectedDateStr}`);
        
        let existingAppointments: any[] = [];
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          existingAppointments = appointmentsData.data?.appointments || [];
        }
        
        generateTimeSlots(scheduleData.data, existingAppointments);
      }

      // Load pending appointments
      const pendingResponse = await fetch(`/api/scheduling/appointments?doctorId=${doctorId}&status=PENDING`);
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingAppointments(pendingData.data?.appointments || []);
      }
    } catch (error) {
      console.error('Error loading schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (scheduleData: any, existingAppointments: any[] = []) => {
    const slots: TimeSlot[] = [];
    const workingHours = scheduleData.workingHours || [];
    const selectedDay = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const workingDay = workingHours?.find((day: any) => day.day === selectedDay);

    if (!workingDay || !workingDay.isWorking) {
      setTimeSlots([]);
      return;
    }

    const startTime = workingDay.startTime;
    const endTime = workingDay.endTime;
    const breakStart = workingDay.breakStart;
    const breakEnd = workingDay.breakEnd;

    // Generate 30-minute slots
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentTime = new Date(selectedDate);
    currentTime.setHours(startHour, startMin, 0, 0);
    
    const endTimeDate = new Date(selectedDate);
    endTimeDate.setHours(endHour, endMin, 0, 0);

    while (currentTime < endTimeDate) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const isBreakTime = breakStart && breakEnd && 
        timeString >= breakStart && timeString < breakEnd;

      // Check if there's an existing appointment at this time
      const existingAppointment = existingAppointments.find(apt => 
        apt.time === timeString && 
        new Date(apt.appointment_date).toDateString() === selectedDate.toDateString()
      );

      slots.push({
        id: `slot-${currentTime.getTime()}`,
        time: timeString,
        duration: 30,
        isAvailable: !isBreakTime && !existingAppointment,
        isBreak: isBreakTime,
        isWorking: true,
        appointment: existingAppointment ? {
          id: existingAppointment.id,
          patientName: `${existingAppointment.patient?.first_name || ''} ${existingAppointment.patient?.last_name || ''}`.trim(),
          type: existingAppointment.type,
          status: existingAppointment.status,
          priority: 'MEDIUM', // Default priority
          notes: existingAppointment.note,
          aiSuggested: existingAppointment.auto_scheduled || false,
          confidence: existingAppointment.ai_confidence_score || 0
        } : undefined
      });

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    setTimeSlots(slots);
  };

  const handleDragStart = (appointment: PendingAppointment) => {
    setDraggedAppointment(appointment);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
  };

  const handleDrop = async (slotId: string) => {
    if (!draggedAppointment) return;

    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot || !slot.isAvailable || slot.appointment) return;

    try {
      // Schedule the appointment
      const response = await fetch('/api/appointments/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: draggedAppointment.id,
          action: 'ACCEPT',
          aiSuggestedTime: slot.time,
          enableAI: aiEnabled
        })
      });

      if (response.ok) {
        // Update the slot with the appointment
        setTimeSlots(prev => prev.map(s => 
          s.id === slotId 
            ? { ...s, appointment: { ...draggedAppointment, status: 'SCHEDULED' } }
            : s
        ));

        // Remove from pending appointments
        setPendingAppointments(prev => prev.filter(a => a.id !== draggedAppointment.id));
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.appointment) {
      // Show appointment details
      console.log('Appointment details:', slot.appointment);
    } else if (slot.isAvailable) {
      // Show quick add appointment form
      console.log('Add appointment to slot:', slot.time);
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Manager</h2>
          <p className="text-gray-600">Drag and drop to schedule appointments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">AI Assistant</span>
            <Button
              variant={aiEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAiEnabled(!aiEnabled)}
            >
              {aiEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </div>

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
              </div>
            ) : (
              pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  draggable
                  onDragStart={() => handleDragStart(appointment)}
                  onDragEnd={handleDragEnd}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDragStart(appointment);
                    }
                  }}
                  className="p-3 border rounded-lg cursor-move hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(appointment.priority)}`}></div>
                      {appointment.aiSuggested && (
                        <Brain className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                  
                  {appointment.preferredTime && (
                    <div className="text-xs text-gray-500 mb-2">
                      Preferred: {appointment.preferredTime}
                    </div>
                  )}
                  
                  {appointment.aiSuggested && appointment.confidence && (
                    <div className="text-xs text-purple-600">
                      AI Confidence: {Math.round(appointment.confidence * 100)}%
                    </div>
                  )}
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
          </CardHeader>
          <CardContent>
            {timeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No working hours for this day</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!slot.appointment) {
                        handleDrop(slot.id);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (slot.appointment) {
                        e.dataTransfer.dropEffect = 'none';
                      }
                    }}
                    onClick={() => handleSlotClick(slot)}
                    className={`p-3 border rounded-lg transition-all ${
                      slot.isBreak
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                        : slot.appointment
                        ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 shadow-sm cursor-default'
                        : slot.isAvailable
                        ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
                        : 'bg-red-50 border-red-200 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {slot.time}
                      </div>
                      
                      {slot.isBreak ? (
                        <div className="text-xs text-gray-500">Break Time</div>
                      ) : slot.appointment ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-blue-800 truncate">
                            {slot.appointment.patientName}
                          </div>
                          <div className="text-xs text-blue-600 truncate">
                            {slot.appointment.type}
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Badge className={`text-xs ${getStatusColor(slot.appointment.status)}`}>
                              {slot.appointment.status}
                            </Badge>
                            {slot.appointment.aiSuggested && (
                              <Brain className="h-3 w-3 text-purple-600" />
                            )}
                          </div>
                          {slot.appointment.confidence && slot.appointment.confidence > 0 && (
                            <div className="text-xs text-purple-600">
                              AI: {Math.round(slot.appointment.confidence * 100)}%
                            </div>
                          )}
                        </div>
                      ) : slot.isAvailable ? (
                        <div className="text-xs text-green-600">Available</div>
                      ) : (
                        <div className="text-xs text-red-600">Unavailable</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiEnabled && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-5 w-5" />
              AI Scheduling Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <div className="text-sm text-purple-700">Scheduling Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2.3h</div>
                <div className="text-sm text-purple-700">Time Saved Daily</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">87%</div>
                <div className="text-sm text-purple-700">Patient Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
