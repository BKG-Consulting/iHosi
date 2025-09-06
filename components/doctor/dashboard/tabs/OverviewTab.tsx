import React from 'react';
import { StatCard } from '../StatCard';
import { UrgentAlerts } from '../UrgentAlerts';
import { TodaySchedule } from '../TodaySchedule';
import { NextAppointment } from '../NextAppointment';
import { 
  Calendar, 
  Users, 
  FileText, 
  Activity,
  AlertTriangle 
} from 'lucide-react';
import { 
  Doctor, 
  Appointment, 
  Patient, 
  DashboardAnalytics, 
  UrgentAlert, 
  PatientAlert 
} from '@/types/doctor-dashboard';

interface OverviewTabProps {
  doctor: Doctor;
  appointments: Appointment[];
  patients: Patient[];
  analytics: DashboardAnalytics;
  urgentAlerts: UrgentAlert[];
  patientAlerts: PatientAlert[];
  todaySchedule: Appointment[];
  nextAppointment: Appointment | null;
  onMarkAlertAsRead: (alertId: number) => void;
  onDismissAlert: (alertId: number) => void;
  onViewAlertDetails: (alertId: number) => void;
  onViewAppointment: (appointmentId: number) => void;
  onMessagePatient: (patientId: string) => void;
  onVideoCall: (patientId: string) => void;
  onCallPatient: (patientId: string) => void;
  onViewAppointmentDetails: (appointmentId: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  doctor,
  appointments,
  patients,
  analytics,
  urgentAlerts,
  patientAlerts,
  todaySchedule,
  nextAppointment,
  onMarkAlertAsRead,
  onDismissAlert,
  onViewAlertDetails,
  onViewAppointment,
  onMessagePatient,
  onVideoCall,
  onCallPatient,
  onViewAppointmentDetails,
}) => {
  const statCards = [
    {
      title: "Today's Appointments",
      value: todaySchedule.length,
      icon: Calendar,
      description: `${todaySchedule.filter(apt => apt.status === 'COMPLETED').length} completed`,
      trend: { value: 12, isPositive: true },
      iconClassName: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Patients",
      value: patients.length,
      icon: Users,
      description: `${patients.filter(p => p.status === 'ACTIVE').length} active`,
      trend: { value: 8, isPositive: true },
      iconClassName: "bg-green-100 text-green-600",
    },
    {
      title: "Pending Reviews",
      value: patientAlerts.length,
      icon: FileText,
      description: `${patientAlerts.filter(alert => alert.priority === 'HIGH').length} high priority`,
      trend: { value: -5, isPositive: false },
      iconClassName: "bg-orange-100 text-orange-600",
    },
    {
      title: "Availability",
      value: doctor.availability_status || 'Available',
      icon: Activity,
      description: nextAppointment ? `Next: ${nextAppointment.time}` : 'No upcoming appointments',
      iconClassName: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            description={card.description}
            trend={card.trend}
            iconClassName={card.iconClassName}
          />
        ))}
      </div>

      {/* Urgent Alerts */}
      {urgentAlerts.length > 0 && (
        <UrgentAlerts
          alerts={urgentAlerts}
          onMarkAsRead={onMarkAlertAsRead}
          onDismiss={onDismissAlert}
          onViewDetails={onViewAlertDetails}
        />
      )}

      {/* Today's Schedule & Next Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaySchedule
          appointments={todaySchedule}
          onViewAppointment={onViewAppointment}
          onMessagePatient={onMessagePatient}
          onVideoCall={onVideoCall}
        />
        
        <NextAppointment
          appointment={nextAppointment}
          onMessagePatient={onMessagePatient}
          onVideoCall={onVideoCall}
          onCallPatient={onCallPatient}
          onViewDetails={onViewAppointmentDetails}
        />
      </div>

      {/* Patient Alerts & Reminders */}
      {patientAlerts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Patient Alerts & Reminders</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.priority === 'HIGH' ? 'bg-red-500' : 
                    alert.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{alert.patient}</p>
                    <p className="text-sm text-gray-500">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                    alert.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {alert.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


