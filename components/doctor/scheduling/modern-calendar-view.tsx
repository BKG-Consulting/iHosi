'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  Plus,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/schedule-types';

type ViewMode = 'month' | 'week' | 'day';

interface ModernCalendarViewProps {
  doctorId: string;
  appointments: Appointment[];
  onSlotClick?: (date: Date, time: string) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function ModernCalendarView({
  doctorId,
  appointments,
  onSlotClick,
  onAppointmentClick
}: ModernCalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getHourSlots = () => {
    return Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 9 PM
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const getAppointmentsForDateAndHour = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      const aptHour = parseInt(apt.time.split(':')[0]);
      return aptDate.toDateString() === date.toDateString() && aptHour === hour;
    });
  };

  const formatDateHeader = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays();
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isPast = (date: Date, hour?: number) => {
    const now = new Date();
    if (hour !== undefined) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      return slotDate < now;
    }
    return date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Month View
  const renderMonthView = () => {
    const days = getMonthDays();
    const currentMonth = currentDate.getMonth();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date);
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isTodayDate = isToday(date);
          const isPastDate = isPast(date);
          
          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] border rounded-lg p-2 transition-all",
                isCurrentMonth ? "bg-white" : "bg-gray-50",
                isTodayDate && "ring-2 ring-blue-500 bg-blue-50",
                isPastDate && "opacity-60",
                !isPastDate && "hover:shadow-md cursor-pointer"
              )}
              onClick={() => !isPastDate && setCurrentDate(new Date(date))}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isTodayDate ? "text-blue-600 font-bold" : "text-gray-700",
                  !isCurrentMonth && "text-gray-400"
                )}>
                  {date.getDate()}
                </span>
                {dayAppointments.length > 0 && (
                  <Badge variant="outline" className="text-xs px-1">
                    {dayAppointments.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt, idx) => (
                  <div
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick?.(apt);
                    }}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded truncate",
                      getStatusColor(apt.status)
                    )}
                  >
                    {apt.time} {apt.patient?.first_name}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const days = getWeekDays();
    const hours = getHourSlots();

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-2 sticky top-0 bg-white z-10 pb-2">
            <div className="text-xs font-medium text-gray-500">Time</div>
            {days.map((date, index) => (
              <div key={index} className="text-center">
                <div className={cn(
                  "text-sm font-semibold",
                  isToday(date) && "text-blue-600"
                )}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={cn(
                  "text-xs text-gray-600",
                  isToday(date) && "font-bold text-blue-600"
                )}>
                  {date.getDate()}
                </div>
                {getAppointmentsForDate(date).length > 0 && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {getAppointmentsForDate(date).length}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Time slots */}
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-xs font-medium text-gray-600 flex items-start pt-2">
                {formatTime(hour)}
              </div>
              {days.map((date, dayIndex) => {
                const slotAppointments = getAppointmentsForDateAndHour(date, hour);
                const isPastSlot = isPast(date, hour);
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                
                return (
                  <div
                    key={dayIndex}
                    onClick={() => !isPastSlot && onSlotClick?.(date, timeStr)}
                    className={cn(
                      "min-h-[60px] border-2 rounded-lg p-2 transition-all",
                      isPastSlot ? "bg-gray-50 border-gray-200 opacity-50" : "bg-white border-gray-300 hover:border-blue-400 hover:shadow cursor-pointer",
                      slotAppointments.length > 0 && "bg-blue-50 border-blue-300"
                    )}
                  >
                    {slotAppointments.map(apt => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick?.(apt);
                        }}
                        className={cn(
                          "text-xs px-2 py-1 rounded mb-1 cursor-pointer hover:opacity-80",
                          getStatusColor(apt.status)
                        )}
                      >
                        <div className="font-medium truncate">
                          {apt.patient?.first_name} {apt.patient?.last_name}
                        </div>
                        <div className="text-xs opacity-75">{apt.type}</div>
                      </div>
                    ))}
                    {slotAppointments.length === 0 && !isPastSlot && (
                      <div className="text-xs text-gray-400 text-center">
                        <Plus className="h-3 w-3 mx-auto opacity-0 group-hover:opacity-100" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const hours = getHourSlots();
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="space-y-2">
        {/* Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    {dayAppointments.length} appointments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700">
                    {dayAppointments.filter(a => a.status === 'SCHEDULED').length} scheduled
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onSlotClick?.(currentDate, '09:00')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Time slots */}
        {hours.map(hour => {
          const slotAppointments = getAppointmentsForDateAndHour(currentDate, hour);
          const isPastSlot = isPast(currentDate, hour);
          const timeStr = `${hour.toString().padStart(2, '0')}:00`;

          return (
            <Card
              key={hour}
              className={cn(
                "transition-all",
                isPastSlot && "opacity-50",
                slotAppointments.length === 0 && !isPastSlot && "hover:border-blue-400 cursor-pointer"
              )}
              onClick={() => slotAppointments.length === 0 && !isPastSlot && onSlotClick?.(currentDate, timeStr)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="min-w-[80px]">
                    <div className="text-lg font-semibold text-gray-700">
                      {formatTime(hour)}
                    </div>
                    <div className="text-xs text-gray-500">30 min</div>
                  </div>

                  {slotAppointments.length > 0 ? (
                    <div className="flex-1 space-y-2">
                      {slotAppointments.map(apt => (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(apt);
                          }}
                          className={cn(
                            "p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all",
                            getStatusColor(apt.status)
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">
                              {apt.patient?.first_name} {apt.patient?.last_name}
                            </div>
                            <Badge className={getStatusColor(apt.status)}>
                              {apt.status}
                            </Badge>
                          </div>
                          <div className="text-sm mb-1">{apt.type}</div>
                          {apt.note && (
                            <div className="text-xs opacity-75 mt-2">
                              Note: {apt.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : isPastSlot ? (
                    <div className="flex-1 flex items-center justify-center py-4 text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Time has passed
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-4 text-gray-400 hover:text-blue-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Click to schedule
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl">{formatDateHeader()}</CardTitle>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


