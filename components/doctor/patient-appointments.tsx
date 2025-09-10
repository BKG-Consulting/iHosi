"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  User, 
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  type: string;
  notes?: string;
  requirements?: string;
  doctor: {
    name: string;
    specialization: string;
  };
}

interface PatientAppointmentsProps {
  readonly patientId: string;
}

export function PatientAppointments({ patientId }: PatientAppointmentsProps) {
  // Mock data - in a real implementation, this would come from props or API
  const appointments: Appointment[] = [
    {
      id: '1',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'COMPLETED',
      type: 'Follow-up',
      notes: 'Patient responded well to treatment',
      doctor: {
        name: 'Dr. Smith',
        specialization: 'Cardiology'
      }
    },
    {
      id: '2',
      date: '2024-01-20',
      time: '2:30 PM',
      status: 'SCHEDULED',
      type: 'Consultation',
      requirements: 'Fasting required, bring previous test results',
      doctor: {
        name: 'Dr. Smith',
        specialization: 'Cardiology'
      }
    },
    {
      id: '3',
      date: '2024-01-10',
      time: '9:00 AM',
      status: 'CANCELLED',
      type: 'Initial Consultation',
      notes: 'Patient cancelled due to emergency',
      doctor: {
        name: 'Dr. Smith',
        specialization: 'Cardiology'
      }
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return Calendar;
      case 'COMPLETED':
        return CheckCircle;
      case 'CANCELLED':
        return XCircle;
      case 'PENDING':
        return AlertCircle;
      default:
        return Calendar;
    }
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Appointments
          </CardTitle>
          <CardDescription>
            Patient appointment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
            <p className="text-gray-600 mb-4">
              No appointments have been scheduled for this patient.
            </p>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
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
            <Calendar className="h-5 w-5 text-blue-600" />
            Appointments
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {appointments.length} appointments
            </Badge>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </div>
        <CardDescription>
          Patient appointment history and upcoming visits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const StatusIcon = getStatusIcon(appointment.status);
            
            return (
              <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className="h-4 w-4 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{appointment.type}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.date)} at {appointment.time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{appointment.doctor.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{appointment.doctor.specialization}</span>
                      </div>
                    </div>

                    {appointment.requirements && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <strong className="text-blue-800">Requirements:</strong>
                        <p className="text-blue-700 mt-1">{appointment.requirements}</p>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                        <strong className="text-gray-800">Notes:</strong>
                        <p className="text-gray-700 mt-1">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <FileText className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Appointment Statistics */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Upcoming</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {appointments.filter(apt => apt.status === 'SCHEDULED').length}
            </p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Completed</span>
            </div>
            <p className="text-lg font-bold text-green-900">
              {appointments.filter(apt => apt.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
