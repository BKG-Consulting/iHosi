"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import db from "@/lib/db";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { HIPAAAuthService } from "@/lib/auth/hipaa-auth";
import { cookies } from "next/headers";
// Remove this import - AppointmentStatus is not exported from Prisma client
import { notificationService } from "@/lib/notifications";
import { reminderScheduler } from "@/lib/reminder-scheduler";
import { logAudit } from "@/lib/audit";
import { SchedulingStrategy } from "@/lib/email-scheduler";
import { createAppointmentSafely } from "@/lib/scheduling/safe-appointment-creation";

// Helper function to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      return null;
    }

    return sessionResult.user.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

export async function createNewAppointment(data: any) {
  try {
    const validatedData = AppointmentSchema.safeParse(data);

    if (!validatedData.success) {
      return { success: false, msg: "Invalid data" };
    }
    const validated = validatedData.data;

    // Check if AI scheduling is enabled
    const enableAI = data.enableAI !== false; // Default to true unless explicitly disabled

    // Check if doctor exists and is available
    const doctor = await db.doctor.findUnique({
      where: { id: validated.doctor_id },
    });

    if (!doctor) {
      return { success: false, msg: "Doctor not found" };
    }

    // Check if doctor is available for new appointments
    // Only block if explicitly set to unavailable statuses
    const unavailableStatuses = ['UNAVAILABLE', 'ON_LEAVE', 'EMERGENCY_ONLY'];
    const willBlock = doctor.availability_status && unavailableStatuses.includes(doctor.availability_status);
    
    console.log(`👨‍⚕️ Doctor availability check:`, {
      doctorId: validated.doctor_id,
      availabilityStatus: doctor.availability_status,
      willBlock,
      unavailableStatuses
    });
    
    if (willBlock) {
      console.log(`❌ Blocking appointment - doctor status: ${doctor.availability_status}`);
      return { success: false, msg: "Doctor is not available for new appointments" };
    }
    
    console.log(`✅ Doctor availability check passed - status: ${doctor.availability_status || 'not set'}`);

    // Enhanced schedule validation using our comprehensive scheduling system
    const appointmentDate = new Date(validated.appointment_date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    console.log(`🔍 APPOINTMENT CREATION DEBUG`);
    console.log(`📋 Request details:`, {
      doctorId: validated.doctor_id,
      date: validated.appointment_date,
      time: validated.time,
      dayOfWeek,
      appointmentDate: appointmentDate.toISOString()
    });
    
    // Get doctor's comprehensive working schedule
    const workingDay = await db.workingDays.findFirst({
      where: {
        doctor_id: validated.doctor_id,
        day_of_week: {
          equals: dayOfWeek,
          mode: 'insensitive'
        },
        is_working: true
      }
    });

    console.log(`👨‍⚕️ Doctor working day lookup:`, {
      doctorId: validated.doctor_id,
      dayOfWeek,
      found: workingDay ? 'YES' : 'NO',
      workingDay: workingDay ? {
        day: workingDay.day_of_week,
        isWorking: workingDay.is_working,
        startTime: workingDay.start_time,
        endTime: workingDay.end_time,
        breakStart: workingDay.break_start_time,
        breakEnd: workingDay.break_end_time,
        appointmentDuration: workingDay.appointment_duration,
        bufferTime: workingDay.buffer_time
      } : null
    });

    if (!workingDay) {
      console.log(`❌ No working day found for ${dayOfWeek}`);
      return { success: false, msg: `Doctor is not available on ${dayOfWeek}. Please check the doctor's schedule.` };
    }

    // If doctor has a working schedule but availability_status is not set, update it
    if (!doctor.availability_status) {
      await db.doctor.update({
        where: { id: validated.doctor_id },
        data: { availability_status: 'AVAILABLE' }
      });
      console.log(`✅ Set doctor ${validated.doctor_id} as available (has working schedule)`);
    }
    
    console.log(`✅ Found working day: ${workingDay.day_of_week} (${workingDay.start_time}-${workingDay.end_time})`);

    // Enhanced time validation with break times and buffer time
    const [timeHours, timeMinutes] = validated.time.split(':').map(Number);
    const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
    const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);
    const [breakStartHours, breakStartMinutes] = workingDay.break_start_time?.split(':').map(Number) || [0, 0];
    const [breakEndHours, breakEndMinutes] = workingDay.break_end_time?.split(':').map(Number) || [0, 0];

    const appointmentTime = timeHours * 60 + timeMinutes;
    const workStartTime = workStartHours * 60 + workStartMinutes;
    const workEndTime = workEndHours * 60 + workEndMinutes;
    const breakStartTime = workingDay.break_start_time ? breakStartHours * 60 + breakStartMinutes : 0;
    const breakEndTime = workingDay.break_end_time ? breakEndHours * 60 + breakEndMinutes : 0;

    console.log(`⏰ Time validation details:`, {
      requestedTime: validated.time,
      appointmentTimeMinutes: appointmentTime,
      workStartTime: workingDay.start_time,
      workStartTimeMinutes: workStartTime,
      workEndTime: workingDay.end_time,
      workEndTimeMinutes: workEndTime,
      breakStartTime: workingDay.break_start_time,
      breakStartTimeMinutes: breakStartTime,
      breakEndTime: workingDay.break_end_time,
      breakEndTimeMinutes: breakEndTime,
      appointmentDuration: workingDay.appointment_duration,
      bufferTime: workingDay.buffer_time
    });

    // Check if time is within working hours
    if (appointmentTime < workStartTime || appointmentTime >= workEndTime) {
      return { success: false, msg: "Selected time is outside doctor's working hours" };
    }

    // Check if time conflicts with break time
    if (workingDay.break_start_time && workingDay.break_end_time && 
        appointmentTime >= breakStartTime && appointmentTime < breakEndTime) {
      return { success: false, msg: "Selected time conflicts with doctor's break time" };
    }

    // Check appointment duration and buffer time
    const appointmentDuration = workingDay.appointment_duration || 30;
    const bufferTime = workingDay.buffer_time || 5;
    const totalSlotTime = appointmentDuration + bufferTime;
    
    if (appointmentTime + totalSlotTime > workEndTime) {
      return { success: false, msg: "Selected time doesn't allow for complete appointment duration" };
    }

    // Enhanced conflict detection with buffer time consideration
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingAppointments = await db.appointment.findMany({
      where: {
        doctor_id: validated.doctor_id,
        appointment_date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { in: ['PENDING', 'SCHEDULED'] }
      },
      select: {
        time: true,
        status: true
      }
    });

    // Check for time conflicts considering buffer time
    for (const existingApt of conflictingAppointments) {
      const [existingHours, existingMinutes] = existingApt.time.split(':').map(Number);
      const existingTime = existingHours * 60 + existingMinutes;
      
      // Check if there's overlap considering buffer time
      const timeOverlap = (appointmentTime < existingTime + totalSlotTime) && 
                         (appointmentTime + totalSlotTime > existingTime);
      
      if (timeOverlap) {
        return { success: false, msg: `Time slot conflicts with existing appointment at ${existingApt.time}` };
      }
    }

    // Create the appointment request (PENDING status) using safe creation
    const appointmentResult = await createAppointmentSafely({
      patient_id: data.patient_id,
      doctor_id: validated.doctor_id,
      time: validated.time,
      type: validated.type,
      appointment_date: new Date(validated.appointment_date),
      note: validated.note,
      reason: data.reason || 'General consultation',
      enableAI: enableAI
    });

    if (!appointmentResult.success) {
      return { success: false, msg: "Failed to create appointment" };
    }

    const appointment = appointmentResult.appointment;
    if (!appointment) {
      return { success: false, msg: "Failed to create appointment - no appointment returned" };
    }

    // Send notifications using dynamic templates
    try {
      // Send immediate confirmation email using template
      const confirmationJobId = await notificationService.sendAppointmentConfirmationTemplate(
        appointment,
        SchedulingStrategy.IMMEDIATE
      );
      console.log(`✅ Appointment confirmation scheduled: ${confirmationJobId}`);
    } catch (notificationError) {
      console.error(`Failed to send notifications for appointment ${appointment.id}:`, notificationError);
      // Don't fail the appointment creation if notifications fail
    }

    // Send real-time socket notification to doctor
    try {
      const { getSocketService } = await import('@/lib/socket-server');
      const socketService = getSocketService();
      
      if (socketService) {
        await socketService.sendAppointmentRequest(validated.doctor_id, {
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
          patientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
          appointmentDate: appointment.appointment_date.toISOString().split('T')[0],
          appointmentTime: appointment.time,
          appointmentType: appointment.type,
          reason: appointment.reason || undefined,
          note: appointment.note || undefined,
          timestamp: new Date()
        });
        console.log(`✅ Real-time notification sent to doctor ${validated.doctor_id}`);
      }
    } catch (socketError) {
      console.error(`Failed to send real-time notification for appointment ${appointment.id}:`, socketError);
      // Don't fail the appointment creation if socket notifications fail
    }

    // Schedule reminders using the smart scheduler
    try {
      await reminderScheduler.scheduleAppointmentReminders(appointment);
      console.log(`✅ Reminders scheduled for appointment ${appointment.id}`);
    } catch (reminderError) {
      console.error(`Failed to schedule reminders for appointment ${appointment.id}:`, reminderError);
      // Don't fail the appointment creation if reminders fail
    }

    // Log audit trail
    try {
      await logAudit({
        action: 'CREATE',
        resourceType: 'APPOINTMENT',
        resourceId: appointment.id.toString(),
        patientId: appointment.patient_id,
        reason: 'New appointment created',
        metadata: {
          appointmentType: appointment.type,
          appointmentDate: appointment.appointment_date.toISOString(),
          appointmentTime: appointment.time,
          doctorId: appointment.doctor_id,
          notificationsSent: true,
          remindersScheduled: true
        }
      });
    } catch (auditError) {
      console.error(`Failed to log audit for appointment ${appointment.id}:`, auditError);
    }

    return {
      success: true,
      message: "Appointment request submitted successfully. The doctor will review and schedule your appointment.",
      appointmentId: appointment.id,
    };
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function appointmentAction(
  id: string | number,
  status: string,
  reason: string
) {
  try {
    // Get the appointment with patient and doctor details
    const appointment = await db.appointment.findUnique({
      where: { id: Number(id) },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return { success: false, msg: "Appointment not found" };
    }

    // Update the appointment status
    await db.appointment.update({
      where: { id: Number(id) },
      data: {
        status: status as any,
        reason,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Handle notifications based on status change using dynamic templates
    try {
      if (status === 'CANCELLED') {
        // Cancel all scheduled reminders
        await reminderScheduler.cancelAppointmentReminders(appointment.id);
        
        // Send cancellation notification using template
        await notificationService.sendTemplateNotification(
          'appointment-cancelled-email',
          {
            recipientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
            recipientEmail: `${appointment.patient.first_name.toLowerCase()}.${appointment.patient.last_name.toLowerCase()}@example.com`,
            recipientPhone: appointment.patient.phone || undefined,
            appointmentId: appointment.id.toString(),
            appointmentType: appointment.type,
            appointmentDate: appointment.appointment_date.toLocaleDateString(),
            appointmentTime: appointment.time,
            doctorName: appointment.doctor.name,
            doctorSpecialization: appointment.doctor.specialization || '',
            facilityName: 'Healthcare System',
            systemName: 'Healthcare Management System',
            supportEmail: 'support@healthcare.com',
            supportPhone: '+1-800-HEALTH',
            websiteUrl: 'https://healthcare.com'
          },
          SchedulingStrategy.IMMEDIATE
        );
        
        console.log(`✅ Cancellation notifications sent for appointment ${appointment.id}`);
      } else if (status === 'SCHEDULED') {
        // Send confirmation notification using template
        await notificationService.sendTemplateNotification(
          'appointment-confirmed-email',
          {
            recipientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
            recipientEmail: `${appointment.patient.first_name.toLowerCase()}.${appointment.patient.last_name.toLowerCase()}@example.com`,
            recipientPhone: appointment.patient.phone || undefined,
            appointmentId: appointment.id.toString(),
            appointmentType: appointment.type,
            appointmentDate: appointment.appointment_date.toLocaleDateString(),
            appointmentTime: appointment.time,
            doctorName: appointment.doctor.name,
            doctorSpecialization: appointment.doctor.specialization || '',
            facilityName: 'Healthcare System',
            systemName: 'Healthcare Management System',
            supportEmail: 'support@healthcare.com',
            supportPhone: '+1-800-HEALTH',
            websiteUrl: 'https://healthcare.com'
          },
          SchedulingStrategy.IMMEDIATE
        );
        console.log(`✅ Confirmation notifications sent for appointment ${appointment.id}`);
      }
      
      // For other status changes, you might want to send different notifications
      // e.g., when appointment is completed, rescheduled, etc.
      
    } catch (notificationError) {
      console.error(`Failed to send status change notifications for appointment ${appointment.id}:`, notificationError);
    }

    // Log audit trail
    try {
      await logAudit({
        action: 'UPDATE',
        resourceType: 'APPOINTMENT',
        resourceId: appointment.id.toString(),
        patientId: appointment.patient_id,
        reason: `Appointment ${status.toLowerCase()}`,
        metadata: {
          previousStatus: appointment.status,
          newStatus: status,
          reason,
          appointmentType: appointment.type,
          appointmentDate: appointment.appointment_date.toISOString(),
          appointmentTime: appointment.time,
          doctorId: appointment.doctor_id
        }
      });
    } catch (auditError) {
      console.error(`Failed to log audit for appointment status change ${appointment.id}:`, auditError);
    }

    return {
      success: true,
      error: false,
      msg: `Appointment ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function addVitalSigns(
  data: VitalSignsFormData,
  appointmentId: string,
  doctorId: string
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const validatedData = VitalSignsSchema.parse(data);

    let medicalRecord = null;

    if (!validatedData.medical_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patient_id: validatedData.patient_id,
          appointment_id: Number(appointmentId),
          doctor_id: doctorId,
        },
      });
    }

    const med_id = validatedData.medical_id || medicalRecord?.id;

    await db.vitalSigns.create({
      data: {
        ...validatedData,
        medical_id: Number(med_id!),
      },
    });

    // Log audit trail for vital signs addition
    try {
      await logAudit({
        action: 'CREATE',
        resourceType: 'MEDICAL_RECORD',
        resourceId: med_id?.toString() || 'unknown',
        patientId: validatedData.patient_id,
        reason: 'Vital signs recorded during appointment',
        metadata: {
          appointmentId: Number(appointmentId),
          doctorId,
          vitalSignsType: Object.keys(validatedData).filter(key => 
            key !== 'patient_id' && key !== 'medical_id'
          )
        }
      });
    } catch (auditError) {
      console.error(`Failed to log audit for vital signs:`, auditError);
    }

    return {
      success: true,
      msg: "Vital signs added successfully",
    };
  } catch (error) {
    console.error("Failed to add vital signs:", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

// New function to get appointment statistics for dashboard
export async function getAppointmentStats() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Get today's appointments
    const todayAppointments = await db.appointment.count({
      where: {
        appointment_date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get pending appointments
    const pendingAppointments = await db.appointment.count({
      where: {
        status: 'PENDING',
      },
    });

    // Get this week's appointments
    const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const weeklyAppointments = await db.appointment.count({
      where: {
        appointment_date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    // Get completed appointments this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const completedThisMonth = await db.appointment.count({
      where: {
        status: 'COMPLETED',
        appointment_date: {
          gte: monthStart,
        },
      },
    });

    return {
      success: true,
      data: {
        today: todayAppointments,
        pending: pendingAppointments,
        weekly: weeklyAppointments,
        completedThisMonth: completedThisMonth,
      },
    };
  } catch (error) {
    console.error("Failed to get appointment stats:", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

// New function to reschedule appointment
export async function rescheduleAppointment(
  appointmentId: string | number,
  newDate: string,
  newTime: string,
  reason?: string
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    // Get the current appointment
    const currentAppointment = await db.appointment.findUnique({
      where: { id: Number(appointmentId) },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!currentAppointment) {
      return { success: false, msg: "Appointment not found" };
    }

    // Cancel existing reminders
    await reminderScheduler.cancelAppointmentReminders(currentAppointment.id);

    // Update the appointment
    const updatedAppointment = await db.appointment.update({
      where: { id: Number(appointmentId) },
      data: {
        appointment_date: new Date(newDate),
        time: newTime,
        reason: reason || `Rescheduled from ${currentAppointment.appointment_date.toDateString()} at ${currentAppointment.time}`,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Send rescheduling notification using dynamic templates
    try {
      // Send email notification using template
      await notificationService.sendTemplateNotification(
        'appointment-rescheduled-email',
        {
          recipientName: `${updatedAppointment.patient.first_name} ${updatedAppointment.patient.last_name}`,
          recipientEmail: `${updatedAppointment.patient.first_name.toLowerCase()}.${updatedAppointment.patient.last_name.toLowerCase()}@example.com`,
          recipientPhone: updatedAppointment.patient.phone || undefined,
          appointmentId: updatedAppointment.id.toString(),
          appointmentType: updatedAppointment.type,
          appointmentDate: newDate,
          appointmentTime: newTime,
          doctorName: updatedAppointment.doctor.name,
          doctorSpecialization: updatedAppointment.doctor.specialization || '',
          facilityName: 'Healthcare System',
          systemName: 'Healthcare Management System',
          supportEmail: 'support@healthcare.com',
          supportPhone: '+1-800-HEALTH',
          websiteUrl: 'https://healthcare.com',
          previousDate: currentAppointment.appointment_date.toLocaleDateString(),
          previousTime: currentAppointment.time
        },
        SchedulingStrategy.IMMEDIATE
      );

      console.log(`✅ Rescheduling notifications sent for appointment ${updatedAppointment.id}`);
    } catch (notificationError) {
      console.error(`Failed to send rescheduling notification:`, notificationError);
    }

    // Schedule new reminders using the smart scheduler
    try {
      await reminderScheduler.scheduleAppointmentReminders(updatedAppointment);
      console.log(`✅ New reminders scheduled for rescheduled appointment ${updatedAppointment.id}`);
    } catch (reminderError) {
      console.error(`Failed to schedule new reminders:`, reminderError);
    }

    // Log audit trail
    try {
      await logAudit({
        action: 'UPDATE',
        resourceType: 'APPOINTMENT',
        resourceId: appointmentId.toString(),
        patientId: currentAppointment.patient_id,
        reason: 'Appointment rescheduled',
        metadata: {
          previousDate: currentAppointment.appointment_date.toISOString(),
          previousTime: currentAppointment.time,
          newDate: newDate,
          newTime: newTime,
          reason,
          appointmentType: currentAppointment.type,
          doctorId: currentAppointment.doctor_id
        }
      });
    } catch (auditError) {
      console.error(`Failed to log audit for rescheduling:`, auditError);
    }

    return {
      success: true,
      msg: "Appointment rescheduled successfully",
      appointmentId: updatedAppointment.id,
    };
  } catch (error) {
    console.error("Failed to reschedule appointment:", error);
    return { success: false, msg: "Internal Server Error" };
  }
}
