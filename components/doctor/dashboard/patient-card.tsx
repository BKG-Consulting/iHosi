import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Patient } from '@/types/doctor-dashboard';

interface PatientCardProps {
  patient: Patient;
  onView?: (patient: Patient) => void;
}

export function PatientCard({ patient, onView }: PatientCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-white/50">
      <Avatar className="h-10 w-10">
        <AvatarImage src={patient.img} />
        <AvatarFallback>
          {patient.first_name[0]}{patient.last_name[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {patient.first_name} {patient.last_name}
        </div>
        <div className="text-sm text-gray-600">{patient.phone}</div>
      </div>
      {onView && (
        <Button size="sm" variant="outline" onClick={() => onView(patient)}>
          <Eye className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}


