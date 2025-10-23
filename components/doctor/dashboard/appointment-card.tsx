import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { Appointment } from '@/types/schedule-types';

interface AppointmentCardProps {
  appointment: Appointment;
  onView?: (appointment: Appointment) => void;
}

export function AppointmentCard({ appointment, onView }: AppointmentCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-white/50">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={appointment.patient?.img} />
          <AvatarFallback>
            {appointment.patient?.first_name?.[0]}{appointment.patient?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-gray-900">
            {appointment.patient?.first_name} {appointment.patient?.last_name}
          </h4>
          <p className="text-sm text-gray-600">{appointment.type}</p>
          <p className="text-xs text-gray-500">
            {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.time}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <StatusBadge status={appointment.status} />
        
        {onView && (
          <Button size="sm" variant="outline" onClick={() => onView(appointment)}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}


