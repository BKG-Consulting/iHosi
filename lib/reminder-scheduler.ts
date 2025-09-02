import { Appointment, Doctor, Patient } from '@prisma/client';
import { notificationService } from './notifications';
import { logAudit } from './audit';
import { SchedulingStrategy } from './email-scheduler';
import db from './db';

// Reminder timing configuration
export interface ReminderConfig {
  // Send reminder X hours before appointment
  reminderHoursBefore: number[];
  // Send confirmation X hours after booking
  confirmationHoursAfter: number;
  // Send follow-up X hours after appointment
  followUpHoursAfter: number;
  // Timezone for scheduling (default to system timezone)
  timezone: string;
}

// Default reminder configuration
export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  reminderHoursBefore: [24, 2], // 24 hours and 2 hours before
  confirmationHoursAfter: 1, // 1 hour after booking
  followUpHoursAfter: 24, // 24 hours after appointment
  timezone: 'UTC'
};

// Reminder types
export enum ReminderType {
  CONFIRMATION = 'CONFIRMATION',
  REMINDER_24H = 'REMINDER_24H',
  REMINDER_2H = 'REMINDER_2H',
  FOLLOW_UP = 'FOLLOW_UP',
  DOCTOR_REMINDER = 'DOCTOR_REMINDER'
}

// Reminder status
export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Reminder record interface
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

// Main reminder scheduler service
export class ReminderScheduler {
  private config: ReminderConfig;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  
  constructor(config: ReminderConfig = DEFAULT_REMINDER_CONFIG) {
    this.config = config;
  }
  
  // Start the reminder scheduler
  start(): void {
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
  stop(): void {
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
  async scheduleAppointmentReminders(appointment: Appointment & { patient: Patient; doctor: Doctor }): Promise<void> {
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
      
    } catch (error) {
      console.error('Failed to schedule appointment reminders:', error);
      throw error;
    }
  }
  
  // Cancel all reminders for an appointment
  async cancelAppointmentReminders(appointmentId: number): Promise<void> {
    try {
      // In a real implementation, you would update the reminder records in the database
      // For now, we'll just log the cancellation
      console.log(`🚫 Cancelled reminders for appointment ${appointmentId}`);
      
      await logAudit({
        action: 'UPDATE',
        resourceType: 'APPOINTMENT',
        resourceId: appointmentId.toString(),
        reason: 'Appointment cancelled - reminders cancelled',
        metadata: {
          appointmentId,
          reminderAction: 'CANCELLED'
        }
      });
      
    } catch (error) {
      console.error('Failed to cancel appointment reminders:', error);
      throw error;
    }
  }
  
  // Process all due reminders
  private async processReminders(): Promise<void> {
    try {
      const now = new Date();
      console.log(`⏰ Processing reminders at ${now.toISOString()}`);
      
      // Get all appointments that need reminders
      const upcomingAppointments = await this.getUpcomingAppointments();
      
      for (const appointment of upcomingAppointments) {
        await this.processAppointmentReminders(appointment, now);
      }
      
    } catch (error) {
      console.error('Failed to process reminders:', error);
    }
  }
  
  // Process reminders for a specific appointment
  private async processAppointmentReminders(
    appointment: Appointment & { patient: Patient; doctor: Doctor },
    now: Date
  ): Promise<void> {
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
      
    } catch (error) {
      console.error(`Failed to process reminders for appointment ${appointment.id}:`, error);
    }
  }
  
  // Check if 24-hour reminder should be sent
  private shouldSend24HourReminder(appointmentDate: Date, now: Date): boolean {
    const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff <= 24 && hoursDiff > 23; // Between 23-24 hours before
  }
  
  // Check if 2-hour reminder should be sent
  private shouldSend2HourReminder(appointmentDate: Date, now: Date): boolean {
    const reminderTime = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff <= 2 && hoursDiff > 1; // Between 1-2 hours before
  }
  
  // Check if doctor reminder should be sent
  private shouldSendDoctorReminder(appointmentDate: Date, now: Date): boolean {
    const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff <= 1 && hoursDiff > 0; // Between 0-1 hour before
  }
  
  // Check if follow-up reminder should be sent
  private shouldSendFollowUpReminder(appointmentDate: Date, now: Date): boolean {
    const reminderTime = new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000);
    const timeDiff = now.getTime() - appointmentDate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff >= 24 && hoursDiff < 25; // Between 24-25 hours after
  }
  
  // Send 24-hour reminder
  private async send24HourReminder(appointment: Appointment & { patient: Patient; doctor: Doctor }): Promise<void> {
    try {
      await notificationService.sendAppointmentReminder(appointment);
      console.log(`📅 Sent 24-hour reminder for appointment ${appointment.id}`);
      
      await logAudit({
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
      
    } catch (error) {
      console.error(`Failed to send 24-hour reminder for appointment ${appointment.id}:`, error);
    }
  }
  
  // Send 2-hour reminder
  private async send2HourReminder(appointment: Appointment & { patient: Patient; doctor: Doctor }): Promise<void> {
    try {
      await notificationService.sendAppointmentReminder(appointment);
      console.log(`⏰ Sent 2-hour reminder for appointment ${appointment.id}`);
      
      await logAudit({
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
      
    } catch (error) {
      console.error(`Failed to send 2-hour reminder for appointment ${appointment.id}:`, error);
    }
  }
  
  // Send doctor reminder
  private async sendDoctorReminder(appointment: Appointment & { patient: Patient; doctor: Doctor }): Promise<void> {
    try {
      // Send in-app notification to doctor
      await notificationService.sendAppointmentReminderTemplate(
        appointment,
        SchedulingStrategy.IMMEDIATE
      );
      
      console.log(`👨‍⚕️ Sent doctor reminder for appointment ${appointment.id}`);
      
      await logAudit({
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
      
    } catch (error) {
      console.error(`Failed to send doctor reminder for appointment ${appointment.id}:`, error);
    }
  }
  
  // Send follow-up reminder
  private async sendFollowUpReminder(appointment: Appointment & { patient: Patient; doctor: Doctor }): Promise<void> {
    try {
      // Send follow-up email to patient
      await notificationService.sendAppointmentReminderTemplate(
        appointment,
        SchedulingStrategy.DELAYED
      );
      
      console.log(`📧 Sent follow-up reminder for appointment ${appointment.id}`);
      
      await logAudit({
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
      
    } catch (error) {
      console.error(`Failed to send follow-up reminder for appointment ${appointment.id}:`, error);
    }
  }
  
  // Get upcoming appointments that need reminders
  private async getUpcomingAppointments(): Promise<(Appointment & { patient: Patient; doctor: Doctor })[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const appointments = await db.appointment.findMany({
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
      
    } catch (error) {
      console.error('Failed to get upcoming appointments:', error);
      return [];
    }
  }
  
  // Schedule a reminder (placeholder for database integration)
  private async scheduleReminder(reminder: Omit<ReminderRecord, 'id' | 'status'>): Promise<void> {
    // In a real implementation, you would store this in a reminders table
    // For now, we'll just log it
    console.log(`📅 Scheduled reminder:`, {
      appointmentId: reminder.appointmentId,
      type: reminder.type,
      scheduledFor: reminder.scheduledFor.toISOString()
    });
  }
  
  // Update reminder configuration
  updateConfig(newConfig: Partial<ReminderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Updated reminder configuration:', this.config);
  }
  
  // Get current configuration
  getConfig(): ReminderConfig {
    return { ...this.config };
  }
  
  // Get scheduler status
  getStatus(): { isRunning: boolean; config: ReminderConfig } {
    return {
      isRunning: this.isRunning,
      config: this.getConfig()
    };
  }
}

// Export singleton instance
export const reminderScheduler = new ReminderScheduler();

// Auto-start the scheduler when this module is imported
if (process.env.NODE_ENV === 'production') {
  reminderScheduler.start();
}
