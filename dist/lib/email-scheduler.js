"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSchedulingPatterns = exports.EmailScheduler = exports.SchedulingStrategy = exports.NotificationPriority = void 0;
const template_engine_1 = require("./template-engine");
const audit_1 = require("./audit");
// Define priority enum locally to avoid circular dependency
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "LOW";
    NotificationPriority["MEDIUM"] = "MEDIUM";
    NotificationPriority["HIGH"] = "HIGH";
    NotificationPriority["URGENT"] = "URGENT";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
// Email scheduling strategies
var SchedulingStrategy;
(function (SchedulingStrategy) {
    SchedulingStrategy["IMMEDIATE"] = "IMMEDIATE";
    SchedulingStrategy["DELAYED"] = "DELAYED";
    SchedulingStrategy["SCHEDULED"] = "SCHEDULED";
    SchedulingStrategy["INTELLIGENT"] = "INTELLIGENT";
    SchedulingStrategy["BATCH"] = "BATCH";
    SchedulingStrategy["CONDITIONAL"] = "CONDITIONAL"; // Send based on conditions
})(SchedulingStrategy || (exports.SchedulingStrategy = SchedulingStrategy = {}));
// Email scheduler class
class EmailScheduler {
    constructor() {
        this.jobs = new Map();
        this.isRunning = false;
        this.templateRegistry = template_engine_1.TemplateRegistry.getInstance();
        this.timezoneConfig = {
            defaultTimezone: 'UTC',
            businessHours: {
                start: '09:00',
                end: '17:00',
                days: [1, 2, 3, 4, 5] // Monday to Friday
            }
        };
    }
    static getInstance() {
        if (!EmailScheduler.instance) {
            EmailScheduler.instance = new EmailScheduler();
        }
        return EmailScheduler.instance;
    }
    // Schedule an email
    async scheduleEmail(templateId, context, config) {
        try {
            // Validate template exists
            const template = this.templateRegistry.getTemplate(templateId);
            if (!template) {
                throw new Error(`Template not found: ${templateId}`);
            }
            // Calculate scheduled time based on strategy
            const scheduledTime = this.calculateScheduledTime(config);
            // Create email job
            const job = {
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
            await (0, audit_1.logAudit)({
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
        }
        catch (error) {
            console.error('Failed to schedule email:', error);
            throw error;
        }
    }
    // Calculate scheduled time based on strategy
    calculateScheduledTime(config) {
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
    calculateIntelligentTime(config) {
        const now = new Date();
        const userTimezone = config.timezone || this.timezoneConfig.defaultTimezone;
        // Convert to user timezone
        const userTime = this.convertToTimezone(now, userTimezone);
        // Check if within business hours
        if (this.isWithinBusinessHours(userTime)) {
            // Send within next 30 minutes
            return new Date(now.getTime() + 30 * 60 * 1000);
        }
        else {
            // Send at next business day start
            return this.getNextBusinessDayStart(userTime);
        }
    }
    // Calculate batch scheduling time
    calculateBatchTime(config) {
        const now = new Date();
        const batchSize = config.batchSize || 10;
        // Find next batch window (every 15 minutes)
        const batchWindow = 15 * 60 * 1000; // 15 minutes
        const nextWindow = Math.ceil(now.getTime() / batchWindow) * batchWindow;
        return new Date(nextWindow);
    }
    // Calculate conditional scheduling time
    calculateConditionalTime(config, now) {
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
    isWithinBusinessHours(time) {
        const day = time.getDay();
        const hour = time.getHours();
        const minute = time.getMinutes();
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        return (this.timezoneConfig.businessHours.days.includes(day) &&
            timeString >= this.timezoneConfig.businessHours.start &&
            timeString <= this.timezoneConfig.businessHours.end);
    }
    // Get next business day start
    getNextBusinessDayStart(time) {
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
    convertToTimezone(time, timezone) {
        try {
            // Simple timezone conversion (can be enhanced with libraries like moment-timezone)
            const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
            return new Date(utc);
        }
        catch (error) {
            console.warn('Timezone conversion failed, using UTC:', error);
            return time;
        }
    }
    // Start the scheduler
    start() {
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
    stop() {
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
    async processJobs() {
        const now = new Date();
        const pendingJobs = Array.from(this.jobs.values()).filter(job => job.status === 'scheduled' && job.scheduledFor <= now);
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
    async processJob(job) {
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
                await (0, audit_1.logAudit)({
                    action: 'CREATE',
                    resourceType: 'SYSTEM',
                    resourceId: job.id,
                    reason: 'Email sent successfully',
                    metadata: {
                        templateId: job.templateId,
                        status: 'sent'
                    }
                });
            }
            else {
                throw new Error('Email sending failed');
            }
        }
        catch (error) {
            console.error(`❌ Failed to process email job ${job.id}:`, error);
            job.attempts++;
            job.updatedAt = new Date();
            if (job.attempts >= job.config.retryAttempts) {
                job.status = 'failed';
                console.error(`💀 Email job ${job.id} failed after ${job.attempts} attempts`);
            }
            else {
                // Reschedule for retry
                job.status = 'scheduled';
                job.scheduledFor = new Date(Date.now() + job.config.retryDelay);
                console.log(`🔄 Rescheduling email job ${job.id} for retry ${job.attempts + 1}`);
            }
            this.jobs.set(job.id, job);
        }
    }
    // Send email (placeholder - integrate with your email service)
    async sendEmail(job) {
        try {
            // Render template
            const body = this.templateRegistry.renderTemplate(job.templateId, job.context);
            const subject = this.templateRegistry.getTemplateSubject(job.templateId, job.context);
            // TODO: Integrate with your email service here
            console.log(`📧 Sending email to ${job.context.recipientEmail}`);
            console.log(`📧 Subject: ${subject}`);
            console.log(`📧 Body length: ${body.length} characters`);
            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
        }
        catch (error) {
            console.error('Email sending error:', error);
            return false;
        }
    }
    // Utility methods
    generateJobId() {
        return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    // Get job status
    getJobStatus(jobId) {
        return this.jobs.get(jobId);
    }
    // Cancel job
    cancelJob(jobId) {
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
    getStats() {
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
    clearCompletedJobs() {
        const completedJobs = Array.from(this.jobs.entries()).filter(([_, job]) => ['sent', 'failed', 'cancelled'].includes(job.status));
        for (const [jobId, _] of completedJobs) {
            this.jobs.delete(jobId);
        }
        console.log(`🧹 Cleared ${completedJobs.length} completed email jobs`);
    }
    // Update timezone configuration
    updateTimezoneConfig(config) {
        this.timezoneConfig = { ...this.timezoneConfig, ...config };
        console.log('✅ Timezone configuration updated');
    }
}
exports.EmailScheduler = EmailScheduler;
// Convenience functions for common scheduling patterns
class EmailSchedulingPatterns {
    // Schedule immediate email
    static async immediate(templateId, context, priority = NotificationPriority.MEDIUM) {
        const scheduler = EmailScheduler.getInstance();
        return scheduler.scheduleEmail(templateId, context, {
            strategy: SchedulingStrategy.IMMEDIATE,
            priority,
            retryAttempts: 3,
            retryDelay: 5 * 60 * 1000 // 5 minutes
        });
    }
    // Schedule delayed email
    static async delayed(templateId, context, delayMs, priority = NotificationPriority.MEDIUM) {
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
    static async scheduled(templateId, context, scheduledTime, priority = NotificationPriority.MEDIUM) {
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
    static async intelligent(templateId, context, timezone, priority = NotificationPriority.MEDIUM) {
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
    static async batch(templateId, context, batchSize = 10, priority = NotificationPriority.LOW) {
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
exports.EmailSchedulingPatterns = EmailSchedulingPatterns;
