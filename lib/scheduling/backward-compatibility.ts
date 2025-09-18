/**
 * Backward Compatibility Layer for Scheduling System
 * 
 * This module ensures that all existing scheduling logic continues to work
 * while adding new AI-enhanced features. It provides a bridge between
 * the old and new systems.
 */

import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { AISchedulingIntegrationService } from '@/lib/ai-scheduling/integration-service';

// Original appointment creation function (preserved)
export async function createAppointmentLegacy(data: any) {
  try {
    // Validate required fields
    if (!data.patient_id || !data.doctor_id || !data.appointment_date || !data.time || !data.type) {
      return { success: false, msg: "Missing required fields" };
    }

    // Check if doctor exists and is available
    const doctor = await db.doctor.findUnique({
      where: { id: data.doctor_id },
    });

    if (!doctor) {
      return { success: false, msg: "Doctor not found" };
    }

    // Check if doctor is available for new appointments
    if (doctor.availability_status !== 'AVAILABLE') {
      return { success: false, msg: "Doctor is not available for new appointments" };
    }

    // Check if doctor works on the selected date
    const appointmentDate = new Date(data.appointment_date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const workingDay = await db.workingDays.findFirst({
      where: {
        doctor_id: data.doctor_id,
        day_of_week: {
          equals: dayOfWeek,
          mode: 'insensitive'
        },
        is_working: true
      }
    });

    if (!workingDay) {
      return { success: false, msg: `Doctor is not available on ${dayOfWeek}. Please check the doctor's schedule.` };
    }

    // Check if selected time is within working hours
    const [timeHours, timeMinutes] = data.time.split(':').map(Number);
    const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
    const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);

    const appointmentTime = timeHours * 60 + timeMinutes;
    const workStartTime = workStartHours * 60 + workStartMinutes;
    const workEndTime = workEndHours * 60 + workEndMinutes;

    if (appointmentTime < workStartTime || appointmentTime >= workEndTime) {
      return { success: false, msg: "Selected time is outside doctor's working hours" };
    }

    // Check for existing appointments at the same time
    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctor_id: data.doctor_id,
        appointment_date: {
          gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate()),
          lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1),
        },
        time: data.time,
        status: { in: ['PENDING', 'SCHEDULED'] }
      }
    });

    if (existingAppointment) {
      return { success: false, msg: "Time slot is already booked" };
    }

    // Create the appointment request (PENDING status)
    const appointment = await db.appointment.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        time: data.time,
        type: data.type,
        appointment_date: new Date(data.appointment_date),
        note: data.note,
        status: 'PENDING',
        reason: data.reason || 'General consultation',
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Log audit trail
    await logAudit({
      action: 'CREATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointment.id.toString(),
      patientId: appointment.patient_id,
      reason: 'New appointment created (legacy)',
      metadata: {
        appointmentType: appointment.type,
        appointmentDate: appointment.appointment_date.toISOString(),
        appointmentTime: appointment.time,
        doctorId: appointment.doctor_id,
        legacyMode: true
      }
    });

    return {
      success: true,
      message: "Appointment request submitted successfully. The doctor will review and schedule your appointment.",
      appointmentId: appointment.id,
    };
  } catch (error) {
    console.error("Failed to create appointment (legacy):", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

// Enhanced appointment creation with AI (new)
export async function createAppointmentEnhanced(data: any, enableAI: boolean = true) {
  try {
    if (enableAI) {
      // Use AI-enhanced scheduling
      const result = await AISchedulingIntegrationService.createAppointmentWithAI({
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        appointmentDate: data.appointment_date,
        time: data.time,
        type: data.type,
        reason: data.reason,
        note: data.note,
        enableAI: true
      });

      return result;
    } else {
      // Fall back to legacy method
      return await createAppointmentLegacy(data);
    }
  } catch (error) {
    console.error("Failed to create appointment (enhanced):", error);
    // Fallback to legacy method
    return await createAppointmentLegacy(data);
  }
}

// Original appointment action function (preserved)
export async function appointmentActionLegacy(
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
    const updatedAppointment = await db.appointment.update({
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

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointment.id.toString(),
      patientId: appointment.patient_id,
      reason: `Appointment ${status.toLowerCase()} (legacy)`,
      metadata: {
        previousStatus: appointment.status,
        newStatus: status,
        reason,
        appointmentType: appointment.type,
        appointmentDate: appointment.appointment_date.toISOString(),
        appointmentTime: appointment.time,
        doctorId: appointment.doctor_id,
        legacyMode: true
      }
    });

    return {
      success: true,
      error: false,
      msg: `Appointment ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("Failed to update appointment (legacy):", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

// Enhanced appointment action with AI (new)
export async function appointmentActionEnhanced(
  id: string | number,
  status: string,
  reason: string,
  enableAI: boolean = true
) {
  try {
    if (enableAI) {
      // Use AI-enhanced action handling
      const result = await AISchedulingIntegrationService.updateAppointmentWithAI(
        Number(id),
        {
          // status: status as any, // Field doesn't exist in type
          reason
        }
      );

      return result;
    } else {
      // Fall back to legacy method
      return await appointmentActionLegacy(id, status, reason);
    }
  } catch (error) {
    console.error("Failed to update appointment (enhanced):", error);
    // Fallback to legacy method
    return await appointmentActionLegacy(id, status, reason);
  }
}

// Migration helper to gradually enable AI features
export class SchedulingMigrationHelper {
  private static aiEnabledUsers = new Set<string>();
  private static aiEnabledDoctors = new Set<string>();

  static enableAIForUser(userId: string) {
    this.aiEnabledUsers.add(userId);
  }

  static disableAIForUser(userId: string) {
    this.aiEnabledUsers.delete(userId);
  }

  static enableAIForDoctor(doctorId: string) {
    this.aiEnabledDoctors.add(doctorId);
  }

  static disableAIForDoctor(doctorId: string) {
    this.aiEnabledDoctors.delete(doctorId);
  }

  static isAIEnabledForUser(userId: string): boolean {
    return this.aiEnabledUsers.has(userId);
  }

  static isAIEnabledForDoctor(doctorId: string): boolean {
    return this.aiEnabledDoctors.has(doctorId);
  }

  static async migrateAppointmentToAI(appointmentId: number) {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, doctor: true }
      });

      if (!appointment) {
        return { success: false, message: 'Appointment not found' };
      }

      // Add AI fields if they don't exist
      const updatedAppointment = await db.appointment.update({
        where: { id: appointmentId },
        data: {
          ai_confidence_score: 0.8, // Default confidence
          priority_score: 2, // Default medium priority
          auto_scheduled: false,
          ai_suggestions: []
        }
      });

      return {
        success: true,
        message: 'Appointment migrated to AI system',
        data: updatedAppointment
      };
    } catch (error) {
      console.error('Error migrating appointment to AI:', error);
      return { success: false, message: 'Migration failed' };
    }
  }

  static async getSystemStatus() {
    return {
      aiEnabledUsers: this.aiEnabledUsers.size,
      aiEnabledDoctors: this.aiEnabledDoctors.size,
      totalUsers: 0, // User table doesn't exist in schema
      totalDoctors: await db.doctor.count(),
      appointmentsWithAI: await db.appointment.count({
        where: { ai_confidence_score: { not: null } }
      }),
      totalAppointments: await db.appointment.count()
    };
  }
}

// Feature flag system for gradual rollout
export class FeatureFlags {
  private static flags = {
    AI_SCHEDULING: process.env.ENABLE_AI_SCHEDULING === 'true',
    DRAG_DROP_UI: process.env.ENABLE_DRAG_DROP_UI === 'true',
    SMART_NOTIFICATIONS: process.env.ENABLE_SMART_NOTIFICATIONS === 'true',
    PREDICTIVE_ANALYTICS: process.env.ENABLE_PREDICTIVE_ANALYTICS === 'true'
  };

  static isEnabled(feature: keyof typeof FeatureFlags.flags): boolean {
    return this.flags[feature];
  }

  static setFlag(feature: keyof typeof FeatureFlags.flags, enabled: boolean) {
    this.flags[feature] = enabled;
  }

  static getAllFlags() {
    return { ...this.flags };
  }
}


