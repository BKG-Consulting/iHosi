import db from "@/lib/db";
import { getMonth, format, startOfYear, endOfMonth } from "date-fns";
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
  console.log("=== getPatientDashboardStatistics FUNCTION START ===");
  console.log("Function called with ID:", id);
  console.log("ID type:", typeof id);
  console.log("ID length:", id?.length);
  
  try {
    console.log("Entering try block...");
    
    if (!id) {
      console.log("No ID provided");
      return {
        success: false,
        message: "No data found",
        data: null,
      };
    }

    console.log("About to query database for patient with ID:", id);
    
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

    console.log("Database query completed");
    console.log("Patient data query result:", data);
    console.log("Patient data type:", typeof data);
    console.log("Patient data keys:", data ? Object.keys(data) : "null");

    if (!data) {
      console.log("Patient data not found in database");
      return {
        success: false,
        message: "Patient data not found",
        status: 200,
        data: null,
      };
    }

    console.log("=== APPOINTMENT QUERY DEBUG ===");
    console.log("Patient ID for query:", data?.id);
    console.log("Current date:", new Date().toISOString());
    console.log("Current date (local):", new Date().toLocaleDateString());
    console.log("Querying appointments for patient...");
    
    // First, let's check what appointments exist for this patient
    const allAppointments = await db.appointment.findMany({
      where: { 
        patient_id: data?.id
      },
      select: {
        id: true,
        appointment_date: true,
        status: true,
        type: true,
        time: true
      }
    });
    
    console.log("All appointments for patient:", allAppointments);
    
    // Check if any appointments are for today
    const currentDate = new Date();
    const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const todayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    
    console.log("Today start:", todayStart.toISOString());
    console.log("Today end:", todayEnd.toISOString());
    
    const todayAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= todayStart && aptDate < todayEnd;
    });
    
    console.log("Appointments for today:", todayAppointments);
    
    // Use a more flexible date range for today's appointments
    const appointments = await db.appointment.findMany({
      where: { 
        patient_id: data?.id,
        appointment_date: {
          gte: todayStart,
          lt: todayEnd
        }
      },
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
      orderBy: { appointment_date: "asc" }, // Show earliest appointments first
    });
    
    console.log("Appointments found:", appointments.length);
    console.log("Appointments data:", appointments);

    // Filter appointments by status for counting
    const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING');
    const scheduledAppointments = appointments.filter(apt => apt.status === 'SCHEDULED');
    const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED');
    const cancelledAppointments = appointments.filter(apt => apt.status === 'CANCELLED');
    
    const appointmentCounts = {
      PENDING: pendingAppointments.length,
      SCHEDULED: scheduledAppointments.length,
      COMPLETED: completedAppointments.length,
      CANCELLED: cancelledAppointments.length
    };
    
    console.log("Appointment counts:", appointmentCounts);
    
    const { monthlyData } = await processAppointments(
      appointments
    );
    
    // Decrypt appointment data including doctor and patient information
    const decryptedAppointments = appointments.map((appointment: any) => ({
      ...appointment,
      doctor: appointment.doctor ? PHIEncryption.decryptDoctorData(appointment.doctor) : null,
      patient: appointment.patient ? PHIEncryption.decryptPatientData(appointment.patient) : null
    }));
    
    const last5Records = decryptedAppointments.slice(0, 5);

    const today = daysOfWeek[new Date().getDay()];

    // Try to get available doctors, but don't fail the entire request if this fails
    type AvailableDoctor = {
      id: string;
      name: string;
      specialization: string;
      img: string | null;
      colorCode: string | null;
      availability_status: string;
      working_days: Array<{
        day_of_week: string;
        start_time: string;
        end_time: string;
        is_working: boolean;
      }>;
    };
    
    let availableDoctor: AvailableDoctor[] = [];
    try {
      availableDoctor = await db.doctor.findMany({
        select: {
          id: true,
          name: true,
          specialization: true,
          img: true,
          colorCode: true,
          availability_status: true,
          working_days: {
            where: {
              day_of_week: {
                equals: today,
                mode: "insensitive",
              },
              is_working: true,
            },
            select: {
              day_of_week: true,
              start_time: true,
              end_time: true,
              is_working: true,
            },
          },
        },
        where: {
          availability_status: 'AVAILABLE',
          working_days: {
            some: {
              day_of_week: {
                equals: today,
                mode: "insensitive",
              },
              is_working: true,
            },
          },
        },
        take: 4,
      });
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      // Continue with empty array if doctors query fails
      availableDoctor = [];
    }

    // Decrypt available doctor data
    const decryptedAvailableDoctors = availableDoctor.map((doctor) => 
      PHIEncryption.decryptDoctorData(doctor)
    );

    // Decrypt PHI data before returning
    console.log("=== DECRYPTION DEBUG ===");
    console.log("Raw patient data before decryption:", data);
    console.log("Data type:", typeof data);
    console.log("Data keys:", data ? Object.keys(data) : "null");
    
    let decryptedData = null;
    try {
      decryptedData = data ? PHIEncryption.decryptPatientData(data) : null;
      console.log("Decryption successful:", !!decryptedData);
      console.log("Decrypted data:", decryptedData);
    } catch (decryptError) {
      console.error("Decryption failed:", decryptError);
      console.error("Decryption error message:", decryptError instanceof Error ? decryptError.message : "Unknown error");
      decryptedData = null;
    }

    // Use decrypted data if available, otherwise use raw data
    const finalPatientData = decryptedData || data;

    // Audit log for patient data access
    if (finalPatientData) {
      await logAudit({
        action: 'READ',
        resourceType: 'PATIENT',
        resourceId: id,
        patientId: id,
        reason: 'Dashboard data access',
        phiAccessed: ['personal_info', 'contact_info'],
        metadata: {
          accessType: 'dashboard_summary',
          decryptionSuccessful: !!decryptedData
        }
      });
    }
    
    const finalResult = {
      success: true,
      data: finalPatientData,
      appointmentCounts,
      last5Records,
      totalAppointments: appointments.length,
      availableDoctor: decryptedAvailableDoctors,
      monthlyData,
      status: 200,
    };

    console.log("=== FINAL RESULT FROM getPatientDashboardStatistics ===");
    console.log("Success:", finalResult.success);
    console.log("Data exists:", !!finalResult.data);
    console.log("Data content:", finalResult.data);
    console.log("Appointment counts:", finalResult.appointmentCounts);
    console.log("Total appointments:", finalResult.totalAppointments);
    console.log("Available doctors count:", finalResult.availableDoctor?.length || 0);

    return finalResult;
  } catch (error) {
    console.log("=== ERROR IN getPatientDashboardStatistics ===");
    console.log("Error:", error);
    console.log("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.log("Error stack:", error instanceof Error ? error.stack : "No stack trace");
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
    const decryptedPatients = patients.map((patient: any) => PHIEncryption.decryptPatientData(patient));

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
