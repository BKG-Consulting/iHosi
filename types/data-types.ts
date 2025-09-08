// Remove Prisma imports - types are not exported from Prisma client

export type AppointmentsChartProps = {
  name: string;
  appointment: number;
  completed: number;
}[];

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  type: string;
  appointment_date: Date;
  time: string;
  status: string;
  patient: any;
  doctor: any;
};

export type AvailableDoctorProps = {
  id: string;
  name: string;
  specialization: string;
  img?: string;
  colorCode?: string;
  availability_status: string;
  working_days: {
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_working: boolean;
  }[];
}[];
