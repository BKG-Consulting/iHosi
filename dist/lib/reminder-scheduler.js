"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderScheduler = exports.ReminderScheduler = exports.ReminderStatus = exports.ReminderType = exports.DEFAULT_REMINDER_CONFIG = void 0;
const notifications_1 = require("./notifications");
const audit_1 = require("./audit");
const email_scheduler_1 = require("./email-scheduler");
const db_1 = __importDefault(require("./db"));
// Default reminder configuration
exports.DEFAULT_REMINDER_CONFIG = {
    reminderHoursBefore: [24, 2], // 24 hours and 2 hours before
    confirmationHoursAfter: 1, // 1 hour after booking
    followUpHoursAfter: 24, // 24 hours after appointment
    timezone: 'UTC'
};
// Reminder types
var ReminderType;
(function (ReminderType) {
    ReminderType["CONFIRMATION"] = "CONFIRMATION";
    ReminderType["REMINDER_24H"] = "REMINDER_24H";
    ReminderType["REMINDER_2H"] = "REMINDER_2H";
    ReminderType["FOLLOW_UP"] = "FOLLOW_UP";
    ReminderType["DOCTOR_REMINDER"] = "DOCTOR_REMINDER";
})(ReminderType || (exports.ReminderType = ReminderType = {}));
// Reminder status
var ReminderStatus;
(function (ReminderStatus) {
    ReminderStatus["PENDING"] = "PENDING";
    ReminderStatus["SENT"] = "SENT";
    ReminderStatus["FAILED"] = "FAILED";
    ReminderStatus["CANCELLED"] = "CANCELLED";
})(ReminderStatus || (exports.ReminderStatus = ReminderStatus = {}));
// Main reminder scheduler service
class ReminderScheduler {
    constructor(config = exports.DEFAULT_REMINDER_CONFIG) {
        this.isRunning = false;
        this.config = config;
    }
    // Start the reminder scheduler
    start() {
        if (this.isRunning) {
            console.log('Reminder scheduler is already running');
            return;
        }
        this.isRunning = true;
        console.log('🚀 Starting reminder scheduler...');
        // Check for reminders every 5 minutes
        this.intervalId = setInterval(async () => {
            await this.processReminders();
        }, 5 * 60 * 1000);
        // Also process immediately on start
        this.processReminders();
    }
    // Stop the reminder scheduler
    stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
        console.log('🛑 Reminder scheduler stopped');
    }
    // Schedule reminders for a new appointment
    async scheduleAppointmentReminders(appointment) {
        try {
            const appointmentDate = new Date(appointment.appointment_date);
            const now = new Date();
            // Schedule confirmation reminder (1 hour after booking)
            const confirmationTime = new Date(now.getTime() + this.config.confirmationHoursAfter * 60 * 60 * 1000);
            await this.scheduleReminder({
                appointmentId: appointment.id,
                patientId: appointment.patient_id,
                doctorId: appointment.doctor_id,
                type: ReminderType.CONFIRMATION,
                scheduledFor: confirmationTime,
                metadata: {
                    appointmentType: appointment.type,
                    appointmentDate: appointmentDate.toISOString(),
                    appointmentTime: appointment.time
                }
            });
            // Schedule reminders before appointment
            for (const hoursBefore of this.config.reminderHoursBefore) {
                const reminderTime = new Date(appointmentDate.getTime() - hoursBefore * 60 * 60 * 1000);
                // Only schedule if reminder time is in the future
                if (reminderTime > now) {
                    const reminderType = hoursBefore === 24 ? ReminderType.REMINDER_24H : ReminderType.REMINDER_2H;
                    await this.scheduleReminder({
                        appointmentId: appointment.id,
                        patientId: appointment.patient_id,
                        doctorId: appointment.doctor_id,
                        type: reminderType,
                        scheduledFor: reminderTime,
                        metadata: {
                            appointmentType: appointment.type,
                            appointmentDate: appointmentDate.toISOString(),
                            appointmentTime: appointment.time,
                            hoursBefore
                        }
                    });
                }
            }
            // Schedule follow-up reminder (24 hours after appointment)
            const followUpTime = new Date(appointmentDate.getTime() + this.config.followUpHoursAfter * 60 * 60 * 1000);
            await this.scheduleReminder({
                appointmentId: appointment.id,
                patientId: appointment.patient_id,
                doctorId: appointment.doctor_id,
                type: ReminderType.FOLLOW_UP,
                scheduledFor: followUpTime,
                metadata: {
                    appointmentType: appointment.type,
                    appointmentDate: appointmentDate.toISOString(),
                    appointmentTime: appointment.time
                }
            });
            // Schedule doctor reminder (1 hour before appointment)
            const doctorReminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
            if (doctorReminderTime > now) {
                await this.scheduleReminder({
                    appointmentId: appointment.id,
                    patientId: appointment.patient_id,
                    doctorId: appointment.doctor_id,
                    type: ReminderType.DOCTOR_REMINDER,
                    scheduledFor: doctorReminderTime,
                    metadata: {
                        appointmentType: appointment.type,
                        appointmentDate: appointmentDate.toISOString(),
                        appointmentTime: appointment.time
                    }
                });
            }
            console.log(`✅ Scheduled ${this.config.reminderHoursBefore.length + 3} reminders for appointment ${appointment.id}`);
        }
        catch (error) {
            console.error('Failed to schedule appointment reminders:', error);
            throw error;
        }
    }
    // Cancel all reminders for an appointment
    async cancelAppointmentReminders(appointmentId) {
        try {
            // In a real implementation, you would update the reminder records in the database
            // For now, we'll just log the cancellation
            console.log(`🚫 Cancelled reminders for appointment ${appointmentId}`);
            await (0, audit_1.logAudit)({
                action: 'UPDATE',
                resourceType: 'APPOINTMENT',
                resourceId: appointmentId.toString(),
                reason: 'Appointment cancelled - reminders cancelled',
                metadata: {
                    appointmentId,
                    reminderAction: 'CANCELLED'
                }
            });
        }
        catch (error) {
            console.error('Failed to cancel appointment reminders:', error);
            throw error;
        }
    }
    // Process all due reminders
    async processReminders() {
        try {
            const now = new Date();
            console.log(`⏰ Processing reminders at ${now.toISOString()}`);
            // Get all appointments that need reminders
            const upcomingAppointments = await this.getUpcomingAppointments();
            for (const appointment of upcomingAppointments) {
                await this.processAppointmentReminders(appointment, now);
            }
        }
        catch (error) {
            console.error('Failed to process reminders:', error);
        }
    }
    // Process reminders for a specific appointment
    async processAppointmentReminders(appointment, now) {
        try {
            const appointmentDate = new Date(appointment.appointment_date);
            // Check if appointment is cancelled
            if (appointment.status === 'CANCELLED') {
                return;
            }
            // Send 24-hour reminder
            if (this.shouldSend24HourReminder(appointmentDate, now)) {
                await this.send24HourReminder(appointment);
            }
            // Send 2-hour reminder
            if (this.shouldSend2HourReminder(appointmentDate, now)) {
                await this.send2HourReminder(appointment);
            }
            // Send doctor reminder
            if (this.shouldSendDoctorReminder(appointmentDate, now)) {
                await this.sendDoctorReminder(appointment);
            }
            // Send follow-up reminder
            if (this.shouldSendFollowUpReminder(appointmentDate, now)) {
                await this.sendFollowUpReminder(appointment);
            }
        }
        catch (error) {
            console.error(`Failed to process reminders for appointment ${appointment.id}:`, error);
        }
    }
    // Check if 24-hour reminder should be sent
    shouldSend24HourReminder(appointmentDate, now) {
        const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff <= 24 && hoursDiff > 23; // Between 23-24 hours before
    }
    // Check if 2-hour reminder should be sent
    shouldSend2HourReminder(appointmentDate, now) {
        const reminderTime = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff <= 2 && hoursDiff > 1; // Between 1-2 hours before
    }
    // Check if doctor reminder should be sent
    shouldSendDoctorReminder(appointmentDate, now) {
        const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff <= 1 && hoursDiff > 0; // Between 0-1 hour before
    }
    // Check if follow-up reminder should be sent
    shouldSendFollowUpReminder(appointmentDate, now) {
        const reminderTime = new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000);
        const timeDiff = now.getTime() - appointmentDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff >= 24 && hoursDiff < 25; // Between 24-25 hours after
    }
    // Send 24-hour reminder
    async send24HourReminder(appointment) {
        try {
            await notifications_1.notificationService.sendAppointmentReminder(appointment);
            console.log(`📅 Sent 24-hour reminder for appointment ${appointment.id}`);
            await (0, audit_1.logAudit)({
                action: 'CREATE',
                resourceType: 'APPOINTMENT',
                resourceId: appointment.id.toString(),
                patientId: appointment.patient_id,
                reason: '24-hour appointment reminder sent',
                metadata: {
                    reminderType: '24_HOUR',
                    appointmentId: appointment.id
                }
            });
        }
        catch (error) {
            console.error(`Failed to send 24-hour reminder for appointment ${appointment.id}:`, error);
        }
    }
    // Send 2-hour reminder
    async send2HourReminder(appointment) {
        try {
            await notifications_1.notificationService.sendAppointmentReminder(appointment);
            console.log(`⏰ Sent 2-hour reminder for appointment ${appointment.id}`);
            await (0, audit_1.logAudit)({
                action: 'CREATE',
                resourceType: 'APPOINTMENT',
                resourceId: appointment.id.toString(),
                patientId: appointment.patient_id,
                reason: '2-hour appointment reminder sent',
                metadata: {
                    reminderType: '2_HOUR',
                    appointmentId: appointment.id
                }
            });
        }
        catch (error) {
            console.error(`Failed to send 2-hour reminder for appointment ${appointment.id}:`, error);
        }
    }
    // Send doctor reminder
    async sendDoctorReminder(appointment) {
        try {
            // Send in-app notification to doctor
            await notifications_1.notificationService.sendAppointmentReminderTemplate(appointment, email_scheduler_1.SchedulingStrategy.IMMEDIATE);
            console.log(`👨‍⚕️ Sent doctor reminder for appointment ${appointment.id}`);
            await (0, audit_1.logAudit)({
                action: 'CREATE',
                resourceType: 'APPOINTMENT',
                resourceId: appointment.id.toString(),
                patientId: appointment.patient_id,
                reason: 'Doctor reminder sent',
                metadata: {
                    reminderType: 'DOCTOR_REMINDER',
                    appointmentId: appointment.id
                }
            });
        }
        catch (error) {
            console.error(`Failed to send doctor reminder for appointment ${appointment.id}:`, error);
        }
    }
    // Send follow-up reminder
    async sendFollowUpReminder(appointment) {
        try {
            // Send follow-up email to patient
            await notifications_1.notificationService.sendAppointmentReminderTemplate(appointment, email_scheduler_1.SchedulingStrategy.DELAYED);
            console.log(`📧 Sent follow-up reminder for appointment ${appointment.id}`);
            await (0, audit_1.logAudit)({
                action: 'CREATE',
                resourceType: 'APPOINTMENT',
                resourceId: appointment.id.toString(),
                patientId: appointment.patient_id,
                reason: 'Follow-up reminder sent',
                metadata: {
                    reminderType: 'FOLLOW_UP',
                    appointmentId: appointment.id
                }
            });
        }
        catch (error) {
            console.error(`Failed to send follow-up reminder for appointment ${appointment.id}:`, error);
        }
    }
    // Get upcoming appointments that need reminders
    async getUpcomingAppointments() {
        try {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
            const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
            const appointments = await db_1.default.appointment.findMany({
                where: {
                    appointment_date: {
                        gte: pastDate,
                        lte: futureDate
                    },
                    status: {
                        in: ['PENDING', 'SCHEDULED']
                    }
                },
                include: {
                    patient: true,
                    doctor: true
                }
            });
            return appointments;
        }
        catch (error) {
            console.error('Failed to get upcoming appointments:', error);
            return [];
        }
    }
    // Schedule a reminder (placeholder for database integration)
    async scheduleReminder(reminder) {
        // In a real implementation, you would store this in a reminders table
        // For now, we'll just log it
        console.log(`📅 Scheduled reminder:`, {
            appointmentId: reminder.appointmentId,
            type: reminder.type,
            scheduledFor: reminder.scheduledFor.toISOString()
        });
    }
    // Update reminder configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Updated reminder configuration:', this.config);
    }
    // Get current configuration
    getConfig() {
        return { ...this.config };
    }
    // Get scheduler status
    getStatus() {
        return {
            isRunning: this.isRunning,
            config: this.getConfig()
        };
    }
}
exports.ReminderScheduler = ReminderScheduler;
// Export singleton instance
exports.reminderScheduler = new ReminderScheduler();
// Auto-start the scheduler when this module is imported
if (process.env.NODE_ENV === 'production') {
    exports.reminderScheduler.start();
}
