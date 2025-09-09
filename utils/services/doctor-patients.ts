import db from "@/lib/db";
import { PHIEncryption } from "@/lib/encryption";

export interface DoctorPatient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: Date;
  img?: string;
  colorCode?: string;
  lastAppointment?: {
    id: number;
    appointment_date: Date;
    time: string;
    status: string;
    type: string;
    reason?: string;
  };
  nextAppointment?: {
    id: number;
    appointment_date: Date;
    time: string;
    status: string;
    type: string;
    reason?: string;
  };
  totalAppointments: number;
  lastVisit: Date | null;
}

export async function getDoctorPatients(doctorId: string) {
  try {
    // Get all patients who have had appointments with this doctor
    const patientsWithAppointments = await db.appointment.findMany({
      where: {
        doctor_id: doctorId,
        status: {
          in: ['SCHEDULED', 'COMPLETED', 'PENDING']
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            gender: true,
            date_of_birth: true,
            img: true,
            colorCode: true
          }
        }
      },
      orderBy: {
        appointment_date: 'desc'
      }
    });

    // Group appointments by patient and get the most recent and next appointment
    const patientMap = new Map<string, {
      patient: any;
      appointments: any[];
      lastAppointment?: any;
      nextAppointment?: any;
    }>();

    patientsWithAppointments.forEach(apt => {
      const patientId = apt.patient.id;
      
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patient: apt.patient,
          appointments: []
        });
      }
      
      const patientData = patientMap.get(patientId)!;
      patientData.appointments.push(apt);
    });

    // Process each patient to find last and next appointments
    const doctorPatients: DoctorPatient[] = [];
    
    for (const [patientId, data] of patientMap) {
      const { patient, appointments } = data;
      
      // Sort appointments by date
      const sortedAppointments = appointments.sort((a, b) => 
        new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
      );
      
      const now = new Date();
      const pastAppointments = sortedAppointments.filter(apt => 
        new Date(apt.appointment_date) < now && apt.status === 'COMPLETED'
      );
      const futureAppointments = sortedAppointments.filter(apt => 
        new Date(apt.appointment_date) >= now && apt.status === 'SCHEDULED'
      );
      
      const lastAppointment = pastAppointments.length > 0 ? pastAppointments[pastAppointments.length - 1] : null;
      const nextAppointment = futureAppointments.length > 0 ? futureAppointments[0] : null;
      
      // Decrypt patient data
      const decryptedPatient = PHIEncryption.decryptPatientData(patient);
      
      doctorPatients.push({
        id: decryptedPatient.id,
        first_name: decryptedPatient.first_name,
        last_name: decryptedPatient.last_name,
        email: decryptedPatient.email,
        phone: decryptedPatient.phone,
        gender: decryptedPatient.gender,
        date_of_birth: decryptedPatient.date_of_birth,
        img: decryptedPatient.img,
        colorCode: decryptedPatient.colorCode,
        lastAppointment: lastAppointment ? {
          id: lastAppointment.id,
          appointment_date: lastAppointment.appointment_date,
          time: lastAppointment.time,
          status: lastAppointment.status,
          type: lastAppointment.type,
          reason: lastAppointment.reason
        } : undefined,
        nextAppointment: nextAppointment ? {
          id: nextAppointment.id,
          appointment_date: nextAppointment.appointment_date,
          time: nextAppointment.time,
          status: nextAppointment.status,
          type: nextAppointment.type,
          reason: nextAppointment.reason
        } : undefined,
        totalAppointments: appointments.length,
        lastVisit: lastAppointment ? lastAppointment.appointment_date : null
      });
    }

    // Sort patients by most recent activity (last appointment or next appointment)
    doctorPatients.sort((a, b) => {
      const aDate = a.nextAppointment?.appointment_date || a.lastVisit || new Date(0);
      const bDate = b.nextAppointment?.appointment_date || b.lastVisit || new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return {
      success: true,
      data: doctorPatients,
      total: doctorPatients.length
    };
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return {
      success: false,
      error: 'Failed to fetch patients',
      data: [],
      total: 0
    };
  }
}
