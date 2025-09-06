import db from "@/lib/db";
import { getMonth, format, startOfYear, endOfMonth, isToday } from "date-fns";
import { daysOfWeek } from "..";
import { PHIEncryption } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";

type AppointmentStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface Appointment {
  status: AppointmentStatus;
  appointment_date: Date;
}

function isValidStatus(status: string): status is AppointmentStatus {
  return ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"].includes(status);
}

const initializeMonthlyData = () => {
  const this_year = new Date().getFullYear();

  const months = Array.from(
    { length: getMonth(new Date()) + 1 },
    (_, index) => ({
      name: format(new Date(this_year, index), "MMM"),
      appointment: 0,
      completed: 0,
    })
  );
  return months;
};

export const processAppointments = async (appointments: Appointment[]) => {
  const monthlyData = initializeMonthlyData();

  const appointmentCounts = appointments.reduce<
    Record<AppointmentStatus, number>
  >(
    (acc, appointment) => {
      const status = appointment.status;

      const appointmentDate = appointment?.appointment_date;

      const monthIndex = getMonth(appointmentDate);

      if (
        appointmentDate >= startOfYear(new Date()) &&
        appointmentDate <= endOfMonth(new Date())
      ) {
        monthlyData[monthIndex].appointment += 1;

        if (status === "COMPLETED") {
          monthlyData[monthIndex].completed += 1;
        }
      }

      // Grouping by status
      if (isValidStatus(status)) {
        acc[status] = (acc[status] || 0) + 1;
      }

      return acc;
    },
    {
      PENDING: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }
  );

  return { appointmentCounts, monthlyData };
};

export async function getPatientDashboardStatistics(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        message: "No data found",
        data: null,
      };
    }

    const data = await db.patient.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        gender: true,
        img: true,
        colorCode: true,
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Patient data not found",
        status: 200,
        data: null,
      };
    }

    const appointments = await db.appointment.findMany({
      where: { patient_id: data?.id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            img: true,
            specialization: true,
            colorCode: true,
          },
        },
        patient: {
          select: {
            first_name: true,
            last_name: true,
            gender: true,
            date_of_birth: true,
            img: true,
            colorCode: true,
          },
        },
      },

      orderBy: { appointment_date: "desc" },
    });

    const { appointmentCounts, monthlyData } = await processAppointments(
      appointments
    );
    
    // Decrypt appointment data including doctor and patient information
    const decryptedAppointments = appointments.map(appointment => ({
      ...appointment,
      doctor: appointment.doctor ? PHIEncryption.decryptDoctorData(appointment.doctor) : null,
      patient: appointment.patient ? PHIEncryption.decryptPatientData(appointment.patient) : null
    }));
    
    const last5Records = decryptedAppointments.slice(0, 5);

    const today = daysOfWeek[new Date().getDay()];

    const availableDoctor = await db.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        img: true,
        working_days: true,
        colorCode: true,
      },
      where: {
        working_days: {
          some: {
            day: {
              equals: today,
              mode: "insensitive",
            },
          },
        },
      },
      take: 4,
    });

    // Decrypt available doctor data
    const decryptedAvailableDoctors = availableDoctor.map(doctor => 
      PHIEncryption.decryptDoctorData(doctor)
    );

    // Decrypt PHI data before returning
    const decryptedData = data ? PHIEncryption.decryptPatientData(data) : null;

    // Audit log for patient data access
    if (decryptedData) {
      await logAudit({
        action: 'READ',
        resourceType: 'PATIENT',
        resourceId: id,
        patientId: id,
        reason: 'Dashboard data access',
        phiAccessed: ['personal_info', 'contact_info'],
        metadata: {
          accessType: 'dashboard_summary'
        }
      });
    }

    return {
      success: true,
      data: decryptedData,
      appointmentCounts,
      last5Records,
      totalAppointments: appointments.length,
      availableDoctor: decryptedAvailableDoctors,
      monthlyData,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getPatientById(id: string) {
  try {
    const patient = await db.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient data not found",
        status: 200,
        data: null,
      };
    }

    // Decrypt PHI data before returning
    const decryptedPatient = PHIEncryption.decryptPatientData(patient);

    // Log audit trail for patient data access
    await logAudit({
      action: 'READ',
      resourceType: 'PATIENT',
      resourceId: id,
      patientId: id,
      reason: 'Patient data retrieval',
      phiAccessed: ['personal_info', 'contact_info', 'medical_info'],
      metadata: {
        accessType: 'patient_lookup'
      }
    });

    return { success: true, data: decryptedPatient, status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getPatientFullDataById(id: string) {
  try {
    const patient = await db.patient.findFirst({
      where: {
        OR: [
          {
            id,
          },
          { email: id },
        ],
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
        appointments: {
          select: {
            appointment_date: true,
          },
          orderBy: {
            appointment_date: "desc",
          },
          take: 1,
        },
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient data not found",
        status: 404,
      };
    }
    const lastVisit = patient.appointments[0]?.appointment_date || null;

    // Decrypt PHI data before returning
    const decryptedPatient = PHIEncryption.decryptPatientData(patient);

    // Log audit trail for patient data access
    await logAudit({
      action: 'READ',
      resourceType: 'PATIENT',
      resourceId: id,
      patientId: patient.id,
      reason: 'Full patient data access',
      phiAccessed: ['personal_info', 'contact_info', 'medical_info', 'appointment_history'],
      metadata: {
        accessType: 'full_patient_profile',
        lastVisit: lastVisit
      }
    });

    return {
      success: true,
      data: {
        ...decryptedPatient,
        totalAppointments: patient._count.appointments,
        lastVisit,
      },
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getAllPatients({
  page,
  limit,
  search,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const [patients, totalRecords] = await Promise.all([
      db.patient.findMany({
        where: {
          OR: [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        include: {
          appointments: {
            select: {
              medical: {
                select: { created_at: true, treatment_plan: true },
                orderBy: { created_at: "desc" },
                take: 1,
              },
            },
            orderBy: { appointment_date: "desc" },
            take: 1,
          },
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { first_name: "asc" },
      }),
      db.patient.count(),
    ]);

    // Decrypt PHI data for all patients
    const decryptedPatients = patients.map(patient => PHIEncryption.decryptPatientData(patient));

    const totalPages = Math.ceil(totalRecords / LIMIT);

    // Log audit trail for bulk patient access
    await logAudit({
      action: 'READ',
      resourceType: 'PATIENT',
      resourceId: 'BULK_ACCESS',
      patientId: 'MULTIPLE',
      reason: 'Patient list access',
      phiAccessed: ['personal_info', 'contact_info'],
      metadata: {
        accessType: 'patient_list',
        page: PAGE_NUMBER,
        limit: LIMIT,
        search: search || 'none',
        totalPatients: patients.length
      }
    });

    return {
      success: true,
      data: decryptedPatients,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}
