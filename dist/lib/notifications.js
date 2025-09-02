"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = exports.NotificationStatus = exports.NotificationPriority = exports.NotificationChannel = exports.NotificationType = void 0;
const audit_1 = require("./audit");
const db_1 = __importDefault(require("./db"));
// Notification types
var NotificationType;
(function (NotificationType) {
    NotificationType["APPOINTMENT_BOOKED"] = "APPOINTMENT_BOOKED";
    NotificationType["APPOINTMENT_REMINDER"] = "APPOINTMENT_REMINDER";
    NotificationType["APPOINTMENT_CANCELLED"] = "APPOINTMENT_CANCELLED";
    NotificationType["APPOINTMENT_RESCHEDULED"] = "APPOINTMENT_RESCHEDULED";
    NotificationType["DOCTOR_AVAILABILITY"] = "DOCTOR_AVAILABILITY";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// Notification channels
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["IN_APP"] = "IN_APP";
    NotificationChannel["PUSH"] = "PUSH";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
// Notification priority levels
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "LOW";
    NotificationPriority["MEDIUM"] = "MEDIUM";
    NotificationPriority["HIGH"] = "HIGH";
    NotificationPriority["URGENT"] = "URGENT";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
// Notification status
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "PENDING";
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["FAILED"] = "FAILED";
    NotificationStatus["DELIVERED"] = "DELIVERED";
    NotificationStatus["READ"] = "READ";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
// Import template system
const template_engine_1 = require("./template-engine");
const email_scheduler_1 = require("./email-scheduler");
// Mock email service (replace with actual implementation)
class MockEmailService {
    async sendEmail(to, subject, body) {
        console.log('📧 MOCK EMAIL (Development Mode):', { to, subject, body });
        // In production, integrate with services like:
        // - SendGrid, Mailgun, AWS SES, etc.
        return true;
    }
}
// Mock SMS service (replace with actual implementation)
class MockSMSService {
    async sendSMS(to, message) {
        console.log('📱 SMS SENT:', { to, message });
        // In production, integrate with services like:
        // - Twilio, AWS SNS, etc.
        return true;
    }
}
// Notification templates
const NOTIFICATION_TEMPLATES = {
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
class NotificationService {
    constructor() {
        // Try to use real email service if configured, otherwise fall back to mock
        this.emailService = this.initializeEmailService();
        this.smsService = new MockSMSService();
        // Initialize template system
        this.templateRegistry = template_engine_1.TemplateRegistry.getInstance();
        this.emailScheduler = email_scheduler_1.EmailScheduler.getInstance();
        console.log('✅ Template system and email scheduler initialized');
    }
    // Initialize email service based on environment
    initializeEmailService() {
        try {
            // Check if SendGrid is configured
            if (process.env.SENDGRID_API_KEY && process.env.ENABLE_REAL_NOTIFICATIONS === 'true') {
                // Dynamic import to avoid build issues
                const { SendGridEmailService } = require('./email-service');
                const service = new SendGridEmailService();
                console.log('✅ SendGrid email service initialized');
                return service;
            }
        }
        catch (error) {
            console.warn('⚠️ Failed to initialize SendGrid, falling back to mock service:', error instanceof Error ? error.message : String(error));
        }
        // Fall back to mock service
        console.log('📧 Using mock email service (development mode)');
        return new MockEmailService();
    }
    // Method to switch to real email service
    setEmailService(service) {
        this.emailService = service;
        console.log('✅ Email service updated to real service');
    }
    // Method to switch to real SMS service
    setSMSService(service) {
        this.smsService = service;
        console.log('✅ SMS service updated to real service');
    }
    // Send appointment booking notification
    async sendAppointmentBookedNotification(appointment) {
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
            await (0, audit_1.logAudit)({
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
        }
        catch (error) {
            console.error('Failed to send appointment booking notifications:', error);
            throw error;
        }
    }
    // Send appointment reminder
    async sendAppointmentReminder(appointment) {
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
        }
        catch (error) {
            console.error('Failed to send appointment reminder:', error);
            throw error;
        }
    }
    // Send appointment cancellation notification
    async sendAppointmentCancellationNotification(appointment) {
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
        }
        catch (error) {
            console.error('Failed to send cancellation notification:', error);
            throw error;
        }
    }
    // Main notification sending method
    async sendNotification(data) {
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
    async sendEmailNotification(data, subject, body) {
        // Get recipient email from database
        const recipientEmail = await this.getRecipientEmail(data.recipientId, data.recipientType);
        if (!recipientEmail) {
            throw new Error(`No email found for recipient: ${data.recipientId}`);
        }
        await this.emailService.sendEmail(recipientEmail, subject, body);
    }
    // Send SMS notification
    async sendSMSNotification(data, message) {
        // Get recipient phone from database
        const recipientPhone = await this.getRecipientPhone(data.recipientId, data.recipientType);
        if (!recipientPhone) {
            throw new Error(`No phone found for recipient: ${data.recipientId}`);
        }
        await this.smsService.sendSMS(recipientPhone, message);
    }
    // Send in-app notification (implement based on your frontend)
    async sendInAppNotification(data, subject, body) {
        // Store notification in database for in-app display
        // This would integrate with your frontend notification system
        console.log('In-app notification:', { subject, body, recipientId: data.recipientId });
    }
    // Get recipient email from database
    async getRecipientEmail(recipientId, recipientType) {
        try {
            if (recipientType === 'PATIENT') {
                const patient = await db_1.default.patient.findUnique({
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
                    }
                    catch (decryptError) {
                        console.error(`Failed to decrypt email for patient ${recipientId}:`, decryptError);
                        return null;
                    }
                }
                return email;
            }
            else if (recipientType === 'DOCTOR') {
                const doctor = await db_1.default.doctor.findUnique({
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
        }
        catch (error) {
            console.error(`Failed to get email for ${recipientType} ${recipientId}:`, error);
            return null;
        }
    }
    // Get recipient phone from database
    async getRecipientPhone(recipientId, recipientType) {
        try {
            if (recipientType === 'PATIENT') {
                const patient = await db_1.default.patient.findUnique({
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
                    }
                    catch (decryptError) {
                        console.error(`Failed to decrypt phone for patient ${recipientId}:`, decryptError);
                        return null;
                    }
                }
                return phone;
            }
            else if (recipientType === 'DOCTOR') {
                const doctor = await db_1.default.doctor.findUnique({
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
        }
        catch (error) {
            console.error(`Failed to get phone for ${recipientType} ${recipientId}:`, error);
            return null;
        }
    }
    // Get patient data for notifications
    async getPatientData(patientId) {
        try {
            return await db_1.default.patient.findUnique({
                where: { id: patientId }
            });
        }
        catch (error) {
            console.error(`Failed to get patient data for ${patientId}:`, error);
            return null;
        }
    }
    // Get doctor data for notifications
    async getDoctorData(doctorId) {
        try {
            return await db_1.default.doctor.findUnique({
                where: { id: doctorId }
            });
        }
        catch (error) {
            console.error(`Failed to get doctor data for ${doctorId}:`, error);
            return null;
        }
    }
    // Replace placeholders in template
    replacePlaceholders(template, data) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] || match;
        });
    }
    // Format date for display
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
    // Calculate age from date of birth
    calculateAge(dob) {
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
    async sendTemplateNotification(templateId, context, strategy = email_scheduler_1.SchedulingStrategy.IMMEDIATE, priority = NotificationPriority.MEDIUM) {
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
        }
        catch (error) {
            console.error('Failed to send template notification:', error);
            throw error;
        }
    }
    // Send appointment confirmation using template
    async sendAppointmentConfirmationTemplate(appointment, strategy = email_scheduler_1.SchedulingStrategy.IMMEDIATE) {
        try {
            const patientData = await this.getPatientData(appointment.patient_id);
            const doctorData = await this.getDoctorData(appointment.doctor_id);
            if (!patientData || !doctorData) {
                throw new Error('Failed to retrieve patient or doctor data');
            }
            // Create template context
            const context = {
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
            return await this.sendTemplateNotification('appointment-booked-email', context, strategy, NotificationPriority.MEDIUM);
        }
        catch (error) {
            console.error('Failed to send appointment confirmation template:', error);
            throw error;
        }
    }
    // Send appointment reminder using template
    async sendAppointmentReminderTemplate(appointment, strategy = email_scheduler_1.SchedulingStrategy.DELAYED) {
        try {
            const patientData = await this.getPatientData(appointment.patient_id);
            const doctorData = await this.getDoctorData(appointment.doctor_id);
            if (!patientData || !doctorData) {
                throw new Error('Failed to retrieve patient or doctor data');
            }
            // Create template context
            const context = {
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
            return await this.sendTemplateNotification('appointment-reminder-email', context, strategy, NotificationPriority.MEDIUM);
        }
        catch (error) {
            console.error('Failed to send appointment reminder template:', error);
            throw error;
        }
    }
    // Get template registry for external access
    getTemplateRegistry() {
        return this.templateRegistry;
    }
    // Get email scheduler for external access
    getEmailScheduler() {
        return this.emailScheduler;
    }
}
exports.NotificationService = NotificationService;
// Export singleton instance
exports.notificationService = new NotificationService();
