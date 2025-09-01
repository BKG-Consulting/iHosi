"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import db from "@/lib/db";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { AppointmentStatus } from "@prisma/client";
import { notificationService } from "@/lib/notifications";
import { reminderScheduler } from "@/lib/reminder-scheduler";
import { logAudit } from "@/lib/audit";

export async function createNewAppointment(data: any) {
  try {
    const validatedData = AppointmentSchema.safeParse(data);

    if (!validatedData.success) {
      return { success: false, msg: "Invalid data" };
    }
    const validated = validatedData.data;

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: validated.doctor_id,
        time: validated.time,
        type: validated.type,
        appointment_date: new Date(validated.appointment_date),
        note: validated.note,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Send notifications
    try {
      await notificationService.sendAppointmentBookedNotification(appointment);
      console.log(`✅ Notifications sent for appointment ${appointment.id}`);
    } catch (notificationError) {
      console.error(`Failed to send notifications for appointment ${appointment.id}:`, notificationError);
      // Don't fail the appointment creation if notifications fail
    }

    // Schedule reminders
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
      message: "Appointment booked successfully",
      appointmentId: appointment.id,
    };
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function appointmentAction(
  id: string | number,
  status: AppointmentStatus,
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
    const updatedAppointment = await db.appointment.update({
      where: { id: Number(id) },
      data: {
        status,
        reason,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Handle notifications based on status change
    try {
      if (status === 'CANCELLED') {
        // Cancel all scheduled reminders
        await reminderScheduler.cancelAppointmentReminders(appointment.id);
        
        // Send cancellation notification
        await notificationService.sendAppointmentCancellationNotification(updatedAppointment);
        console.log(`✅ Cancellation notifications sent for appointment ${appointment.id}`);
      }
      
      // For other status changes, you might want to send different notifications
      // e.g., when appointment is confirmed, rescheduled, etc.
      
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
    const { userId } = await auth();

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
        resourceType: 'VITAL_SIGNS',
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
    const { userId } = await auth();
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
    const { userId } = await auth();
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

    // Send rescheduling notification
    try {
      await notificationService.sendNotification({
        type: 'APPOINTMENT_RESCHEDULED',
        channel: 'EMAIL',
        priority: 'MEDIUM',
        recipientId: updatedAppointment.patient_id,
        recipientType: 'PATIENT',
        appointmentId: updatedAppointment.id,
        patientId: updatedAppointment.patient_id,
        doctorId: updatedAppointment.doctor_id,
        scheduledFor: updatedAppointment.appointment_date,
        metadata: {
          patientName: `${updatedAppointment.patient.first_name} ${updatedAppointment.patient.last_name}`,
          appointmentType: updatedAppointment.type,
          appointmentDate: newDate,
          appointmentTime: newTime,
          doctorName: updatedAppointment.doctor.name,
          location: 'Main Clinic',
          clinicName: 'Healthcare System',
          previousDate: currentAppointment.appointment_date.toDateString(),
          previousTime: currentAppointment.time
        }
      });
    } catch (notificationError) {
      console.error(`Failed to send rescheduling notification:`, notificationError);
    }

    // Schedule new reminders
    try {
      await reminderScheduler.scheduleAppointmentReminders(updatedAppointment);
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
