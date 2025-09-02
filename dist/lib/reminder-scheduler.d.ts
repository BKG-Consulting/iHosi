import { Appointment, Doctor, Patient } from '@prisma/client';
export interface ReminderConfig {
    reminderHoursBefore: number[];
    confirmationHoursAfter: number;
    followUpHoursAfter: number;
    timezone: string;
}
export declare const DEFAULT_REMINDER_CONFIG: ReminderConfig;
export declare enum ReminderType {
    CONFIRMATION = "CONFIRMATION",
    REMINDER_24H = "REMINDER_24H",
    REMINDER_2H = "REMINDER_2H",
    FOLLOW_UP = "FOLLOW_UP",
    DOCTOR_REMINDER = "DOCTOR_REMINDER"
}
export declare enum ReminderStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export interface ReminderRecord {
    id: string;
    appointmentId: number;
    patientId: string;
    doctorId: string;
    type: ReminderType;
    scheduledFor: Date;
    status: ReminderStatus;
    sentAt?: Date;
    errorMessage?: string;
    metadata?: Record<string, any>;
}
export declare class ReminderScheduler {
    private config;
    private isRunning;
    private intervalId?;
    constructor(config?: ReminderConfig);
    start(): void;
    stop(): void;
    scheduleAppointmentReminders(appointment: Appointment & {
        patient: Patient;
        doctor: Doctor;
    }): Promise<void>;
    cancelAppointmentReminders(appointmentId: number): Promise<void>;
    private processReminders;
    private processAppointmentReminders;
    private shouldSend24HourReminder;
    private shouldSend2HourReminder;
    private shouldSendDoctorReminder;
    private shouldSendFollowUpReminder;
    private send24HourReminder;
    private send2HourReminder;
    private sendDoctorReminder;
    private sendFollowUpReminder;
    private getUpcomingAppointments;
    private scheduleReminder;
    updateConfig(newConfig: Partial<ReminderConfig>): void;
    getConfig(): ReminderConfig;
    getStatus(): {
        isRunning: boolean;
        config: ReminderConfig;
    };
}
export declare const reminderScheduler: ReminderScheduler;
