import { TemplateContext } from './template-engine';
export declare enum NotificationPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum SchedulingStrategy {
    IMMEDIATE = "IMMEDIATE",// Send immediately
    DELAYED = "DELAYED",// Send after a specific delay
    SCHEDULED = "SCHEDULED",// Send at a specific time
    INTELLIGENT = "INTELLIGENT",// Smart scheduling based on user preferences
    BATCH = "BATCH",// Batch multiple emails together
    CONDITIONAL = "CONDITIONAL"
}
export interface TimezoneConfig {
    defaultTimezone: string;
    userTimezone?: string;
    businessHours: {
        start: string;
        end: string;
        days: number[];
    };
}
export interface SchedulingConfig {
    strategy: SchedulingStrategy;
    delay?: number;
    scheduledTime?: Date;
    timezone?: string;
    priority: NotificationPriority;
    retryAttempts: number;
    retryDelay: number;
    batchSize?: number;
    conditions?: SchedulingCondition[];
}
export interface SchedulingCondition {
    type: 'time' | 'user_preference' | 'business_hours' | 'urgency';
    value: any;
    operator: 'equals' | 'greater_than' | 'less_than' | 'in_range' | 'not';
}
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
export declare class EmailScheduler {
    private static instance;
    private jobs;
    private templateRegistry;
    private timezoneConfig;
    private isRunning;
    private intervalId?;
    private constructor();
    static getInstance(): EmailScheduler;
    scheduleEmail(templateId: string, context: TemplateContext, config: SchedulingConfig): Promise<string>;
    private calculateScheduledTime;
    private calculateIntelligentTime;
    private calculateBatchTime;
    private calculateConditionalTime;
    private isWithinBusinessHours;
    private getNextBusinessDayStart;
    private convertToTimezone;
    start(): void;
    stop(): void;
    private processJobs;
    private processJob;
    private sendEmail;
    private generateJobId;
    private chunkArray;
    getJobStatus(jobId: string): EmailJob | undefined;
    cancelJob(jobId: string): boolean;
    getStats(): {
        totalJobs: number;
        pendingJobs: number;
        sentJobs: number;
        failedJobs: number;
        cancelledJobs: number;
        isRunning: boolean;
    };
    clearCompletedJobs(): void;
    updateTimezoneConfig(config: Partial<TimezoneConfig>): void;
}
export declare class EmailSchedulingPatterns {
    static immediate(templateId: string, context: TemplateContext, priority?: NotificationPriority): Promise<string>;
    static delayed(templateId: string, context: TemplateContext, delayMs: number, priority?: NotificationPriority): Promise<string>;
    static scheduled(templateId: string, context: TemplateContext, scheduledTime: Date, priority?: NotificationPriority): Promise<string>;
    static intelligent(templateId: string, context: TemplateContext, timezone?: string, priority?: NotificationPriority): Promise<string>;
    static batch(templateId: string, context: TemplateContext, batchSize?: number, priority?: NotificationPriority): Promise<string>;
}
