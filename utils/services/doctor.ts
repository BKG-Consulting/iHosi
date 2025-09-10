import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { daysOfWeek } from "..";
import { processAppointments } from "./patient";
import { PHIEncryption } from "@/lib/encryption";

export async function getDoctors(includeUnavailable: boolean = false) {
  try {
    // Build where clause based on availability
    const whereClause = includeUnavailable ? {} : {
      availability_status: 'AVAILABLE' as const
    };

    const data = await db.doctor.findMany({
      where: whereClause,
      include: {
        working_days: true
      }
    });

    // Decrypt sensitive doctor data before returning
    const decryptedData = data.map(doctor => PHIEncryption.decryptDoctorData(doctor));

    return { success: true, data: decryptedData, status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getAvailableDoctorsForBooking(selectedDate?: string, selectedTime?: string) {
  try {
    // Get doctors who are marked as available
    const doctors = await db.doctor.findMany({
      where: {
        availability_status: 'AVAILABLE' as const
      },
      include: {
        working_days: true
      }
    });

    if (!selectedDate || !selectedTime) {
      // If no specific date/time, return all available doctors
      const decryptedData = doctors.map(doctor => PHIEncryption.decryptDoctorData(doctor));
      return { success: true, data: decryptedData, status: 200 };
    }

    // Filter doctors based on their working schedule for the selected date
    const appointmentDate = new Date(selectedDate);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const availableDoctors = doctors.filter(doctor => {
      // Check if doctor works on this day
      const workingDay = doctor.working_days.find(day => 
        day.day_of_week.toLowerCase() === dayOfWeek.toLowerCase() && 
        day.is_working
      );

      if (!workingDay) return false;

      // Check if selected time is within working hours
      const [timeHours, timeMinutes] = selectedTime.split(':').map(Number);
      const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
      const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);

      const appointmentTime = timeHours * 60 + timeMinutes;
      const workStartTime = workStartHours * 60 + workStartMinutes;
      const workEndTime = workEndHours * 60 + workEndMinutes;

      return appointmentTime >= workStartTime && appointmentTime < workEndTime;
    });

    // Decrypt sensitive doctor data before returning
    const decryptedData = availableDoctors.map(doctor => PHIEncryption.decryptDoctorData(doctor));

    return { success: true, data: decryptedData, status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}
export async function getDoctorDashboardStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized", status: 401 };
    }
    const userId = user.id;

    const todayDate = new Date().getDay();
    const today = daysOfWeek[todayDate];

    const [totalPatient, totalNurses, appointments, doctors] =
      await Promise.all([
        db.patient.count(),
        db.staff.count({ where: { role: "NURSE" } }),
        db.appointment.findMany({
          where: { 
            doctor_id: userId!, 
            status: { in: ['PENDING', 'SCHEDULED'] },
            appointment_date: { gte: new Date() }
          },
          include: {
            patient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                gender: true,
                date_of_birth: true,
                colorCode: true,
                img: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                img: true,
                colorCode: true,
              },
            },
          },
          orderBy: { appointment_date: "asc" }, // Show earliest appointments first
        }),
        db.doctor.findMany({
          where: {
            working_days: {
              some: { day_of_week: { equals: today, mode: "insensitive" } },
            },
          },
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true,
            working_days: true,
          },
          take: 5,
        }),
      ]);

    // Decrypt the doctor data before returning
    const decryptedDoctors = doctors.map(doctor => PHIEncryption.decryptDoctorData(doctor));

    const { appointmentCounts, monthlyData } = await processAppointments(
      appointments
    );

    const last5Records = appointments.slice(0, 5);
    // const availableDoctors = doctors.slice(0, 5);

    return {
      totalNurses,
      totalPatient,
      appointmentCounts,
      last5Records,
      availableDoctors: decryptedDoctors,
      totalAppointment: appointments?.length,
      monthlyData,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getDoctorById(id: string) {
  try {
    const [doctor, totalAppointment] = await Promise.all([
      db.doctor.findUnique({
        where: { id },
        include: {
          working_days: true,
          appointments: {
            include: {
              patient: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  gender: true,
                  img: true,
                  colorCode: true,
                },
              },
              doctor: {
                select: {
                  name: true,
                  specialization: true,
                  img: true,
                  colorCode: true,
                },
              },
            },
            orderBy: { appointment_date: "desc" },
            take: 10,
          },
        },
      }),
      db.appointment.count({
        where: { doctor_id: id },
      }),
    ]);

    // Decrypt sensitive doctor data before returning
    const decryptedDoctor = doctor ? PHIEncryption.decryptDoctorData(doctor) : null;
    
    return { data: decryptedDoctor, totalAppointment };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getRatingById(id: string) {
  try {
    const data = await db.rating.findMany({
      where: { staff_id: id },
      include: {
        patient: { select: { last_name: true, first_name: true } },
      },
    });

    const totalRatings = data?.length;
    const sumRatings = data?.reduce((sum, el) => sum + el.rating, 0);

    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    const formattedRatings = (Math.round(averageRating * 10) / 10).toFixed(1);

    return {
      totalRatings,
      averageRating: formattedRatings,
      ratings: data,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getAllDoctors({
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

    // Build search conditions
    const searchConditions = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { specialization: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    } : {};

    const [doctors, totalRecords] = await Promise.all([
      db.doctor.findMany({
        where: searchConditions,
        include: { 
          working_days: true
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { created_at: 'desc' }
      }),
      db.doctor.count({
        where: searchConditions
      }),
    ]);

    // Decrypt sensitive doctor data before returning
    const decryptedDoctors = doctors.map(doctor => PHIEncryption.decryptDoctorData(doctor));

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data: decryptedDoctors,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.error('Error in getAllDoctors:', error);
    return { 
      success: false, 
      message: "Failed to fetch doctors", 
      data: [],
      totalRecords: 0,
      totalPages: 0,
      currentPage: 1,
      status: 500 
    };
  }
}


