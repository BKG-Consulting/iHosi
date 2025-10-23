export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  department: string;
  phone: string;
  address: string;
  img?: string;
  colorCode?: string;
  availability_status: string;
  working_days: any[];
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  img?: string;
  date_of_birth: string;
  colorCode?: string;
}

export interface Analytics {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
  cancellationRate: number;
  averageAppointmentDuration: number;
  appointmentTrends: Array<{
    date: Date;
    count: number;
  }>;
}

export type AppointmentStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
