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
export interface TemplateVariable {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    required: boolean;
    description: string;
    defaultValue?: any;
}
export interface TemplateContext {
    recipientName: string;
    recipientEmail: string;
    recipientPhone?: string;
    appointmentId?: string;
    appointmentType?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    doctorName?: string;
    doctorSpecialization?: string;
    facilityName?: string;
    systemName?: string;
    supportEmail?: string;
    supportPhone?: string;
    websiteUrl?: string;
    previousDate?: string;
    previousTime?: string;
    reason?: string;
}
export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    version: string;
    type: NotificationType;
    channel: NotificationChannel;
    subject?: string;
    body: string;
    smsBody?: string;
    variables: string[];
    fallbacks?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class TemplateEngine {
    private static instance;
    private templateCache;
    private compiledTemplates;
    private cacheSize;
    private constructor();
    static getInstance(): TemplateEngine;
    compileTemplate(template: string): Function;
    private getVariableValue;
    private getFallbackValue;
    private getDateFormat;
    private formatDate;
    renderTemplate(template: string, context: TemplateContext): string;
    validateTemplate(template: string, requiredVariables: string[]): boolean;
    clearCache(): void;
    getStats(): {
        cacheSize: number;
        compiledTemplates: number;
    };
}
export declare class TemplateRegistry {
    private static instance;
    private templates;
    private engine;
    private constructor();
    static getInstance(): TemplateRegistry;
    private initializeDefaultTemplates;
    registerTemplate(template: TemplateConfig): void;
    getTemplate(id: string): TemplateConfig | undefined;
    getTemplates(type: NotificationType, channel: NotificationChannel): TemplateConfig[];
    renderTemplate(templateId: string, context: TemplateContext): string;
    getTemplateSubject(templateId: string, context: TemplateContext): string;
    validateTemplate(templateBody: string, variables: string[]): boolean;
    listTemplates(): TemplateConfig[];
    updateTemplate(id: string, updates: Partial<TemplateConfig>): void;
    deleteTemplate(id: string): boolean;
    private incrementVersion;
    private getDefaultAppointmentBookedEmail;
    private getDefaultAppointmentReminderEmail;
    private getDefaultAppointmentCancelledEmail;
    private getDefaultAppointmentConfirmedEmail;
    private getDefaultAppointmentRescheduledEmail;
    private getDefaultAppointmentReminderSMS;
    private getDefaultAppointmentBookedSMS;
    private getDefaultAppointmentCancelledSMS;
    private getDefaultAppointmentRescheduledSMS;
}
