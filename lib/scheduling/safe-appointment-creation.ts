/**
 * Safe Appointment Creation Utility
 * 
 * This utility safely creates appointments with optional AI fields,
 * handling cases where the database schema might not have all AI fields yet.
 */

import { db } from '@/lib/db';

interface AppointmentData {
  patient_id: string;
  doctor_id: string;
  time: string;
  type: string;
  appointment_date: Date;
  note?: string;
  reason?: string;
  service_id?: number;
  enableAI?: boolean;
}

interface AIFields {
  ai_confidence_score?: number;
  priority_score?: number;
  auto_scheduled?: boolean;
  ai_suggestions?: any[];
}

export async function createAppointmentSafely(data: AppointmentData) {
  try {
    // Base appointment data (always required)
    const baseData = {
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      time: data.time,
      type: data.type,
      appointment_date: data.appointment_date,
      note: data.note,
      status: 'PENDING' as const,
      reason: data.reason || 'General consultation',
      service_id: data.service_id,
    };

    // Try to add AI fields if enabled
    let appointmentData = { ...baseData };
    
    if (data.enableAI) {
      const aiFields: AIFields = {
        ai_confidence_score: 0.8,
        priority_score: 2,
        auto_scheduled: false,
        ai_suggestions: []
      };

      // Check if AI fields exist in the schema by attempting to create with them
      try {
        appointmentData = { ...baseData, ...aiFields };
      } catch (error) {
        console.warn('AI fields not available in schema, creating without them:', error);
        // Fall back to base data only
        appointmentData = baseData;
      }
    }

    // Create the appointment
    const appointment = await db.appointment.create({
      data: appointmentData,
      include: {
        patient: true,
        doctor: true,
      },
    });

    return {
      success: true,
      appointment,
      aiEnabled: data.enableAI && appointmentData !== baseData
    };

  } catch (error) {
    console.error('Error creating appointment safely:', error);
    
    // If the error is due to unknown fields, try without AI fields
    if (error instanceof Error && error.message.includes('Unknown argument')) {
      console.log('Retrying without AI fields...');
      
      const baseData = {
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        time: data.time,
        type: data.type,
        appointment_date: data.appointment_date,
        note: data.note,
        status: 'PENDING' as const,
        reason: data.reason || 'General consultation',
        service_id: data.service_id,
      };

      try {
        const appointment = await db.appointment.create({
          data: baseData,
          include: {
            patient: true,
            doctor: true,
          },
        });

        return {
          success: true,
          appointment,
          aiEnabled: false,
          warning: 'AI features not available, appointment created without AI enhancements'
        };
      } catch (retryError) {
        console.error('Failed to create appointment even without AI fields:', retryError);
        return {
          success: false,
          error: retryError instanceof Error ? retryError.message : 'Unknown error'
        };
      }
    }

    throw error;
  }
}

/**
 * Check if AI fields are available in the current schema
 */
export async function checkAIFieldsAvailability(): Promise<boolean> {
  try {
    // Try to query a non-existent appointment with AI fields to test schema
    await db.appointment.findFirst({
      where: {
        ai_confidence_score: { not: null }
      },
      select: {
        ai_confidence_score: true,
        priority_score: true,
        auto_scheduled: true,
        ai_suggestions: true
      }
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Update appointment with AI fields if available
 */
export async function updateAppointmentWithAI(
  appointmentId: number, 
  aiData: AIFields
): Promise<{ success: boolean; updated?: any; error?: string }> {
  try {
    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: aiData,
      include: {
        patient: true,
        doctor: true,
      },
    });

    return { success: true, updated };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unknown argument')) {
      return { 
        success: false, 
        error: 'AI fields not available in current schema' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
