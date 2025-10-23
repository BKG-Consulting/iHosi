import db from '@/lib/db';
import { sendEmail } from '@/lib/email';

/**
 * Appointment Reminder Service
 * Handles scheduling and sending appointment reminders
 */
export class AppointmentReminderService {
  /**
   * Schedule reminders for a newly scheduled appointment
   * Creates reminder notifications for 24h and 1h before appointment
   */
  static async scheduleReminders(appointmentId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📅 Scheduling reminders for appointment:', appointmentId);

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

      // Calculate appointment datetime
      const appointmentDateTime = new Date(appointment.appointment_date);
      const [hours, minutes] = appointment.time.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Calculate reminder times
      const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
      const reminder1h = new Date(appointmentDateTime.getTime() - 1 * 60 * 60 * 1000);

      console.log('⏰ Reminder times calculated:', {
        appointmentTime: appointmentDateTime.toISOString(),
        reminder24h: reminder24h.toISOString(),
        reminder1h: reminder1h.toISOString()
      });

      // Only schedule if reminder time is in the future
      const now = new Date();
      const remindersToCreate = [];

      if (reminder24h > now) {
        remindersToCreate.push({
          appointment_id: appointmentId,
          recipient_id: appointment.patient_id,
          recipient_type: 'PATIENT',
          notification_type: 'REMINDER',
          title: 'Appointment Reminder - Tomorrow',
          message: `Reminder: You have an appointment with Dr. ${appointment.doctor.name} tomorrow at ${appointment.time}. Please arrive 10 minutes early.`,
          send_at: reminder24h,
          status: 'PENDING',
          channel: 'EMAIL'
        });

        // Also send reminder to doctor
        remindersToCreate.push({
          appointment_id: appointmentId,
          recipient_id: appointment.doctor_id,
          recipient_type: 'DOCTOR',
          notification_type: 'REMINDER',
          title: 'Upcoming Appointment Tomorrow',
          message: `Reminder: Appointment tomorrow at ${appointment.time} with ${appointment.patient.first_name} ${appointment.patient.last_name}. Type: ${appointment.type}`,
          send_at: reminder24h,
          status: 'PENDING',
          channel: 'EMAIL'
        });
      }

      if (reminder1h > now) {
        remindersToCreate.push({
          appointment_id: appointmentId,
          recipient_id: appointment.patient_id,
          recipient_type: 'PATIENT',
          notification_type: 'REMINDER',
          title: 'Appointment Starting Soon',
          message: `Your appointment with Dr. ${appointment.doctor.name} is in 1 hour at ${appointment.time}. Location: ${appointment.doctor.department}`,
          send_at: reminder1h,
          status: 'PENDING',
          channel: 'EMAIL'
        });
      }

      if (remindersToCreate.length > 0) {
        await db.scheduleNotifications.createMany({
          data: remindersToCreate as any
        });

        console.log(`✅ Created ${remindersToCreate.length} reminder notifications`);
      } else {
        console.log('⚠️ No reminders scheduled (appointment time too soon)');
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Error scheduling reminders:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to schedule reminders' 
      };
    }
  }

  /**
   * Process and send pending reminders
   * This should be called by a cron job periodically (e.g., every 5-10 minutes)
   */
  static async processScheduledReminders(): Promise<{ sent: number; failed: number }> {
    try {
      const now = new Date();
      console.log('🔄 Processing scheduled reminders at:', now.toISOString());

      // Get pending reminders that should be sent
      const pendingReminders = await db.scheduleNotifications.findMany({
        where: {
          status: 'PENDING',
          send_at: { lte: now }
        },
        include: {
          appointment: {
            include: {
              patient: true,
              doctor: true
            }
          }
        },
        take: 50 // Process in batches
      });

      console.log(`📨 Found ${pendingReminders.length} reminders to send`);

      let sent = 0;
      let failed = 0;

      for (const reminder of pendingReminders) {
        try {
          const appointment = reminder.appointment;
          
          // Determine recipient email
          const recipientEmail = reminder.recipient_type === 'PATIENT' 
            ? appointment.patient.email 
            : appointment.doctor.email;

          // Send email
          await sendEmail({
            to: recipientEmail,
            subject: reminder.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #046658;">${reminder.title}</h2>
                <p style="color: #3E4C4B; line-height: 1.6;">${reminder.message}</p>
                
                <div style="background: #D1F1F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #046658; margin-top: 0;">Appointment Details:</h3>
                  <p style="color: #3E4C4B; margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</p>
                  <p style="color: #3E4C4B; margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
                  <p style="color: #3E4C4B; margin: 5px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctor.name}</p>
                  <p style="color: #3E4C4B; margin: 5px 0;"><strong>Type:</strong> ${appointment.type}</p>
                </div>
                
                <p style="color: #666; font-size: 12px;">
                  This is an automated reminder. Please do not reply to this email.
                </p>
              </div>
            `
          });

          // Mark as sent
          await db.scheduleNotifications.update({
            where: { id: reminder.id },
            data: { 
              status: 'SENT',
              sent_at: new Date()
            }
          });

          sent++;
          console.log(`✅ Sent reminder to ${recipientEmail}`);

        } catch (error) {
          console.error(`❌ Failed to send reminder ${reminder.id}:`, error);
          
          // Mark as failed
          await db.scheduleNotifications.update({
            where: { id: reminder.id },
            data: { status: 'FAILED' }
          });

          failed++;
        }
      }

      console.log(`📊 Reminder processing complete: ${sent} sent, ${failed} failed`);
      return { sent, failed };

    } catch (error) {
      console.error('❌ Error processing reminders:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Cancel reminders for an appointment (e.g., when appointment is cancelled)
   */
  static async cancelReminders(appointmentId: number): Promise<{ success: boolean }> {
    try {
      await db.scheduleNotifications.updateMany({
        where: {
          appointment_id: appointmentId,
          status: 'PENDING'
        },
        data: {
          status: 'CANCELLED'
        }
      });

      console.log(`✅ Cancelled reminders for appointment ${appointmentId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error cancelling reminders:', error);
      return { success: false };
    }
  }
}

