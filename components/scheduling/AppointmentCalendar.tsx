'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  AppointmentDetails, 
  TimeSlot, 
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  APPOINTMENT_TYPES,
  PRIORITY_LEVELS
} from '@/types/scheduling';
import { AppointmentStatus } from '@prisma/client';

interface AppointmentCalendarProps {
  doctorId: string;
  appointments: AppointmentDetails[];
  onAppointmentCreate: (appointment: CreateAppointmentRequest) => Promise<void>;
  onAppointmentUpdate: (appointment: UpdateAppointmentRequest) => Promise<void>;
  onAppointmentDelete: (appointmentId: number) => Promise<void>;
  onAppointmentClick: (appointment: AppointmentDetails) => void;
  onTimeSlotClick: (timeSlot: TimeSlot, date: Date) => void;
  isLoading?: boolean;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  doctorId,
  appointments,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDelete,
  onAppointmentClick,
  onTimeSlotClick,
  isLoading = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetails | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Generate calendar days for current view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (view === 'day') {
      return [selectedDate];
    } else if (view === 'week') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
      });
    } else {
      // Month view
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push(date);
      }
      return days;
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // Get appointments for a specific time slot
  const getAppointmentsForTimeSlot = (date: Date, timeSlot: TimeSlot) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.toDateString() === date.toDateString() &&
             appointment.time === timeSlot.start;
    });
  };

  // Generate time slots for a day
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    const slotDuration = 30; // 30 minutes
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += slotDuration) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const endMinutes = minutes + slotDuration;
        const endHourAdjusted = endMinutes >= 60 ? hour + 1 : hour;
        const endMinutesAdjusted = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
        const endTime = `${endHourAdjusted.toString().padStart(2, '0')}:${endMinutesAdjusted.toString().padStart(2, '0')}`;
        
        if (endHourAdjusted <= endHour) {
          const existingAppointments = getAppointmentsForTimeSlot(date, { start: startTime, end: endTime, isAvailable: true });
          
          slots.push({
            start: startTime,
            end: endTime,
            isAvailable: existingAppointments.length === 0,
            currentAppointments: existingAppointments.length,
          });
        }
      }
    }
    
    return slots;
  };

  // Get status color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    if (view === 'day') {
      setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000));
    } else if (view === 'week') {
      setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const goToNext = () => {
    if (view === 'day') {
      setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
    } else if (view === 'week') {
      setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-[#046658]">Appointment Calendar</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
              className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white"
            >
              Day
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
              className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white"
            >
              Week
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
              className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white"
            >
              Month
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white hover:from-[#034a4a] hover:to-[#259a9a]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid gap-4">
        {view === 'day' ? (
          <DayView
            date={selectedDate}
            appointments={getAppointmentsForDate(selectedDate)}
            timeSlots={generateTimeSlots(selectedDate)}
            onAppointmentClick={onAppointmentClick}
            onTimeSlotClick={onTimeSlotClick}
            onAppointmentUpdate={onAppointmentUpdate}
            onAppointmentDelete={onAppointmentDelete}
            isLoading={isLoading}
          />
        ) : view === 'week' ? (
          <WeekView
            days={calendarDays}
            appointments={appointments}
            onAppointmentClick={onAppointmentClick}
            onTimeSlotClick={onTimeSlotClick}
            onAppointmentUpdate={onAppointmentUpdate}
            onAppointmentDelete={onAppointmentDelete}
            isLoading={isLoading}
          />
        ) : (
          <MonthView
            days={calendarDays}
            appointments={appointments}
            onAppointmentClick={onAppointmentClick}
            onTimeSlotClick={onTimeSlotClick}
            onAppointmentUpdate={onAppointmentUpdate}
            onAppointmentDelete={onAppointmentDelete}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Create Appointment Form Modal */}
      {showCreateForm && (
        <CreateAppointmentForm
          doctorId={doctorId}
          selectedDate={selectedDate}
          onClose={() => setShowCreateForm(false)}
          onSubmit={onAppointmentCreate}
          isLoading={isLoading}
        />
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={onAppointmentUpdate}
          onDelete={onAppointmentDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Day View Component
const DayView: React.FC<{
  date: Date;
  appointments: AppointmentDetails[];
  timeSlots: TimeSlot[];
  onAppointmentClick: (appointment: AppointmentDetails) => void;
  onTimeSlotClick: (timeSlot: TimeSlot, date: Date) => void;
  onAppointmentUpdate: (appointment: UpdateAppointmentRequest) => Promise<void>;
  onAppointmentDelete: (appointmentId: number) => Promise<void>;
  isLoading: boolean;
}> = ({
  date,
  appointments,
  timeSlots,
  onAppointmentClick,
  onTimeSlotClick,
  onAppointmentUpdate,
  onAppointmentDelete,
  isLoading
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
        <CardTitle className="text-xl font-bold">
          {date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </CardTitle>
        <CardDescription className="text-white/90">
          {appointments.length} appointments scheduled
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {timeSlots.map((slot, index) => {
            const slotAppointments = appointments.filter(apt => apt.time === slot.start);
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  slot.isAvailable
                    ? "border-[#D1F1F2] bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] hover:border-[#2EB6B0] hover:shadow-md"
                    : "border-red-200 bg-red-50 hover:border-red-300"
                )}
                onClick={() => slot.isAvailable && onTimeSlotClick(slot, date)}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#046658]" />
                  <span className="font-medium text-[#046658]">
                    {slot.start} - {slot.end}
                  </span>
                  {slot.currentAppointments && slot.currentAppointments > 0 && (
                    <Badge className="bg-[#2EB6B0] text-white">
                      {slot.currentAppointments} appointment{slot.currentAppointments > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                {slotAppointments.length > 0 ? (
                  <div className="flex gap-2">
                    {slotAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border border-[#D1F1F2] hover:shadow-md transition-shadow cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appointment);
                        }}
                      >
                        <div className="w-3 h-3 rounded-full bg-[#2EB6B0]"></div>
                        <span className="text-sm font-medium text-[#046658]">
                          {appointment.patient.first_name} {appointment.patient.last_name}
                        </span>
                        <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-[#3E4C4B]">
                    {slot.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Week View Component
const WeekView: React.FC<{
  days: Date[];
  appointments: AppointmentDetails[];
  onAppointmentClick: (appointment: AppointmentDetails) => void;
  onTimeSlotClick: (timeSlot: TimeSlot, date: Date) => void;
  onAppointmentUpdate: (appointment: UpdateAppointmentRequest) => Promise<void>;
  onAppointmentDelete: (appointmentId: number) => Promise<void>;
  isLoading: boolean;
}> = ({
  days,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  onAppointmentUpdate,
  onAppointmentDelete,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day, index) => {
        const dayAppointments = appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDate);
          return appointmentDate.toDateString() === day.toDateString();
        });
        
        return (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
              <CardTitle className="text-lg font-bold">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </CardTitle>
              <CardDescription className="text-white/90">
                {day.getDate()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-2 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-[#046658]" />
                      <span className="text-xs font-medium text-[#046658]">
                        {appointment.time}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-[#046658] truncate">
                      {appointment.patient.first_name} {appointment.patient.last_name}
                    </div>
                    <Badge className={cn("text-xs mt-1", getStatusColor(appointment.status))}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                {dayAppointments.length === 0 && (
                  <div className="text-center py-4 text-[#3E4C4B] text-sm">
                    No appointments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Month View Component
const MonthView: React.FC<{
  days: Date[];
  appointments: AppointmentDetails[];
  onAppointmentClick: (appointment: AppointmentDetails) => void;
  onTimeSlotClick: (timeSlot: TimeSlot, date: Date) => void;
  onAppointmentUpdate: (appointment: UpdateAppointmentRequest) => Promise<void>;
  onAppointmentDelete: (appointmentId: number) => Promise<void>;
  isLoading: boolean;
}> = ({
  days,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  onAppointmentUpdate,
  onAppointmentDelete,
  isLoading
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center font-semibold text-[#046658]">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const dayAppointments = appointments.filter(appointment => {
              const appointmentDate = new Date(appointment.appointmentDate);
              return appointmentDate.toDateString() === day.toDateString();
            });
            
            const isCurrentMonth = day.getMonth() === new Date().getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={cn(
                  "min-h-24 p-2 border border-[#D1F1F2] rounded-lg cursor-pointer hover:bg-[#D1F1F2] transition-colors",
                  !isCurrentMonth && "text-gray-400 bg-gray-50",
                  isToday && "bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white"
                )}
                onClick={() => onTimeSlotClick({ start: '09:00', end: '17:00', isAvailable: true }, day)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-white" : "text-[#046658]"
                )}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="text-xs p-1 bg-white rounded border border-[#D1F1F2] truncate cursor-pointer hover:shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    >
                      {appointment.time} - {appointment.patient.first_name}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-[#3E4C4B]">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get status color (moved outside component)
const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Create Appointment Form Component
const CreateAppointmentForm: React.FC<{
  doctorId: string;
  selectedDate: Date;
  onClose: () => void;
  onSubmit: (appointment: CreateAppointmentRequest) => Promise<void>;
  isLoading: boolean;
}> = ({ doctorId, selectedDate, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    doctorId,
    patientId: '',
    appointmentDate: selectedDate.toISOString(),
    time: '09:00',
    type: 'CONSULTATION',
    duration: 30,
    priority: 'MEDIUM',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
          <CardTitle>Create New Appointment</CardTitle>
          <CardDescription className="text-white/90">
            Schedule a new appointment
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#046658] mb-1">
                Patient ID
              </label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#046658] mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.appointmentDate.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, appointmentDate: new Date(e.target.value).toISOString() })}
                className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#046658] mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#046658] mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                required
              >
                {APPOINTMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#046658] mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="15"
                max="480"
                className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#046658] mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                required
              >
                {PRIORITY_LEVELS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#046658] mb-1">
                Reason (optional)
              </label>
              <textarea
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white hover:from-[#034a4a] hover:to-[#259a9a]"
              >
                {isLoading ? 'Creating...' : 'Create Appointment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Appointment Details Modal Component
const AppointmentDetailsModal: React.FC<{
  appointment: AppointmentDetails;
  onClose: () => void;
  onUpdate: (appointment: UpdateAppointmentRequest) => Promise<void>;
  onDelete: (appointmentId: number) => Promise<void>;
  isLoading: boolean;
}> = ({ appointment, onClose, onUpdate, onDelete, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateAppointmentRequest>({
    appointmentId: appointment.id,
    appointmentDate: appointment.appointmentDate.toISOString(),
    time: appointment.time,
    type: appointment.type,
    reason: appointment.reason,
    note: appointment.note,
    status: appointment.status,
  });

  const handleUpdate = async () => {
    await onUpdate(editData);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      await onDelete(appointment.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription className="text-white/90">
                {appointment.patient.first_name} {appointment.patient.last_name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#046658] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editData.appointmentDate?.split('T')[0]}
                    onChange={(e) => setEditData({ ...editData, appointmentDate: new Date(e.target.value).toISOString() })}
                    className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#046658] mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                    className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#046658] mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#046658] mb-1">
                  Status
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                  className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                >
                  <option value="PENDING">Pending</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#046658] mb-1">
                  Reason
                </label>
                <textarea
                  value={editData.reason || ''}
                  onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                  className="w-full p-2 border border-[#D1F1F2] rounded-lg focus:border-[#2EB6B0] focus:outline-none"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white hover:from-[#034a4a] hover:to-[#259a9a]"
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-[#046658]">Patient</h4>
                  <p className="text-[#3E4C4B]">
                    {appointment.patient.first_name} {appointment.patient.last_name}
                  </p>
                  <p className="text-sm text-[#3E4C4B]">{appointment.patient.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#046658]">Doctor</h4>
                  <p className="text-[#3E4C4B]">{appointment.doctor.name}</p>
                  <p className="text-sm text-[#3E4C4B]">{appointment.doctor.specialization}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-[#046658]">Date & Time</h4>
                  <p className="text-[#3E4C4B]">
                    {appointment.appointmentDate.toLocaleDateString()} at {appointment.time}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#046658]">Status</h4>
                  <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#046658]">Type</h4>
                <p className="text-[#3E4C4B]">{appointment.type}</p>
              </div>
              
              {appointment.reason && (
                <div>
                  <h4 className="font-semibold text-[#046658]">Reason</h4>
                  <p className="text-[#3E4C4B]">{appointment.reason}</p>
                </div>
              )}
              
              {appointment.note && (
                <div>
                  <h4 className="font-semibold text-[#046658]">Notes</h4>
                  <p className="text-[#3E4C4B]">{appointment.note}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

