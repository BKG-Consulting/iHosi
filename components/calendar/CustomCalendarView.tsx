"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Bell
} from 'lucide-react';
import { useCustomCalendar } from '@/hooks/useCustomCalendar';
import { CustomCalendarEvent } from '@/lib/custom-calendar-service';

interface CustomCalendarViewProps {
  doctorId: string;
  onEventClick?: (event: CustomCalendarEvent) => void;
  onEventCreate?: () => void;
  onEventEdit?: (event: CustomCalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
}

type ViewType = 'day' | 'week' | 'month' | 'agenda';

export const CustomCalendarView: React.FC<CustomCalendarViewProps> = ({
  doctorId,
  onEventClick,
  onEventCreate,
  onEventEdit,
  onEventDelete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    events,
    views,
    availableSlots,
    loading,
    error,
    fetchEvents,
    fetchAvailableSlots,
    deleteEvent,
    clearError,
  } = useCustomCalendar({
    doctorId,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Fetch events when date or view changes
  useEffect(() => {
    const startDate = getViewStartDate(currentDate, viewType);
    const endDate = getViewEndDate(currentDate, viewType);
    fetchEvents(startDate, endDate);
  }, [currentDate, viewType, fetchEvents]);

  // Fetch available slots for selected date
  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate, fetchAvailableSlots]);

  const getViewStartDate = (date: Date, view: ViewType): Date => {
    const start = new Date(date);
    switch (view) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        return start;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        return start;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return start;
      case 'agenda':
        start.setHours(0, 0, 0, 0);
        return start;
      default:
        return start;
    }
  };

  const getViewEndDate = (date: Date, view: ViewType): Date => {
    const end = new Date(date);
    switch (view) {
      case 'day':
        end.setHours(23, 59, 59, 999);
        return end;
      case 'week':
        end.setDate(end.getDate() - end.getDay() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
      case 'month':
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return end;
      case 'agenda':
        end.setDate(end.getDate() + 30);
        end.setHours(23, 59, 59, 999);
        return end;
      default:
        return end;
    }
  };

  const getEventsForDate = (date: Date): CustomCalendarEvent[] => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return eventDate.toDateString() === dateStr;
    });
  };

  const getEventTypeColor = (eventType: string): string => {
    switch (eventType) {
      case 'APPOINTMENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BREAK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PERSONAL':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (dateTime: string): string => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-24 gap-1">
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b border-gray-200 relative">
              <div className="text-xs text-gray-500 p-1">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {dayEvents
                .filter(event => new Date(event.start.dateTime).getHours() === hour)
                .map(event => (
                  <div
                    key={event.id}
                    className={`absolute left-1 right-1 p-1 rounded text-xs cursor-pointer hover:shadow-md transition-shadow ${getEventTypeColor(event.eventType)}`}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = getViewStartDate(currentDate, 'week');
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      return day;
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            return (
              <div key={day.toISOString()} className="border border-gray-200 rounded-lg p-2">
                <div className="text-sm font-medium mb-2">
                  {day.toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow ${getEventTypeColor(event.eventType)}`}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {formatTime(event.start.dateTime)}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const startDate = getViewStartDate(currentDate, 'month');
    const endDate = getViewEndDate(currentDate, 'month');
    const days = [];
    
    // Get first day of month and fill in previous month's days
    const firstDay = new Date(startDate);
    firstDay.setDate(1);
    const startDay = firstDay.getDay();
    
    // Add previous month's days
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - i - 1);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Add current month's days
    const currentMonth = firstDay.getMonth();
    let day = new Date(firstDay);
    while (day.getMonth() === currentMonth) {
      days.push({ date: new Date(day), isCurrentMonth: true });
      day.setDate(day.getDate() + 1);
    }
    
    // Add next month's days to fill the grid
    while (days.length % 7 !== 0) {
      days.push({ date: new Date(day), isCurrentMonth: false });
      day.setDate(day.getDate() + 1);
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-600">
              {day}
            </div>
          ))}
          {days.map(({ date, isCurrentMonth }, index) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={index}
                className={`min-h-24 border border-gray-200 rounded-lg p-1 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow ${getEventTypeColor(event.eventType)}`}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedEvents.map(event => (
          <div
            key={event.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEventClick?.(event)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getEventTypeColor(event.eventType)}>
                    {event.eventType}
                  </Badge>
                  <span className="text-sm font-medium">{event.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.attendees.length} attendees
                    </div>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventEdit?.(event);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventDelete?.(event.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderView = () => {
    switch (viewType) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'agenda':
        return renderAgendaView();
      default:
        return renderWeekView();
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error loading calendar</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Custom Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => onEventCreate?.()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                fetchEvents(startOfMonth, endOfMonth);
              }}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-medium">
              {currentDate.toLocaleDateString([], { 
                month: 'long', 
                year: 'numeric',
                ...(viewType === 'day' && { day: 'numeric' })
              })}
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading calendar...</p>
            </div>
          </div>
        ) : (
          renderView()
        )}
      </CardContent>
    </Card>
  );
};

