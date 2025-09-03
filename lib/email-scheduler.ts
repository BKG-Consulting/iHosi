import { TemplateRegistry, TemplateContext } from './template-engine';
import { logAudit } from './audit';

// Define priority enum locally to avoid circular dependency
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Email scheduling strategies
export enum SchedulingStrategy {
  IMMEDIATE = 'IMMEDIATE',           // Send immediately
  DELAYED = 'DELAYED',               // Send after a specific delay
  SCHEDULED = 'SCHEDULED',           // Send at a specific time
  INTELLIGENT = 'INTELLIGENT',       // Smart scheduling based on user preferences
  BATCH = 'BATCH',                   // Batch multiple emails together
  CONDITIONAL = 'CONDITIONAL'        // Send based on conditions
}

// Timezone handling
export interface TimezoneConfig {
  defaultTimezone: string;
  userTimezone?: string;
  businessHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
    days: number[]; // [1,2,3,4,5] for Mon-Fri
  };
}

// Scheduling configuration
export interface SchedulingConfig {
  strategy: SchedulingStrategy;
  delay?: number; // milliseconds
  scheduledTime?: Date;
  timezone?: string;
  priority: NotificationPriority;
  retryAttempts: number;
  retryDelay: number; // milliseconds
  batchSize?: number;
  conditions?: SchedulingCondition[];
}

// Scheduling conditions
export interface SchedulingCondition {
  type: 'time' | 'user_preference' | 'business_hours' | 'urgency';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'in_range' | 'not';
}

// Email job interface
export interface EmailJob {
  id: string;
  templateId: string;
  context: TemplateContext;
  config: SchedulingConfig;
  status: 'pending' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  scheduledFor: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Email scheduler class
export class EmailScheduler {
  private static instance: EmailScheduler;
  private jobs: Map<string, EmailJob> = new Map();
  private templateRegistry: TemplateRegistry;
  private timezoneConfig: TimezoneConfig;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;

  private constructor() {
    this.templateRegistry = TemplateRegistry.getInstance();
    this.timezoneConfig = {
      defaultTimezone: 'UTC',
      businessHours: {
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5] // Monday to Friday
      }
    };
  }

  public static getInstance(): EmailScheduler {
    if (!EmailScheduler.instance) {
      EmailScheduler.instance = new EmailScheduler();
    }
    return EmailScheduler.instance;
  }

  // Schedule an email
  public async scheduleEmail(
    templateId: string,
    context: TemplateContext,
    config: SchedulingConfig
  ): Promise<string> {
    try {
      // Validate template exists
      const template = this.templateRegistry.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Calculate scheduled time based on strategy
      const scheduledTime = this.calculateScheduledTime(config);
      
      // Create email job
      const job: EmailJob = {
        id: this.generateJobId(),
        templateId,
        context,
        config,
        status: 'scheduled',
        attempts: 0,
        scheduledFor: scheduledTime,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store job
      this.jobs.set(job.id, job);

      // Log audit
      await logAudit({
        action: 'CREATE',
        resourceType: 'SYSTEM',
        resourceId: job.id,
        reason: `Email scheduled using ${config.strategy} strategy`,
        metadata: {
          templateId,
          scheduledFor: scheduledTime,
          strategy: config.strategy,
          priority: config.priority
        }
      });

      console.log(`✅ Email scheduled: ${job.id} for ${scheduledTime.toISOString()}`);
      return job.id;

    } catch (error) {
      console.error('Failed to schedule email:', error);
      throw error;
    }
  }

  // Calculate scheduled time based on strategy
  private calculateScheduledTime(config: SchedulingConfig): Date {
    const now = new Date();

    switch (config.strategy) {
      case SchedulingStrategy.IMMEDIATE:
        return now;

      case SchedulingStrategy.DELAYED:
        if (!config.delay) {
          throw new Error('Delay required for DELAYED strategy');
        }
        return new Date(now.getTime() + config.delay);

      case SchedulingStrategy.SCHEDULED:
        if (!config.scheduledTime) {
          throw new Error('Scheduled time required for SCHEDULED strategy');
        }
        return config.scheduledTime;

      case SchedulingStrategy.INTELLIGENT:
        return this.calculateIntelligentTime(config);

      case SchedulingStrategy.BATCH:
        return this.calculateBatchTime(config);

      case SchedulingStrategy.CONDITIONAL:
        return this.calculateConditionalTime(config, now);

      default:
        return now;
    }
  }

  // Calculate intelligent scheduling time
  private calculateIntelligentTime(config: SchedulingConfig): Date {
    const now = new Date();
    const userTimezone = config.timezone || this.timezoneConfig.defaultTimezone;
    
    // Convert to user timezone
    const userTime = this.convertToTimezone(now, userTimezone);
    
    // Check if within business hours
    if (this.isWithinBusinessHours(userTime)) {
      // Send within next 30 minutes
      return new Date(now.getTime() + 30 * 60 * 1000);
    } else {
      // Send at next business day start
      return this.getNextBusinessDayStart(userTime);
    }
  }

  // Calculate batch scheduling time
  private calculateBatchTime(config: SchedulingConfig): Date {
    const now = new Date();
    const batchSize = config.batchSize || 10;
    
    // Find next batch window (every 15 minutes)
    const batchWindow = 15 * 60 * 1000; // 15 minutes
    const nextWindow = Math.ceil(now.getTime() / batchWindow) * batchWindow;
    
    return new Date(nextWindow);
  }

  // Calculate conditional scheduling time
  private calculateConditionalTime(config: SchedulingConfig, now: Date): Date {
    if (!config.conditions || config.conditions.length === 0) {
      return now;
    }

    // Evaluate conditions and determine best time
    for (const condition of config.conditions) {
      switch (condition.type) {
        case 'business_hours':
          if (!this.isWithinBusinessHours(now)) {
            return this.getNextBusinessDayStart(now);
          }
          break;
        
        case 'urgency':
          if (condition.value === 'high' && condition.operator === 'equals') {
            return now; // Send immediately for high urgency
          }
          break;
      }
    }

    return now;
  }

  // Check if time is within business hours
  private isWithinBusinessHours(time: Date): boolean {
    const day = time.getDay();
    const hour = time.getHours();
    const minute = time.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    return (
      this.timezoneConfig.businessHours.days.includes(day) &&
      timeString >= this.timezoneConfig.businessHours.start &&
      timeString <= this.timezoneConfig.businessHours.end
    );
  }

  // Get next business day start
  private getNextBusinessDayStart(time: Date): Date {
    let nextDay = new Date(time);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Skip weekends
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    // Set to business hours start
    const [startHour, startMinute] = this.timezoneConfig.businessHours.start.split(':');
    nextDay.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    
    return nextDay;
  }

  // Convert time to specific timezone
  private convertToTimezone(time: Date, timezone: string): Date {
    try {
      // Simple timezone conversion (can be enhanced with libraries like moment-timezone)
      const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
      return new Date(utc);
    } catch (error) {
      console.warn('Timezone conversion failed, using UTC:', error);
      return time;
    }
  }

  // Start the scheduler
  public start(): void {
    if (this.isRunning) {
      console.log('Email scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting email scheduler...');

    // Process jobs every minute
    this.intervalId = setInterval(() => {
      this.processJobs();
    }, 60 * 1000);

    // Process immediately
    this.processJobs();
  }

  // Stop the scheduler
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('🛑 Email scheduler stopped');
  }

  // Process pending jobs
  private async processJobs(): Promise<void> {
    const now = new Date();
    const pendingJobs = Array.from(this.jobs.values()).filter(
      job => job.status === 'scheduled' && job.scheduledFor <= now
    );

    if (pendingJobs.length === 0) {
      return;
    }

    console.log(`📧 Processing ${pendingJobs.length} email jobs...`);

    // Process jobs in parallel with concurrency limit
    const concurrencyLimit = 5;
    const chunks = this.chunkArray(pendingJobs, concurrencyLimit);

    for (const chunk of chunks) {
      await Promise.all(chunk.map(job => this.processJob(job)));
    }
  }

  // Process individual job
  private async processJob(job: EmailJob): Promise<void> {
    try {
      console.log(`📧 Processing email job: ${job.id}`);

      // Update job status
      job.status = 'pending';
      job.updatedAt = new Date();
      this.jobs.set(job.id, job);

      // Send email (this would integrate with your email service)
      const success = await this.sendEmail(job);

      if (success) {
        job.status = 'sent';
        job.updatedAt = new Date();
        this.jobs.set(job.id, job);

        console.log(`✅ Email sent successfully: ${job.id}`);

        // Log audit
        await logAudit({
          action: 'CREATE',
          resourceType: 'SYSTEM',
          resourceId: job.id,
          reason: 'Email sent successfully',
          metadata: {
            templateId: job.templateId,
            status: 'sent'
          }
        });

      } else {
        throw new Error('Email sending failed');
      }

    } catch (error) {
      console.error(`❌ Failed to process email job ${job.id}:`, error);

      job.attempts++;
      job.updatedAt = new Date();

      if (job.attempts >= job.config.retryAttempts) {
        job.status = 'failed';
        console.error(`💀 Email job ${job.id} failed after ${job.attempts} attempts`);
      } else {
        // Reschedule for retry
        job.status = 'scheduled';
        job.scheduledFor = new Date(Date.now() + job.config.retryDelay);
        console.log(`🔄 Rescheduling email job ${job.id} for retry ${job.attempts + 1}`);
      }

      this.jobs.set(job.id, job);
    }
  }

  // Send email using the real email service
  private async sendEmail(job: EmailJob): Promise<boolean> {
    try {
      // Render template
      const body = this.templateRegistry.renderTemplate(job.templateId, job.context);
      const subject = this.templateRegistry.getTemplateSubject(job.templateId, job.context);

      console.log(`📧 Sending email to ${job.context.recipientEmail}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📧 Body length: ${body.length} characters`);

      // Use the real email service
      const { SendGridEmailService } = require('./email-service');
      const emailService = new SendGridEmailService();
      
      const success = await emailService.sendEmail(
        job.context.recipientEmail,
        subject,
        body
      );

      if (success) {
        console.log(`✅ Email sent successfully to ${job.context.recipientEmail}`);
      } else {
        console.error(`❌ Failed to send email to ${job.context.recipientEmail}`);
      }

      return success;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  // Utility methods
  private generateJobId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Get job status
  public getJobStatus(jobId: string): EmailJob | undefined {
    return this.jobs.get(jobId);
  }

  // Cancel job
  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'scheduled') {
      job.status = 'cancelled';
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);
      console.log(`❌ Email job cancelled: ${jobId}`);
      return true;
    }
    return false;
  }

  // Get scheduler statistics
  public getStats(): {
    totalJobs: number;
    pendingJobs: number;
    sentJobs: number;
    failedJobs: number;
    cancelledJobs: number;
    isRunning: boolean;
  } {
    const jobs = Array.from(this.jobs.values());
    
    return {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter(j => j.status === 'pending').length,
      sentJobs: jobs.filter(j => j.status === 'sent').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      cancelledJobs: jobs.filter(j => j.status === 'cancelled').length,
      isRunning: this.isRunning
    };
  }

  // Clear completed jobs (cleanup)
  public clearCompletedJobs(): void {
    const completedJobs = Array.from(this.jobs.entries()).filter(
      ([_, job]) => ['sent', 'failed', 'cancelled'].includes(job.status)
    );

    for (const [jobId, _] of completedJobs) {
      this.jobs.delete(jobId);
    }

    console.log(`🧹 Cleared ${completedJobs.length} completed email jobs`);
  }

  // Update timezone configuration
  public updateTimezoneConfig(config: Partial<TimezoneConfig>): void {
    this.timezoneConfig = { ...this.timezoneConfig, ...config };
    console.log('✅ Timezone configuration updated');
  }
}

// Convenience functions for common scheduling patterns
export class EmailSchedulingPatterns {
  // Schedule immediate email
  static async immediate(
    templateId: string,
    context: TemplateContext,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<string> {
    const scheduler = EmailScheduler.getInstance();
    return scheduler.scheduleEmail(templateId, context, {
      strategy: SchedulingStrategy.IMMEDIATE,
      priority,
      retryAttempts: 3,
      retryDelay: 5 * 60 * 1000 // 5 minutes
    });
  }

  // Schedule delayed email
  static async delayed(
    templateId: string,
    context: TemplateContext,
    delayMs: number,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<string> {
    const scheduler = EmailScheduler.getInstance();
    return scheduler.scheduleEmail(templateId, context, {
      strategy: SchedulingStrategy.DELAYED,
      delay: delayMs,
      priority,
      retryAttempts: 3,
      retryDelay: 5 * 60 * 1000
    });
  }

  // Schedule email for specific time
  static async scheduled(
    templateId: string,
    context: TemplateContext,
    scheduledTime: Date,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<string> {
    const scheduler = EmailScheduler.getInstance();
    return scheduler.scheduleEmail(templateId, context, {
      strategy: SchedulingStrategy.SCHEDULED,
      scheduledTime,
      priority,
      retryAttempts: 3,
      retryDelay: 5 * 60 * 1000
    });
  }

  // Schedule intelligent email
  static async intelligent(
    templateId: string,
    context: TemplateContext,
    timezone?: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<string> {
    const scheduler = EmailScheduler.getInstance();
    return scheduler.scheduleEmail(templateId, context, {
      strategy: SchedulingStrategy.INTELLIGENT,
      timezone,
      priority,
      retryAttempts: 3,
      retryDelay: 5 * 60 * 1000
    });
  }

  // Schedule batch email
  static async batch(
    templateId: string,
    context: TemplateContext,
    batchSize: number = 10,
    priority: NotificationPriority = NotificationPriority.LOW
  ): Promise<string> {
    const scheduler = EmailScheduler.getInstance();
    return scheduler.scheduleEmail(templateId, context, {
      strategy: SchedulingStrategy.BATCH,
      batchSize,
      priority,
      retryAttempts: 2,
      retryDelay: 10 * 60 * 1000 // 10 minutes
    });
  }
}
