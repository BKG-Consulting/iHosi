import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MessageSquare, Video, Eye } from 'lucide-react';
import { Appointment } from '@/types/doctor-dashboard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TodayScheduleProps {
  appointments: Appointment[];
  onViewAppointment: (appointmentId: number) => void;
  onMessagePatient: (patientId: string) => void;
  onVideoCall: (patientId: string) => void;
  className?: string;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  appointments,
  onViewAppointment,
  onMessagePatient,
  onVideoCall,
  className,
}) => {
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: Appointment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'SCHEDULED':
        return 'bg-blue-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isUpcoming = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = new Date(`${appointment.appointment_date}T${appointment.time}`);
    return appointmentTime > now && appointment.status === 'SCHEDULED';
  };

  const isNext = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = new Date(`${appointment.appointment_date}T${appointment.time}`);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 30 * 60 * 1000; // Next 30 minutes
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today's Schedule ({appointments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No appointments today</p>
            <p className="text-sm">Your schedule is clear for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
                <div 
                  key={appointment.id} 
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg transition-all",
                    isNext(appointment) && "ring-2 ring-blue-500 bg-blue-50",
                    isUpcoming(appointment) && "hover:shadow-md"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn("w-3 h-3 rounded-full", getStatusDot(appointment.status))} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {appointment.patient.first_name} {appointment.patient.last_name}
                        </h3>
                        {isNext(appointment) && (
                          <Badge variant="default" className="text-xs">
                            Next
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {appointment.type}
                      </p>
                      
                      {appointment.note && (
                        <p className="text-xs text-gray-500 italic">
                          {appointment.note}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {appointment.time}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getStatusColor(appointment.status))}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewAppointment(appointment.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {appointment.status === 'SCHEDULED' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMessagePatient(appointment.patient_id)}
                            className="h-8 w-8 p-0"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onVideoCall(appointment.patient_id)}
                            className="h-8 w-8 p-0"
                          >
                            <Video className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

