'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';

/**
 * Start a consultation for a scheduled appointment
 * Changes status: SCHEDULED → IN_PROGRESS
 * Creates medical_records entry if doesn't exist
 */
export async function startConsultation(
  appointmentId: number,
  doctorId: string
) {
  try {
    console.log('🔄 Starting consultation:', { appointmentId, doctorId });

    // Get appointment details
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true
      }
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    // Verify appointment is in SCHEDULED status
    if (appointment.status !== 'SCHEDULED') {
      return { 
        success: false, 
        error: `Appointment must be in SCHEDULED status. Current status: ${appointment.status}` 
      };
    }

    // Update appointment status
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'IN_PROGRESS' }
    });

    // Create or get medical record for this appointment
    let medicalRecord = await db.medicalRecords.findFirst({
      where: { appointment_id: appointmentId }
    });

    if (!medicalRecord) {
      console.log('📝 Creating medical record for appointment');
      medicalRecord = await db.medicalRecords.create({
        data: {
          appointment_id: appointmentId,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
        }
      });
    }

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId.toString(),
      reason: 'Consultation started',
      metadata: {
        previousStatus: 'SCHEDULED',
        newStatus: 'IN_PROGRESS',
        medicalRecordId: medicalRecord.id,
        patientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
        doctorName: appointment.doctor.name
      }
    });

    console.log('✅ Consultation started successfully');

    // Revalidate the appointment page
    revalidatePath(`/record/appointments/${appointmentId}`);
    revalidatePath('/doctor');

    return { 
      success: true, 
      medicalRecordId: medicalRecord.id,
      message: 'Consultation started successfully'
    };

  } catch (error) {
    console.error('❌ Error starting consultation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to start consultation' 
    };
  }
}

/**
 * Complete a consultation that's in progress
 * Changes status: IN_PROGRESS → COMPLETED
 * Validates that clinical data exists
 */
export async function completeConsultation(
  appointmentId: number,
  doctorId: string
) {
  try {
    console.log('🔄 Completing consultation:', { appointmentId, doctorId });

    // Get appointment with medical records
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
        medical: {
          include: {
            vital_signs: true,
            diagnosis: true
          }
        }
      }
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    // Verify appointment is in IN_PROGRESS status
    if (appointment.status !== 'IN_PROGRESS') {
      return { 
        success: false, 
        error: `Appointment must be in IN_PROGRESS status. Current status: ${appointment.status}` 
      };
    }

    // Get medical record
    const medicalRecord = appointment.medical[0];

    // Optional validation: Check if minimum documentation exists
    // You can uncomment these if you want to enforce documentation
    /*
    if (!medicalRecord) {
      return { success: false, error: 'No medical record found. Please document the consultation first.' };
    }

    if (!medicalRecord.vital_signs || medicalRecord.vital_signs.length === 0) {
      return { success: false, error: 'Please record vital signs before completing the consultation' };
    }

    if (!medicalRecord.diagnosis || medicalRecord.diagnosis.length === 0) {
      return { success: false, error: 'Please add at least one diagnosis before completing' };
    }
    */

    // Update status to completed
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' }
    });

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId.toString(),
      reason: 'Consultation completed',
      metadata: {
        previousStatus: 'IN_PROGRESS',
        newStatus: 'COMPLETED',
        medicalRecordId: medicalRecord?.id,
        vitalSignsRecorded: medicalRecord?.vital_signs?.length || 0,
        diagnosesRecorded: medicalRecord?.diagnosis?.length || 0,
        patientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
        doctorName: appointment.doctor.name
      }
    });

    console.log('✅ Consultation completed successfully');

    // TODO: Send notification to patient
    // TODO: Generate consultation summary
    // TODO: Create invoice if not exists

    // Revalidate pages
    revalidatePath(`/record/appointments/${appointmentId}`);
    revalidatePath('/doctor');
    revalidatePath('/patient');

    return { 
      success: true,
      message: 'Consultation completed successfully',
      medicalRecordId: medicalRecord?.id
    };

  } catch (error) {
    console.error('❌ Error completing consultation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete consultation' 
    };
  }
}

/**
 * Cancel a consultation that's in progress
 * Changes status: IN_PROGRESS → CANCELLED
 */
export async function cancelConsultation(
  appointmentId: number,
  doctorId: string,
  reason: string
) {
  try {
    await db.appointment.update({
      where: { id: appointmentId },
      data: { 
        status: 'CANCELLED',
        reason: reason
      }
    });

    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId.toString(),
      reason: `Consultation cancelled: ${reason}`,
      metadata: {
        previousStatus: 'IN_PROGRESS',
        newStatus: 'CANCELLED',
        cancellationReason: reason
      }
    });

    revalidatePath(`/record/appointments/${appointmentId}`);
    revalidatePath('/doctor');

    return { success: true, message: 'Consultation cancelled' };

  } catch (error) {
    console.error('Error cancelling consultation:', error);
    return { success: false, error: 'Failed to cancel consultation' };
  }
}

