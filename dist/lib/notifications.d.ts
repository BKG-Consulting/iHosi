import { Appointment, Doctor, Patient } from '@prisma/client';
export declare enum NotificationType {
    APPOINTMENT_BOOKED = "APPOINTMENT_BOOKED",
    APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
    APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED",
    APPOINTMENT_RESCHEDULED = "APPOINTMENT_RESCHEDULED",
    DOCTOR_AVAILABILITY = "DOCTOR_AVAILABILITY"
}
export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    IN_APP = "IN_APP",
    PUSH = "PUSH"
}
export declare enum NotificationPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum NotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED",
    DELIVERED = "DELIVERED",
    READ = "READ"
}
import { TemplateRegistry, TemplateContext } from './template-engine';
import { EmailScheduler, SchedulingStrategy } from './email-scheduler';
export interface NotificationTemplate {
    subject: string;
    body: string;
    smsBody: string;
}
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
export interface EmailService {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}
export interface SMSService {
    sendSMS(to: string, message: string): Promise<boolean>;
}
export declare class NotificationService {
    private emailService;
    private smsService;
    private templateRegistry;
    private emailScheduler;
    constructor();
    private initializeEmailService;
    setEmailService(service: EmailService): void;
    setSMSService(service: SMSService): void;
    sendAppointmentBookedNotification(appointment: Appointment & {
        patient: Patient;
        doctor: Doctor;
    }): Promise<void>;
    sendAppointmentReminder(appointment: Appointment & {
        patient: Patient;
        doctor: Doctor;
    }): Promise<void>;
    sendAppointmentCancellationNotification(appointment: Appointment & {
        patient: Patient;
        doctor: Doctor;
    }): Promise<void>;
    private sendNotification;
    private sendEmailNotification;
    private sendSMSNotification;
    private sendInAppNotification;
    private getRecipientEmail;
    private getRecipientPhone;
    private getPatientData;
    private getDoctorData;
    private replacePlaceholders;
    private formatDate;
    private calculateAge;
    sendTemplateNotification(templateId: string, context: TemplateContext, strategy?: SchedulingStrategy, priority?: NotificationPriority): Promise<string>;
    sendAppointmentConfirmationTemplate(appointment: Appointment & {
        patient: Patient;
        doctor: Doctor;
    }, strategy?: SchedulingStrategy): Promise<string>;
    sendAppointmentReminderTemplate(appointment: Appointment & {
        patient: Patient;
        doctor: Doctor;
    }, strategy?: SchedulingStrategy): Promise<string>;
    getTemplateRegistry(): TemplateRegistry;
    getEmailScheduler(): EmailScheduler;
}
export declare const notificationService: NotificationService;
