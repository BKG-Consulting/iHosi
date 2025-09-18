import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { AISchedulingIntegrationService } from '@/lib/ai-scheduling/integration-service';
import { notificationService } from '@/lib/notifications';
import { SchedulingStrategy } from '@/lib/email-scheduler';

// Validation schema for appointment actions
const appointmentActionSchema = z.object({
  appointmentId: z.number().min(1, 'Appointment ID is required'),
  action: z.enum(['ACCEPT', 'REJECT', 'RESCHEDULE']),
  aiSuggestedTime: z.string().optional(),
  enableAI: z.boolean().optional().default(true),
  reason: z.string().optional(),
  newDate: z.string().optional(),
  newTime: z.string().optional(),
});

// POST /api/appointments/action - Handle appointment actions with AI
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = sessionResult.user;
    const body = await request.json();
    
    // Validate request
    const validatedData = appointmentActionSchema.parse(body);
    
    // Get the appointment with patient and doctor details
    const appointment = await db.appointment.findUnique({
      where: { id: validatedData.appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 });
    }

    // Check if user has permission to act on this appointment
    if (user.role !== 'ADMIN' && user.id !== appointment.doctor_id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to perform this action'
      }, { status: 403 });
    }

    let result;
    let aiInsights;

    switch (validatedData.action) {
      case 'ACCEPT':
        result = await handleAcceptAppointment(appointment, validatedData, user);
        break;
      case 'REJECT':
        result = await handleRejectAppointment(appointment, validatedData, user);
        break;
      case 'RESCHEDULE':
        result = await handleRescheduleAppointment(appointment, validatedData, user);
        break;
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }

    // Log audit trail
    await logAudit({
      action: validatedData.action,
      resourceType: 'APPOINTMENT',
      resourceId: appointment.id.toString(),
      reason: `Appointment ${validatedData.action.toLowerCase()} by doctor`,
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        action: validatedData.action,
        aiEnabled: validatedData.enableAI,
        aiInsights: aiInsights
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error handling appointment action:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process appointment action',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle accepting an appointment
async function handleAcceptAppointment(appointment: any, data: any, user: any) {
  try {
    let updatedAppointment;
    let aiInsights;

    if (data.enableAI && data.aiSuggestedTime) {
      // Use AI to optimize the appointment time
      const aiResult = await AISchedulingIntegrationService.createAppointmentWithAI({
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        appointmentDate: appointment.appointment_date.toISOString(),
        time: data.aiSuggestedTime,
        type: appointment.type,
        reason: appointment.reason,
        note: appointment.note,
        enableAI: true
      });

      if (aiResult.success) {
        // Update appointment with AI-optimized time
        updatedAppointment = await db.appointment.update({
          where: { id: appointment.id },
          data: {
            status: 'SCHEDULED',
            time: data.aiSuggestedTime,
            ai_confidence_score: aiResult.aiInsights?.confidence,
            ai_suggestions: aiResult.aiInsights?.suggestions,
            auto_scheduled: true
          },
          include: {
            patient: true,
            doctor: true,
          },
        });

        aiInsights = aiResult.aiInsights;
      } else {
        // Fallback to standard acceptance
        updatedAppointment = await db.appointment.update({
          where: { id: appointment.id },
          data: { status: 'SCHEDULED' },
          include: {
            patient: true,
            doctor: true,
          },
        });
      }
    } else {
      // Standard acceptance without AI
      updatedAppointment = await db.appointment.update({
        where: { id: appointment.id },
        data: { status: 'SCHEDULED' },
        include: {
          patient: true,
          doctor: true,
        },
      });
    }

    // Send confirmation notification
    await sendAppointmentConfirmation(updatedAppointment);

    return {
      success: true,
      message: 'Appointment accepted successfully',
      data: updatedAppointment,
      aiInsights
    };

  } catch (error) {
    console.error('Error accepting appointment:', error);
    throw error;
  }
}

// Handle rejecting an appointment
async function handleRejectAppointment(appointment: any, data: any, user: any) {
  try {
    const updatedAppointment = await db.appointment.update({
      where: { id: appointment.id },
      data: { 
        status: 'CANCELLED',
        reason: data.reason || 'Appointment rejected by doctor'
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Send rejection notification
    await sendAppointmentRejection(updatedAppointment, data.reason);

    return {
      success: true,
      message: 'Appointment rejected successfully',
      data: updatedAppointment
    };

  } catch (error) {
    console.error('Error rejecting appointment:', error);
    throw error;
  }
}

// Handle rescheduling an appointment
async function handleRescheduleAppointment(appointment: any, data: any, user: any) {
  try {
    if (!data.newDate || !data.newTime) {
      return {
        success: false,
        message: 'New date and time are required for rescheduling'
      };
    }

    let updatedAppointment;
    let aiInsights;

    if (data.enableAI) {
      // Use AI to optimize rescheduling
      const aiResult = await AISchedulingIntegrationService.autoRescheduleWithAI(
        appointment.id,
        data.reason || 'Rescheduled by doctor'
      );

      if (aiResult.success) {
        updatedAppointment = aiResult.data;
        aiInsights = aiResult.aiInsights;
      } else {
        // Fallback to manual rescheduling
        updatedAppointment = await db.appointment.update({
          where: { id: appointment.id },
          data: {
            appointment_date: new Date(data.newDate),
            time: data.newTime,
            reason: data.reason || 'Rescheduled by doctor'
          },
          include: {
            patient: true,
            doctor: true,
          },
        });
      }
    } else {
      // Manual rescheduling
      updatedAppointment = await db.appointment.update({
        where: { id: appointment.id },
        data: {
          appointment_date: new Date(data.newDate),
          time: data.newTime,
          reason: data.reason || 'Rescheduled by doctor'
        },
        include: {
          patient: true,
          doctor: true,
        },
      });
    }

    // Send rescheduling notification
    await sendAppointmentRescheduling(updatedAppointment, data.reason);

    return {
      success: true,
      message: 'Appointment rescheduled successfully',
      data: updatedAppointment,
      aiInsights
    };

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
}

// Send appointment confirmation notification
async function sendAppointmentConfirmation(appointment: any) {
  try {
    await notificationService.sendTemplateNotification(
      'appointment-confirmed-email',
      {
        recipientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
        recipientEmail: appointment.patient.email,
        recipientPhone: appointment.patient.phone,
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
  } catch (error) {
    console.error('Error sending confirmation notification:', error);
  }
}

// Send appointment rejection notification
async function sendAppointmentRejection(appointment: any, reason?: string) {
  try {
    await notificationService.sendTemplateNotification(
      'appointment-cancelled-email',
      {
        recipientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
        recipientEmail: appointment.patient.email,
        recipientPhone: appointment.patient.phone,
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
        websiteUrl: 'https://healthcare.com',
        cancellationReason: reason || 'Appointment rejected by doctor'
      },
      SchedulingStrategy.IMMEDIATE
    );
  } catch (error) {
    console.error('Error sending rejection notification:', error);
  }
}

// Send appointment rescheduling notification
async function sendAppointmentRescheduling(appointment: any, reason?: string) {
  try {
    await notificationService.sendTemplateNotification(
      'appointment-rescheduled-email',
      {
        recipientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
        recipientEmail: appointment.patient.email,
        recipientPhone: appointment.patient.phone,
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
        websiteUrl: 'https://healthcare.com',
        reschedulingReason: reason || 'Appointment rescheduled by doctor'
      },
      SchedulingStrategy.IMMEDIATE
    );
  } catch (error) {
    console.error('Error sending rescheduling notification:', error);
  }
}

