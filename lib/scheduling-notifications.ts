import { SendGridEmailService } from './email-service';
import { db } from './db';

export interface SchedulingNotificationTemplate {
  id: string;
  name: string;
  type: 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CONFIRMATION' | 'APPOINTMENT_CANCELLATION' | 'SCHEDULE_CHANGE' | 'NEW_APPOINTMENT';
  subject: string;
  body: string;
  send_before_minutes: number;
  is_active: boolean;
}

export interface NotificationData {
  appointment_id: string;
  patient_email: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: Date;
  appointment_time: string;
  appointment_type: string;
  location?: string;
  notes?: string;
}

export class SchedulingNotificationService {
  private emailService: SendGridEmailService;

  constructor() {
    this.emailService = new SendGridEmailService();
  }

  /**
   * Create notification templates
   */
  static async createNotificationTemplates() {
    const templates: Omit<SchedulingNotificationTemplate, 'id'>[] = [
      {
        name: 'Appointment Confirmation',
        type: 'APPOINTMENT_CONFIRMATION',
        subject: 'Appointment Confirmed - {{doctor_name}}',
        body: `
          <h2>Appointment Confirmed</h2>
          <p>Dear {{patient_name}},</p>
          <p>Your appointment has been confirmed with Dr. {{doctor_name}}.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details:</h3>
            <ul>
              <li><strong>Date:</strong> {{appointment_date}}</li>
              <li><strong>Time:</strong> {{appointment_time}}</li>
              <li><strong>Type:</strong> {{appointment_type}}</li>
              <li><strong>Doctor:</strong> Dr. {{doctor_name}}</li>
              ${'{{#if location}}'}<li><strong>Location:</strong> {{location}}</li>${'{{/if}}'}
              ${'{{#if notes}}'}<li><strong>Notes:</strong> {{notes}}</li>${'{{/if}}'}
            </ul>
          </div>
          
          <p>Please arrive 15 minutes before your scheduled time.</p>
          <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
          
          <p>Best regards,<br>Healthcare Team</p>
        `,
        send_before_minutes: 0,
        is_active: true,
      },
      {
        name: '24-Hour Reminder',
        type: 'APPOINTMENT_REMINDER',
        subject: 'Appointment Reminder - Tomorrow at {{appointment_time}}',
        body: `
          <h2>Appointment Reminder</h2>
          <p>Dear {{patient_name}},</p>
          <p>This is a friendly reminder about your upcoming appointment with Dr. {{doctor_name}}.</p>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details:</h3>
            <ul>
              <li><strong>Date:</strong> {{appointment_date}}</li>
              <li><strong>Time:</strong> {{appointment_time}}</li>
              <li><strong>Type:</strong> {{appointment_type}}</li>
              <li><strong>Doctor:</strong> Dr. {{doctor_name}}</li>
              ${'{{#if location}}'}<li><strong>Location:</strong> {{location}}</li>${'{{/if}}'}
            </ul>
          </div>
          
          <p><strong>Important:</strong> Please arrive 15 minutes before your scheduled time.</p>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          
          <p>Best regards,<br>Healthcare Team</p>
        `,
        send_before_minutes: 24 * 60, // 24 hours
        is_active: true,
      },
      {
        name: '2-Hour Reminder',
        type: 'APPOINTMENT_REMINDER',
        subject: 'Appointment Reminder - Today at {{appointment_time}}',
        body: `
          <h2>Appointment Reminder</h2>
          <p>Dear {{patient_name}},</p>
          <p>Your appointment with Dr. {{doctor_name}} is scheduled for today.</p>
          
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details:</h3>
            <ul>
              <li><strong>Time:</strong> {{appointment_time}}</li>
              <li><strong>Type:</strong> {{appointment_type}}</li>
              <li><strong>Doctor:</strong> Dr. {{doctor_name}}</li>
              ${'{{#if location}}'}<li><strong>Location:</strong> {{location}}</li>${'{{/if}}'}
            </ul>
          </div>
          
          <p><strong>Please arrive 15 minutes early.</strong></p>
          <p>If you're running late or need to reschedule, please call us immediately.</p>
          
          <p>Best regards,<br>Healthcare Team</p>
        `,
        send_before_minutes: 2 * 60, // 2 hours
        is_active: true,
      },
      {
        name: 'Appointment Cancellation',
        type: 'APPOINTMENT_CANCELLATION',
        subject: 'Appointment Cancelled - {{doctor_name}}',
        body: `
          <h2>Appointment Cancelled</h2>
          <p>Dear {{patient_name}},</p>
          <p>Your appointment with Dr. {{doctor_name}} has been cancelled.</p>
          
          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Cancelled Appointment Details:</h3>
            <ul>
              <li><strong>Date:</strong> {{appointment_date}}</li>
              <li><strong>Time:</strong> {{appointment_time}}</li>
              <li><strong>Type:</strong> {{appointment_type}}</li>
              <li><strong>Doctor:</strong> Dr. {{doctor_name}}</li>
            </ul>
          </div>
          
          <p>If you need to reschedule, please contact us to book a new appointment.</p>
          <p>We apologize for any inconvenience.</p>
          
          <p>Best regards,<br>Healthcare Team</p>
        `,
        send_before_minutes: 0,
        is_active: true,
      },
      {
        name: 'Schedule Change Notification',
        type: 'SCHEDULE_CHANGE',
        subject: 'Schedule Change - {{doctor_name}}',
        body: `
          <h2>Schedule Change Notification</h2>
          <p>Dear {{patient_name}},</p>
          <p>There has been a change to your appointment with Dr. {{doctor_name}}.</p>
          
          <div style="background-color: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Updated Appointment Details:</h3>
            <ul>
              <li><strong>Date:</strong> {{appointment_date}}</li>
              <li><strong>Time:</strong> {{appointment_time}}</li>
              <li><strong>Type:</strong> {{appointment_type}}</li>
              <li><strong>Doctor:</strong> Dr. {{doctor_name}}</li>
              ${'{{#if location}}'}<li><strong>Location:</strong> {{location}}</li>${'{{/if}}'}
            </ul>
          </div>
          
          <p>Please update your calendar with the new time.</p>
          <p>If this change doesn't work for you, please contact us to reschedule.</p>
          
          <p>Best regards,<br>Healthcare Team</p>
        `,
        send_before_minutes: 0,
        is_active: true,
      },
    ];

    // Store templates in database (you'll need to create a templates table)
    console.log('Notification templates created:', templates);
    return templates;
  }

  /**
   * Schedule appointment notifications
   */
  static async scheduleAppointmentNotifications(appointmentId: string, appointmentData: NotificationData) {
    try {
      const templates = await SchedulingNotificationService.createNotificationTemplates();
      
      // Schedule confirmation email (immediate)
      const confirmationTemplate = templates.find(t => t.type === 'APPOINTMENT_CONFIRMATION');
      if (confirmationTemplate) {
        await SchedulingNotificationService.scheduleNotification({
          appointment_id: appointmentId,
          doctor_id: appointmentData.doctor_name, // You'll need to get actual doctor ID
          type: 'APPOINTMENT_CONFIRMATION',
          recipient_type: 'PATIENT',
          send_time: new Date(), // Immediate
          template_id: confirmationTemplate.name,
          custom_message: null,
        });
      }

      // Schedule 24-hour reminder
      const reminder24hTemplate = templates.find(t => t.type === 'APPOINTMENT_REMINDER' && t.send_before_minutes === 24 * 60);
      if (reminder24hTemplate) {
        const reminderTime = new Date(appointmentData.appointment_date);
        reminderTime.setHours(reminderTime.getHours() - 24);
        
        await SchedulingNotificationService.scheduleNotification({
          appointment_id: appointmentId,
          doctor_id: appointmentData.doctor_name,
          type: 'APPOINTMENT_REMINDER',
          recipient_type: 'PATIENT',
          send_time: reminderTime,
          template_id: reminder24hTemplate.name,
          custom_message: null,
        });
      }

      // Schedule 2-hour reminder
      const reminder2hTemplate = templates.find(t => t.type === 'APPOINTMENT_REMINDER' && t.send_before_minutes === 2 * 60);
      if (reminder2hTemplate) {
        const reminderTime = new Date(appointmentData.appointment_date);
        reminderTime.setHours(reminderTime.getHours() - 2);
        
        await SchedulingNotificationService.scheduleNotification({
          appointment_id: appointmentId,
          doctor_id: appointmentData.doctor_name,
          type: 'APPOINTMENT_REMINDER',
          recipient_type: 'PATIENT',
          send_time: reminderTime,
          template_id: reminder2hTemplate.name,
          custom_message: null,
        });
      }

      console.log('Appointment notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling appointment notifications:', error);
      throw new Error('Failed to schedule appointment notifications');
    }
  }

  /**
   * Schedule a notification
   */
  static async scheduleNotification(notificationData: {
    appointment_id: string;
    doctor_id: string;
    type: string;
    recipient_type: string;
    send_time: Date;
    template_id?: string;
    custom_message?: string;
  }) {
    try {
      const notification = await db.scheduleNotification.create({
        data: notificationData
      });

      return notification;
    } catch (error) {
      console.error('Error creating schedule notification:', error);
      throw new Error('Failed to create schedule notification');
    }
  }

  /**
   * Process pending notifications
   */
  static async processPendingNotifications() {
    try {
      const now = new Date();
      const pendingNotifications = await db.scheduleNotification.findMany({
        where: {
          is_sent: false,
          send_time: {
            lte: now
          }
        },
        include: {
          appointment: {
            include: {
              patient: true,
              doctor: true
            }
          }
        }
      });

      for (const notification of pendingNotifications) {
        try {
          await SchedulingNotificationService.sendNotification(notification);
          
          // Mark as sent
          await db.scheduleNotification.update({
            where: { id: notification.id },
            data: {
              is_sent: true,
              sent_at: new Date(),
              delivery_status: 'SENT'
            }
          });
        } catch (error) {
          console.error(`Error sending notification ${notification.id}:`, error);
          
          // Mark as failed
          await db.scheduleNotification.update({
            where: { id: notification.id },
            data: {
              delivery_status: 'FAILED'
            }
          });
        }
      }

      console.log(`Processed ${pendingNotifications.length} pending notifications`);
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Send a notification
   */
  private static async sendNotification(notification: any) {
    const emailService = new SendGridEmailService();
    
    if (!notification.appointment) {
      throw new Error('Appointment not found for notification');
    }

    const appointment = notification.appointment;
    const patient = appointment.patient;
    const doctor = appointment.doctor;

    // Get template based on notification type
    const templates = await SchedulingNotificationService.createNotificationTemplates();
    const template = templates.find(t => t.type === notification.type);

    if (!template) {
      throw new Error(`Template not found for type: ${notification.type}`);
    }

    // Replace template variables
    const subject = template.subject
      .replace(/\{\{patient_name\}\}/g, `${patient.first_name} ${patient.last_name}`)
      .replace(/\{\{doctor_name\}\}/g, doctor.name)
      .replace(/\{\{appointment_date\}\}/g, new Date(appointment.appointment_date).toLocaleDateString())
      .replace(/\{\{appointment_time\}\}/g, appointment.time)
      .replace(/\{\{appointment_type\}\}/g, appointment.type);

    const body = template.body
      .replace(/\{\{patient_name\}\}/g, `${patient.first_name} ${patient.last_name}`)
      .replace(/\{\{doctor_name\}\}/g, doctor.name)
      .replace(/\{\{appointment_date\}\}/g, new Date(appointment.appointment_date).toLocaleDateString())
      .replace(/\{\{appointment_time\}\}/g, appointment.time)
      .replace(/\{\{appointment_type\}\}/g, appointment.type)
      .replace(/\{\{location\}\}/g, appointment.location || '')
      .replace(/\{\{notes\}\}/g, appointment.note || '');

    // Send email
    await emailService.sendEmail({
      to: patient.email,
      subject,
      html: body,
    });

    console.log(`Notification sent to ${patient.email} for appointment ${appointment.id}`);
  }

  /**
   * Cancel scheduled notifications for an appointment
   */
  static async cancelAppointmentNotifications(appointmentId: string) {
    try {
      await db.scheduleNotification.updateMany({
        where: {
          appointment_id: appointmentId,
          is_sent: false
        },
        data: {
          delivery_status: 'CANCELLED'
        }
      });

      console.log(`Cancelled notifications for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error cancelling appointment notifications:', error);
      throw new Error('Failed to cancel appointment notifications');
    }
  }
}

