import { Appointment, Doctor, Patient } from '@prisma/client';
import { logAudit } from './audit';
import db from './db';

// Notification types
export enum NotificationType {
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  DOCTOR_AVAILABILITY = 'DOCTOR_AVAILABILITY',
}

// Notification channels
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Notification status
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

// Import template system
import { TemplateRegistry, TemplateContext } from './template-engine';
import { EmailScheduler, EmailSchedulingPatterns, SchedulingStrategy } from './email-scheduler';

// Legacy template interface (deprecated - use TemplateRegistry instead)
export interface NotificationTemplate {
  subject: string;
  body: string;
  smsBody: string;
}

// Notification data interface
export interface NotificationData {
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  recipientId: string;
  recipientType: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  appointmentId?: number;
  patientId?: string;
  doctorId?: string;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

// Email service interface (to be implemented with actual email provider)
export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

// SMS service interface (to be implemented with actual SMS provider)
export interface SMSService {
  sendSMS(to: string, message: string): Promise<boolean>;
}

// Mock email service (replace with actual implementation)
class MockEmailService implements EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log('📧 MOCK EMAIL (Development Mode):', { to, subject, body });
    // In production, integrate with services like:
    // - SendGrid, Mailgun, AWS SES, etc.
    return true;
  }
}

// Mock SMS service (replace with actual implementation)
class MockSMSService implements SMSService {
  async sendSMS(to: string, message: string): Promise<boolean> {
    console.log('📱 SMS SENT:', { to, message });
    // In production, integrate with services like:
    // - Twilio, AWS SNS, etc.
    return true;
  }
}

// Notification templates
const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  [NotificationType.APPOINTMENT_BOOKED]: {
    subject: 'Appointment Confirmation - {appointmentType}',
    body: `
      Dear {recipientName},
      
      Your appointment has been successfully booked!
      
      📅 Appointment Details:
      - Date: {appointmentDate}
      - Time: {appointmentTime}
      - Type: {appointmentType}
      - Doctor: Dr. {doctorName}
      - Location: {location}
      
      Please arrive 15 minutes before your scheduled time.
      
      If you need to reschedule or cancel, please contact us at least 24 hours in advance.
      
      Best regards,
      {clinicName}
    `,
    smsBody: 'Appointment confirmed: {appointmentDate} at {appointmentTime} with Dr. {doctorName}. Arrive 15 min early.'
  },
  
  [NotificationType.APPOINTMENT_REMINDER]: {
    subject: 'Appointment Reminder - Tomorrow at {appointmentTime}',
    body: `
      Dear {recipientName},
      
      This is a friendly reminder about your upcoming appointment tomorrow.
      
      📅 Appointment Details:
      - Date: {appointmentDate}
      - Time: {appointmentTime}
      - Type: {appointmentType}
      - Doctor: Dr. {doctorName}
      - Location: {location}
      
      Please remember to:
      - Bring your ID and insurance card
      - Arrive 15 minutes early
      - Bring any relevant medical records
      
      If you need to reschedule, please call us immediately.
      
      Best regards,
      {clinicName}
    `,
    smsBody: 'Reminder: Appointment tomorrow at {appointmentTime} with Dr. {doctorName}. Arrive 15 min early.'
  },
  
  [NotificationType.APPOINTMENT_CANCELLED]: {
    subject: 'Appointment Cancellation Confirmation',
    body: `
      Dear {recipientName},
      
      Your appointment has been cancelled as requested.
      
      📅 Cancelled Appointment:
      - Date: {appointmentDate}
      - Time: {appointmentTime}
      - Type: {appointmentType}
      - Doctor: Dr. {doctorName}
      
      To reschedule, please contact us or book online.
      
      Best regards,
      {clinicName}
    `,
    smsBody: 'Appointment cancelled for {appointmentDate} at {appointmentTime}. Contact us to reschedule.'
  },
  
  [NotificationType.APPOINTMENT_RESCHEDULED]: {
    subject: 'Appointment Rescheduled',
    body: `
      Dear {recipientName},
      
      Your appointment has been rescheduled.
      
      📅 New Appointment Details:
      - Date: {appointmentDate}
      - Time: {appointmentTime}
      - Type: {appointmentType}
      - Doctor: Dr. {doctorName}
      - Location: {location}
      
      Previous appointment was: {previousDate} at {previousTime}
      
      Please arrive 15 minutes before your new scheduled time.
      
      Best regards,
      {clinicName}
    `,
    smsBody: 'Appointment rescheduled to {appointmentDate} at {appointmentTime} with Dr. {doctorName}.'
  },
  
  [NotificationType.DOCTOR_AVAILABILITY]: {
    subject: 'New Appointment Request - {patientName}',
    body: `
      Dear Dr. {doctorName},
      
      You have a new appointment request:
      
      📋 Patient Details:
      - Name: {patientName}
      - Age: {patientAge}
      - Phone: {patientPhone}
      - Email: {patientEmail}
      
      📅 Appointment Details:
      - Date: {appointmentDate}
      - Time: {appointmentTime}
      - Type: {appointmentType}
      - Notes: {notes}
      
      Please review and confirm this appointment in your dashboard.
      
      Best regards,
      {clinicName}
    `,
    smsBody: 'New appointment request: {patientName} on {appointmentDate} at {appointmentTime}. Check dashboard.'
  }
};

// Main notification service
export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;
  private templateRegistry: TemplateRegistry;
  private emailScheduler: EmailScheduler;
  
  constructor() {
    // Try to use real email service if configured, otherwise fall back to mock
    this.emailService = this.initializeEmailService();
    this.smsService = new MockSMSService();
    
    // Initialize template system
    this.templateRegistry = TemplateRegistry.getInstance();
    this.emailScheduler = EmailScheduler.getInstance();
    
    // Start the email scheduler to process queued emails
    this.emailScheduler.start();
    
    console.log('✅ Template system and email scheduler initialized and started');
  }

  // Initialize email service based on environment
  private initializeEmailService(): EmailService {
    try {
      // Check if SendGrid is configured
      if (process.env.SENDGRID_API_KEY && process.env.ENABLE_REAL_NOTIFICATIONS === 'true') {
        // Dynamic import to avoid build issues
        const { SendGridEmailService } = require('./email-service');
        const service = new SendGridEmailService();
        console.log('✅ SendGrid email service initialized');
        return service;
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize SendGrid, falling back to mock service:', error instanceof Error ? error.message : String(error));
    }
    
    // Fall back to mock service
    console.log('📧 Using mock email service (development mode)');
    return new MockEmailService();
  }

  // Method to switch to real email service
  setEmailService(service: EmailService) {
    this.emailService = service;
    console.log('✅ Email service updated to real service');
  }

  // Method to switch to real SMS service
  setSMSService(service: SMSService) {
    this.smsService = service;
    console.log('✅ SMS service updated to real service');
  }
  
  // Send appointment booking notification
  async sendAppointmentBookedNotification(
    appointment: Appointment & { patient: Patient; doctor: Doctor }
  ): Promise<void> {
    try {
      // Get real patient and doctor data for notifications
      const patientData = await this.getPatientData(appointment.patient_id);
      const doctorData = await this.getDoctorData(appointment.doctor_id);
      
      if (!patientData || !doctorData) {
        throw new Error('Failed to retrieve patient or doctor data');
      }

      // Notify patient
      await this.sendNotification({
        type: NotificationType.APPOINTMENT_BOOKED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipientId: appointment.patient_id,
        recipientType: 'PATIENT',
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        scheduledFor: appointment.appointment_date,
        metadata: {
          recipientName: `${patientData.first_name} ${patientData.last_name}`,
          appointmentType: appointment.type,
          appointmentDate: this.formatDate(appointment.appointment_date),
          appointmentTime: appointment.time,
          doctorName: doctorData.name,
          location: 'Main Clinic',
          clinicName: 'Healthcare System'
        }
      });
      
      // Notify doctor
      await this.sendNotification({
        type: NotificationType.DOCTOR_AVAILABILITY,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
        recipientId: appointment.doctor_id,
        recipientType: 'DOCTOR',
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        scheduledFor: appointment.appointment_date,
        metadata: {
          doctorName: doctorData.name,
          patientName: `${patientData.first_name} ${patientData.last_name}`,
          patientAge: this.calculateAge(patientData.date_of_birth),
          patientPhone: patientData.phone,
          patientEmail: patientData.email,
          appointmentDate: this.formatDate(appointment.appointment_date),
          appointmentTime: appointment.time,
          appointmentType: appointment.type,
          notes: appointment.note || 'No additional notes',
          clinicName: 'Healthcare System'
        }
      });
      
      // Log audit trail
      await logAudit({
        action: 'CREATE',
        resourceType: 'APPOINTMENT',
        resourceId: appointment.id.toString(),
        patientId: appointment.patient_id,
        reason: 'Appointment booking notifications sent',
        metadata: {
          notificationType: 'APPOINTMENT_BOOKED',
          channels: ['EMAIL'],
          recipients: [appointment.patient_id, appointment.doctor_id]
        }
      });
      
    } catch (error) {
      console.error('Failed to send appointment booking notifications:', error);
      throw error;
    }
  }
  
  // Send appointment reminder
  async sendAppointmentReminder(
    appointment: Appointment & { patient: Patient; doctor: Doctor }
  ): Promise<void> {
    try {
      const patientData = await this.getPatientData(appointment.patient_id);
      const doctorData = await this.getDoctorData(appointment.doctor_id);
      
      if (!patientData || !doctorData) {
        throw new Error('Failed to retrieve patient or doctor data');
      }

      await this.sendNotification({
        type: NotificationType.APPOINTMENT_REMINDER,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipientId: appointment.patient_id,
        recipientType: 'PATIENT',
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        scheduledFor: appointment.appointment_date,
        metadata: {
          recipientName: `${patientData.first_name} ${patientData.last_name}`,
          appointmentType: appointment.type,
          appointmentDate: this.formatDate(appointment.appointment_date),
          appointmentTime: appointment.time,
          doctorName: doctorData.name,
          location: 'Main Clinic',
          clinicName: 'Healthcare System'
        }
      });
      
      // Also send SMS reminder
      await this.sendNotification({
        type: NotificationType.APPOINTMENT_REMINDER,
        channel: NotificationChannel.SMS,
        priority: NotificationPriority.MEDIUM,
        recipientId: appointment.patient_id,
        recipientType: 'PATIENT',
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        scheduledFor: appointment.appointment_date,
        metadata: {
          recipientName: `${patientData.first_name} ${patientData.last_name}`,
          appointmentType: appointment.type,
          appointmentDate: this.formatDate(appointment.appointment_date),
          appointmentTime: appointment.time,
          doctorName: doctorData.name,
          location: 'Main Clinic',
          clinicName: 'Healthcare System'
        }
      });
      
    } catch (error) {
      console.error('Failed to send appointment reminder:', error);
      throw error;
    }
  }
  
  // Send appointment cancellation notification
  async sendAppointmentCancellationNotification(
    appointment: Appointment & { patient: Patient; doctor: Doctor }
  ): Promise<void> {
    try {
      const patientData = await this.getPatientData(appointment.patient_id);
      const doctorData = await this.getDoctorData(appointment.doctor_id);
      
      if (!patientData || !doctorData) {
        throw new Error('Failed to retrieve patient or doctor data');
      }

      await this.sendNotification({
        type: NotificationType.APPOINTMENT_CANCELLED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipientId: appointment.patient_id,
        recipientType: 'PATIENT',
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        scheduledFor: appointment.appointment_date,
        metadata: {
          recipientName: `${patientData.first_name} ${patientData.last_name}`,
          appointmentType: appointment.type,
          appointmentDate: this.formatDate(appointment.appointment_date),
          appointmentTime: appointment.time,
          doctorName: doctorData.name,
          clinicName: 'Healthcare System'
        }
      });
      
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
      throw error;
    }
  }
  
  // Main notification sending method
  private async sendNotification(data: NotificationData): Promise<void> {
    const template = NOTIFICATION_TEMPLATES[data.type];
    if (!template) {
      throw new Error(`No template found for notification type: ${data.type}`);
    }
    
    // Replace placeholders in template
    const subject = this.replacePlaceholders(template.subject, data.metadata || {});
    const body = this.replacePlaceholders(template.body, data.metadata || {});
    const smsBody = this.replacePlaceholders(template.smsBody, data.metadata || {});
    
    // Send based on channel
    switch (data.channel) {
      case NotificationChannel.EMAIL:
        await this.sendEmailNotification(data, subject, body);
        break;
      case NotificationChannel.SMS:
        await this.sendSMSNotification(data, smsBody);
        break;
      case NotificationChannel.IN_APP:
        await this.sendInAppNotification(data, subject, body);
        break;
      default:
        throw new Error(`Unsupported notification channel: ${data.channel}`);
    }
  }
  
  // Send email notification
  private async sendEmailNotification(
    data: NotificationData,
    subject: string,
    body: string
  ): Promise<void> {
    // Get recipient email from database
    const recipientEmail = await this.getRecipientEmail(data.recipientId, data.recipientType);
    
    if (!recipientEmail) {
      throw new Error(`No email found for recipient: ${data.recipientId}`);
    }
    
    await this.emailService.sendEmail(recipientEmail, subject, body);
  }
  
  // Send SMS notification
  private async sendSMSNotification(
    data: NotificationData,
    message: string
  ): Promise<void> {
    // Get recipient phone from database
    const recipientPhone = await this.getRecipientPhone(data.recipientId, data.recipientType);
    
    if (!recipientPhone) {
      throw new Error(`No phone found for recipient: ${data.recipientId}`);
    }
    
    await this.smsService.sendSMS(recipientPhone, message);
  }
  
  // Send in-app notification (implement based on your frontend)
  private async sendInAppNotification(
    data: NotificationData,
    subject: string,
    body: string
  ): Promise<void> {
    // Store notification in database for in-app display
    // This would integrate with your frontend notification system
    console.log('In-app notification:', { subject, body, recipientId: data.recipientId });
  }
  
  // Get recipient email from database
  private async getRecipientEmail(recipientId: string, recipientType: string): Promise<string | null> {
    try {
      if (recipientType === 'PATIENT') {
        const patient = await db.patient.findUnique({
          where: { id: recipientId },
          select: { email: true }
        });
        
        if (!patient?.email) {
          console.warn(`No email found for patient ${recipientId}`);
          return null;
        }
        
        // Check if email is encrypted and decrypt if needed
        let email = patient.email;
        if (email.startsWith('{"encrypted":')) {
          try {
            // Import and use the encryption service directly
            const { decryptPHI } = require('./encryption');
            // Decrypt the specific encrypted email field
            const decryptedEmail = decryptPHI(email);
            email = decryptedEmail;
            console.log(`✅ Decrypted email for patient ${recipientId}: ${email}`);
          } catch (decryptError) {
            console.error(`Failed to decrypt email for patient ${recipientId}:`, decryptError);
            return null;
          }
        }
        
        return email;
      } else if (recipientType === 'DOCTOR') {
        const doctor = await db.doctor.findUnique({
          where: { id: recipientId },
          select: { email: true }
        });
        
        if (!doctor?.email) {
          console.warn(`No email found for doctor ${recipientId}`);
          return null;
        }
        
        return doctor.email;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get email for ${recipientType} ${recipientId}:`, error);
      return null;
    }
  }
  
  // Get recipient phone from database
  private async getRecipientPhone(recipientId: string, recipientType: string): Promise<string | null> {
    try {
      if (recipientType === 'PATIENT') {
        const patient = await db.patient.findUnique({
          where: { id: recipientId },
          select: { phone: true }
        });
        
        if (!patient?.phone) {
          console.warn(`No phone found for patient ${recipientId}`);
          return null;
        }
        
        // Check if phone is encrypted and decrypt if needed
        let phone = patient.phone;
        if (phone.startsWith('{"encrypted":')) {
          try {
            // Import and use the encryption service directly
            const { decryptPHI } = require('./encryption');
            // Decrypt the specific encrypted phone field
            const decryptedPhone = decryptPHI(phone);
            phone = decryptedPhone;
            console.log(`✅ Decrypted phone for patient ${recipientId}: ${phone}`);
          } catch (decryptError) {
            console.error(`Failed to decrypt phone for patient ${recipientId}:`, decryptError);
            return null;
          }
        }
        
        return phone;
      } else if (recipientType === 'DOCTOR') {
        const doctor = await db.doctor.findUnique({
          where: { id: recipientId },
          select: { phone: true }
        });
        
        if (!doctor?.phone) {
          console.warn(`No phone found for doctor ${recipientId}`);
          return null;
        }
        
        return doctor.phone;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get phone for ${recipientType} ${recipientId}:`, error);
      return null;
    }
  }

  // Get patient data for notifications
  private async getPatientData(patientId: string): Promise<Patient | null> {
    try {
      const patient = await db.patient.findUnique({
        where: { id: patientId }
      });
      
      if (!patient) return null;
      
      // Decrypt patient data before returning
      const { decryptSinglePatient } = require('./data-utils');
      return decryptSinglePatient(patient);
    } catch (error) {
      console.error(`Failed to get patient data for ${patientId}:`, error);
      return null;
    }
  }

  // Get doctor data for notifications
  private async getDoctorData(doctorId: string): Promise<Doctor | null> {
    try {
      const doctor = await db.doctor.findUnique({
        where: { id: doctorId }
      });
      
      if (!doctor) return null;
      
      // Decrypt doctor data before returning
      const { decryptSingleDoctor } = require('./data-utils');
      return decryptSingleDoctor(doctor);
    } catch (error) {
      console.error(`Failed to get doctor data for ${doctorId}:`, error);
      return null;
    }
  }
  
  // Replace placeholders in template
  private replacePlaceholders(template: string, data: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }
  
  // Format date for display
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
  
  // Calculate age from date of birth
  private calculateAge(dob: Date): string {
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} months`;
    }
    
    return `${years} years${months > 0 ? ` ${months} months` : ''}`;
  }

  // ===== NEW TEMPLATE-BASED METHODS =====

  // Send notification using template system
  async sendTemplateNotification(
    templateId: string,
    context: TemplateContext,
    strategy: SchedulingStrategy = SchedulingStrategy.IMMEDIATE,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<string> {
    try {
      console.log(`📧 Sending template notification: ${templateId}`);
      
      // Validate template exists
      const template = this.templateRegistry.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Schedule email using the scheduler
      const jobId = await this.emailScheduler.scheduleEmail(templateId, context, {
        strategy,
        priority,
        retryAttempts: 3,
        retryDelay: 5 * 60 * 1000 // 5 minutes
      });

      console.log(`✅ Template notification scheduled: ${jobId}`);
      return jobId;

    } catch (error) {
      console.error('Failed to send template notification:', error);
      throw error;
    }
  }

  // Send appointment confirmation using template
  async sendAppointmentConfirmationTemplate(
    appointment: Appointment & { patient: Patient; doctor: Doctor },
    strategy: SchedulingStrategy = SchedulingStrategy.IMMEDIATE
  ): Promise<string> {
    try {
      const patientData = await this.getPatientData(appointment.patient_id);
      const doctorData = await this.getDoctorData(appointment.doctor_id);
      
      if (!patientData || !doctorData) {
        throw new Error('Failed to retrieve patient or doctor data');
      }

      // Create template context
      const context: TemplateContext = {
        recipientName: `${patientData.first_name} ${patientData.last_name}`,
        recipientEmail: await this.getRecipientEmail(appointment.patient_id, 'PATIENT') || '',
        recipientPhone: await this.getRecipientPhone(appointment.patient_id, 'PATIENT') || undefined,
        appointmentId: appointment.id.toString(),
        appointmentType: appointment.type,
        appointmentDate: this.formatDate(appointment.appointment_date),
        appointmentTime: appointment.time,
        doctorName: doctorData.name,
        doctorSpecialization: doctorData.specialization,
        facilityName: 'Healthcare System',
        systemName: 'Healthcare Management System',
        supportEmail: 'support@healthcare.com',
        supportPhone: '+1-800-HEALTH',
        websiteUrl: 'https://healthcare.com'
      };

      // Send using template
      return await this.sendTemplateNotification(
        'appointment-booked-email',
        context,
        strategy,
        NotificationPriority.MEDIUM
      );

    } catch (error) {
      console.error('Failed to send appointment confirmation template:', error);
      throw error;
    }
  }

  // Send appointment reminder using template
  async sendAppointmentReminderTemplate(
    appointment: Appointment & { patient: Patient; doctor: Doctor },
    strategy: SchedulingStrategy = SchedulingStrategy.DELAYED
  ): Promise<string> {
    try {
      const patientData = await this.getPatientData(appointment.patient_id);
      const doctorData = await this.getDoctorData(appointment.doctor_id);
      
      if (!patientData || !doctorData) {
        throw new Error('Failed to retrieve patient or doctor data');
      }

      // Create template context
      const context: TemplateContext = {
        recipientName: `${patientData.first_name} ${patientData.last_name}`,
        recipientEmail: await this.getRecipientEmail(appointment.patient_id, 'PATIENT') || '',
        recipientPhone: await this.getRecipientPhone(appointment.patient_id, 'PATIENT') || undefined,
        appointmentId: appointment.id.toString(),
        appointmentType: appointment.type,
        appointmentDate: this.formatDate(appointment.appointment_date),
        appointmentTime: appointment.time,
        doctorName: doctorData.name,
        doctorSpecialization: doctorData.specialization,
        facilityName: 'Healthcare System',
        systemName: 'Healthcare Management System',
        supportEmail: 'support@healthcare.com',
        supportPhone: '+1-800-HEALTH',
        websiteUrl: 'https://healthcare.com'
      };

      // Send using template
      return await this.sendTemplateNotification(
        'appointment-reminder-email',
        context,
        strategy,
        NotificationPriority.MEDIUM
      );

    } catch (error) {
      console.error('Failed to send appointment reminder template:', error);
      throw error;
    }
  }

  // Get template registry for external access
  getTemplateRegistry(): TemplateRegistry {
    return this.templateRegistry;
  }

  // Get email scheduler for external access
  getEmailScheduler(): EmailScheduler {
    return this.emailScheduler;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
