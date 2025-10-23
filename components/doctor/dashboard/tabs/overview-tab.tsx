import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users as UsersIcon } from 'lucide-react';
import { AppointmentCard } from '../appointment-card';
import { PatientCard } from '../patient-card';
import { QuickActions } from '../quick-actions';
import { Appointment } from '@/types/schedule-types';
import { Patient } from '@/types/doctor-dashboard';

interface OverviewTabProps {
  todayAppointments: Appointment[];
  recentPatients: Patient[];
}

export function OverviewTab({ todayAppointments, recentPatients }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No appointments today</p>
                </div>
              ) : (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.time}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {appointment.patient?.first_name} {appointment.patient?.last_name}
                        </div>
                        <div className="text-sm text-gray-600">{appointment.type}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Recent Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <QuickActions />
    </div>
  );
}


