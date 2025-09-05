import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, FileText, MessageSquare, Video, Phone, MapPin } from 'lucide-react';
import { Appointment } from '@/types/doctor-dashboard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NextAppointmentProps {
  appointment: Appointment | null;
  onMessagePatient: (patientId: string) => void;
  onVideoCall: (patientId: string) => void;
  onCallPatient: (patientId: string) => void;
  onViewDetails: (appointmentId: number) => void;
  className?: string;
}

export const NextAppointment: React.FC<NextAppointmentProps> = ({
  appointment,
  onMessagePatient,
  onVideoCall,
  onCallPatient,
  onViewDetails,
  className,
}) => {
  if (!appointment) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Next Appointment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No upcoming appointments</p>
            <p className="text-sm">Your schedule is clear</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const appointmentTime = new Date(`${appointment.appointment_date}T${appointment.time}`);
  const now = new Date();
  const timeDiff = appointmentTime.getTime() - now.getTime();
  const minutesUntil = Math.floor(timeDiff / (1000 * 60));

  const getTimeStatus = () => {
    if (minutesUntil < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (minutesUntil <= 15) return { text: 'Starting soon', color: 'text-orange-600' };
    if (minutesUntil <= 60) return { text: 'Upcoming', color: 'text-blue-600' };
    return { text: 'Scheduled', color: 'text-gray-600' };
  };

  const timeStatus = getTimeStatus();

  return (
    <Card className={cn("border-l-4 border-l-blue-500", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Next Appointment
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Patient Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {appointment.patient.first_name[0]}{appointment.patient.last_name[0]}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {appointment.patient.first_name} {appointment.patient.last_name}
              </h3>
              <p className="text-sm text-gray-600">{appointment.type}</p>
            </div>
            <Badge variant="outline" className={timeStatus.color}>
              {timeStatus.text}
            </Badge>
          </div>

          {/* Appointment Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{appointment.time}</span>
              <span className="text-gray-500">
                ({minutesUntil > 0 ? `in ${minutesUntil} min` : `${Math.abs(minutesUntil)} min ago`})
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Room 101 - Consultation Room</span>
            </div>
            
            {appointment.note && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600 italic">{appointment.note}</span>
              </div>
            )}
          </div>

          {/* Patient Contact Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Phone:</span>
                <span className="ml-2 font-medium">{appointment.patient.phone}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{appointment.patient.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onMessagePatient(appointment.patient_id)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onVideoCall(appointment.patient_id)}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Video Call
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCallPatient(appointment.patient_id)}
              className="flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
            
            <Button 
              size="sm"
              onClick={() => onViewDetails(appointment.id)}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

