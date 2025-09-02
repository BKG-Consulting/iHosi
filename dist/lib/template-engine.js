"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRegistry = exports.TemplateEngine = exports.NotificationChannel = exports.NotificationType = void 0;
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
// Template engine for rendering dynamic content
class TemplateEngine {
    constructor() {
        this.templateCache = new Map();
        this.compiledTemplates = new Map();
        this.cacheSize = 100; // Maximum cache size
    }
    static getInstance() {
        if (!TemplateEngine.instance) {
            TemplateEngine.instance = new TemplateEngine();
        }
        return TemplateEngine.instance;
    }
    // Compile template string into executable function
    compileTemplate(template) {
        try {
            // Simple template compilation using Function constructor
            // This is a basic implementation - in production, consider using a proper template engine
            const templateFunction = new Function('context', `
        return \`${template.replace(/\{\{([^}]+)\}\}/g, '${this.getVariableValue(context, "$1")}')}\`;
      `);
            return templateFunction.bind(this);
        }
        catch (error) {
            console.error('Template compilation error:', error);
            return () => 'Template compilation failed';
        }
    }
    // Get variable value from context with fallback support
    getVariableValue(context, variable) {
        const value = context[variable];
        if (value !== undefined && value !== null) {
            return String(value);
        }
        return this.getFallbackValue(variable);
    }
    // Get fallback value for missing variables
    getFallbackValue(variable) {
        const fallbacks = {
            recipientName: 'Valued Patient',
            appointmentType: 'Medical Appointment',
            doctorName: 'Your Healthcare Provider',
            facilityName: 'Healthcare System',
            systemName: 'Healthcare Management System',
            supportEmail: 'support@healthcare.com',
            supportPhone: '+1-800-HEALTH',
            websiteUrl: 'https://healthcare.com'
        };
        return fallbacks[variable] || `[${variable}]`;
    }
    // Get date format for templates
    getDateFormat() {
        return {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
    }
    // Format date for display
    formatDate(date) {
        try {
            const options = this.getDateFormat();
            return new Intl.DateTimeFormat('en-US', options).format(date);
        }
        catch (error) {
            console.error('Date formatting error:', error);
            return date.toLocaleDateString();
        }
    }
    // Render template with context
    renderTemplate(template, context) {
        try {
            // Check cache first
            const cacheKey = `${template}_${JSON.stringify(context)}`;
            if (this.templateCache.has(cacheKey)) {
                return this.templateCache.get(cacheKey);
            }
            // Compile and execute template
            let compiledTemplate = this.compiledTemplates.get(template);
            if (!compiledTemplate) {
                compiledTemplate = this.compileTemplate(template);
                this.compiledTemplates.set(template, compiledTemplate);
            }
            const result = compiledTemplate.call(this, context);
            // Cache result
            this.templateCache.set(cacheKey, result);
            return result;
        }
        catch (error) {
            console.error('Template rendering error:', error);
            return 'Template rendering failed';
        }
    }
    // Validate template variables
    validateTemplate(template, requiredVariables) {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const foundVariables = new Set();
        let match;
        while ((match = variableRegex.exec(template)) !== null) {
            foundVariables.add(match[1].trim());
        }
        // Check if all required variables are present
        for (const requiredVar of requiredVariables) {
            if (!foundVariables.has(requiredVar)) {
                console.warn(`Required variable '${requiredVar}' not found in template`);
                return false;
            }
        }
        return true;
    }
    // Clear template cache
    clearCache() {
        this.templateCache.clear();
        this.compiledTemplates.clear();
    }
    // Get template statistics
    getStats() {
        return {
            cacheSize: this.templateCache.size,
            compiledTemplates: this.compiledTemplates.size
        };
    }
}
exports.TemplateEngine = TemplateEngine;
// Template registry for managing all templates
class TemplateRegistry {
    constructor() {
        this.templates = new Map();
        this.engine = TemplateEngine.getInstance();
        this.initializeDefaultTemplates();
    }
    static getInstance() {
        if (!TemplateRegistry.instance) {
            TemplateRegistry.instance = new TemplateRegistry();
        }
        return TemplateRegistry.instance;
    }
    // Initialize default templates
    initializeDefaultTemplates() {
        this.registerTemplate({
            id: 'appointment-booked-email',
            name: 'Appointment Confirmation Email',
            description: 'Email sent when appointment is booked',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_BOOKED,
            channel: NotificationChannel.EMAIL,
            subject: 'Appointment Confirmation - {{appointmentType}}',
            body: this.getDefaultAppointmentBookedEmail(),
            variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime', 'doctorName'],
            fallbacks: {
                appointmentType: 'Medical Appointment',
                doctorName: 'Your Healthcare Provider'
            }
        });
        this.registerTemplate({
            id: 'appointment-reminder-email',
            name: 'Appointment Reminder Email',
            description: 'Email sent as appointment reminder',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_REMINDER,
            channel: NotificationChannel.EMAIL,
            subject: 'Appointment Reminder - {{appointmentType}}',
            body: this.getDefaultAppointmentReminderEmail(),
            variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime', 'doctorName'],
            fallbacks: {
                appointmentType: 'Medical Appointment',
                doctorName: 'Your Healthcare Provider'
            }
        });
        this.registerTemplate({
            id: 'appointment-cancelled-email',
            name: 'Appointment Cancellation Email',
            description: 'Email sent when appointment is cancelled',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_CANCELLED,
            channel: NotificationChannel.EMAIL,
            subject: 'Appointment Cancelled - {{appointmentType}}',
            body: this.getDefaultAppointmentCancelledEmail(),
            variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime'],
            fallbacks: {
                appointmentType: 'Medical Appointment'
            }
        });
        this.registerTemplate({
            id: 'appointment-confirmed-email',
            name: 'Appointment Confirmation Email',
            description: 'Email sent when appointment is confirmed',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_BOOKED,
            channel: NotificationChannel.EMAIL,
            subject: 'Appointment Confirmed - {{appointmentType}}',
            body: this.getDefaultAppointmentConfirmedEmail(),
            variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime', 'doctorName'],
            fallbacks: {
                appointmentType: 'Medical Appointment',
                doctorName: 'Your Healthcare Provider'
            }
        });
        this.registerTemplate({
            id: 'appointment-rescheduled-email',
            name: 'Appointment Rescheduled Email',
            description: 'Email sent when appointment is rescheduled',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_RESCHEDULED,
            channel: NotificationChannel.EMAIL,
            subject: 'Appointment Rescheduled - {{appointmentType}}',
            body: this.getDefaultAppointmentRescheduledEmail(),
            variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime', 'doctorName', 'previousDate', 'previousTime'],
            fallbacks: {
                appointmentType: 'Medical Appointment',
                doctorName: 'Your Healthcare Provider'
            }
        });
        // SMS templates
        this.registerTemplate({
            id: 'appointment-reminder-sms',
            name: 'Appointment Reminder SMS',
            description: 'SMS sent as appointment reminder',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_REMINDER,
            channel: NotificationChannel.SMS,
            body: this.getDefaultAppointmentReminderSMS(),
            variables: ['recipientName', 'appointmentTime', 'doctorName'],
            fallbacks: {
                doctorName: 'Your Doctor'
            }
        });
        this.registerTemplate({
            id: 'appointment-booked-sms',
            name: 'Appointment Confirmation SMS',
            description: 'SMS sent when appointment is booked',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_BOOKED,
            channel: NotificationChannel.SMS,
            body: this.getDefaultAppointmentBookedSMS(),
            variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime', 'doctorName'],
            fallbacks: {
                appointmentType: 'Medical Appointment',
                doctorName: 'Your Doctor'
            }
        });
        this.registerTemplate({
            id: 'appointment-cancelled-sms',
            name: 'Appointment Cancellation SMS',
            description: 'SMS sent when appointment is cancelled',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_CANCELLED,
            channel: NotificationChannel.SMS,
            body: this.getDefaultAppointmentCancelledSMS(),
            variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime'],
            fallbacks: {
                appointmentType: 'Medical Appointment'
            }
        });
        this.registerTemplate({
            id: 'appointment-rescheduled-sms',
            name: 'Appointment Rescheduled SMS',
            description: 'SMS sent when appointment is rescheduled',
            version: '1.0.0',
            type: NotificationType.APPOINTMENT_RESCHEDULED,
            channel: NotificationChannel.SMS,
            body: this.getDefaultAppointmentRescheduledSMS(),
            variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime', 'doctorName', 'previousDate', 'previousTime'],
            fallbacks: {
                appointmentType: 'Medical Appointment',
                doctorName: 'Your Doctor'
            }
        });
    }
    // Register a new template
    registerTemplate(template) {
        // Validate template
        if (!this.engine.validateTemplate(template.body, template.variables)) {
            throw new Error(`Template validation failed for ${template.id}`);
        }
        this.templates.set(template.id, template);
        console.log(`✅ Template registered: ${template.id} (v${template.version})`);
    }
    // Get template by ID
    getTemplate(id) {
        return this.templates.get(id);
    }
    // Get templates by type and channel
    getTemplates(type, channel) {
        return Array.from(this.templates.values()).filter(template => template.type === type && template.channel === channel);
    }
    // Render template with context
    renderTemplate(templateId, context) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        return this.engine.renderTemplate(template.body, context);
    }
    // Get template subject (for emails)
    getTemplateSubject(templateId, context) {
        const template = this.getTemplate(templateId);
        if (!template?.subject) {
            return 'Notification from Healthcare System';
        }
        return this.engine.renderTemplate(template.subject, context);
    }
    // Validate template content against variables
    validateTemplate(templateBody, variables) {
        try {
            // Extract all template variables from the body
            const variableRegex = /\{\{([^}]+)\}\}/g;
            const foundVariables = new Set();
            let match;
            while ((match = variableRegex.exec(templateBody)) !== null) {
                foundVariables.add(match[1].trim());
            }
            // Check if all required variables are present
            for (const variable of variables) {
                if (!foundVariables.has(variable)) {
                    console.warn(`Template validation warning: Variable '${variable}' not found in template body`);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            console.error('Template validation error:', error);
            return false;
        }
    }
    // List all templates
    listTemplates() {
        return Array.from(this.templates.values());
    }
    // Update template
    updateTemplate(id, updates) {
        const existing = this.getTemplate(id);
        if (!existing) {
            throw new Error(`Template not found: ${id}`);
        }
        const updated = { ...existing, ...updates, version: this.incrementVersion(existing.version) };
        this.templates.set(id, updated);
        console.log(`✅ Template updated: ${id} (v${updated.version})`);
    }
    // Delete template
    deleteTemplate(id) {
        return this.templates.delete(id);
    }
    // Increment version number
    incrementVersion(version) {
        const parts = version.split('.');
        if (parts.length === 3) {
            const patch = parseInt(parts[2]) + 1;
            return `${parts[0]}.${parts[1]}.${patch}`;
        }
        return `${version}.1`;
    }
    // Default template content methods
    getDefaultAppointmentBookedEmail() {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmation</h2>
        <p>Dear {{recipientName}},</p>
        <p>Your appointment has been successfully booked. Here are the details:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Appointment Type:</strong> {{appointmentType}}</p>
          <p><strong>Date:</strong> {{appointmentDate}}</p>
          <p><strong>Time:</strong> {{appointmentTime}}</p>
          <p><strong>Doctor:</strong> {{doctorName}}</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time. If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        <p>Best regards,<br>{{facilityName}} Team</p>
      </div>
    `;
    }
    getDefaultAppointmentReminderEmail() {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Reminder</h2>
        <p>Dear {{recipientName}},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Appointment Type:</strong> {{appointmentType}}</p>
          <p><strong>Date:</strong> {{appointmentDate}}</p>
          <p><strong>Time:</strong> {{appointmentTime}}</p>
          <p><strong>Doctor:</strong> {{doctorName}}</p>
        </div>
        <p>Please remember to bring any relevant medical records or test results.</p>
        <p>Best regards,<br>{{facilityName}} Team</p>
      </div>
    `;
    }
    getDefaultAppointmentCancelledEmail() {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Cancelled</h2>
        <p>Dear {{recipientName}},</p>
        <p>Your appointment has been cancelled:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Appointment Type:</strong> {{appointmentType}}</p>
          <p><strong>Date:</strong> {{appointmentDate}}</p>
          <p><strong>Time:</strong> {{appointmentTime}}</p>
        </div>
        <p>If you need to reschedule, please contact us at your earliest convenience.</p>
        <p>Best regards,<br>{{facilityName}} Team</p>
      </div>
    `;
    }
    getDefaultAppointmentConfirmedEmail() {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Appointment Confirmed</h2>
        <p>Dear {{recipientName}},</p>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Appointment Type:</strong> {{appointmentType}}</p>
          <p><strong>Date:</strong> {{appointmentDate}}</p>
          <p><strong>Time:</strong> {{appointmentTime}}</p>
          <p><strong>Doctor:</strong> {{doctorName}}</p>
        </div>
        <p>We look forward to seeing you. Please arrive 15 minutes before your scheduled time.</p>
        <p>Best regards,<br>{{facilityName}} Team</p>
      </div>
    `;
    }
    getDefaultAppointmentRescheduledEmail() {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Appointment Rescheduled</h2>
        <p>Dear {{recipientName}},</p>
        <p>Your appointment has been rescheduled. Here are the new details:</p>
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Appointment Type:</strong> {{appointmentType}}</p>
          <p><strong>New Date:</strong> {{appointmentDate}}</p>
          <p><strong>New Time:</strong> {{appointmentTime}}</p>
          <p><strong>Doctor:</strong> {{doctorName}}</p>
          <p><strong>Previous Date:</strong> {{previousDate}}</p>
          <p><strong>Previous Time:</strong> {{previousTime}}</p>
        </div>
        <p>If this new time doesn't work for you, please contact us to arrange an alternative.</p>
        <p>Best regards,<br>{{facilityName}} Team</p>
      </div>
    `;
    }
    getDefaultAppointmentReminderSMS() {
        return `Hi {{recipientName}}, reminder: {{appointmentType}} appointment with {{doctorName}} tomorrow at {{appointmentTime}}. Reply STOP to unsubscribe.`;
    }
    getDefaultAppointmentBookedSMS() {
        return `Hi {{recipientName}}, your {{appointmentType}} appointment is confirmed for {{appointmentDate}} at {{appointmentTime}} with {{doctorName}}. Reply STOP to unsubscribe.`;
    }
    getDefaultAppointmentCancelledSMS() {
        return `Hi {{recipientName}}, your {{appointmentType}} appointment for {{appointmentDate}} at {{appointmentTime}} has been cancelled. Reply STOP to unsubscribe.`;
    }
    getDefaultAppointmentRescheduledSMS() {
        return `Hi {{recipientName}}, your {{appointmentType}} appointment has been rescheduled to {{appointmentDate}} at {{appointmentTime}} with {{doctorName}}. Previous time was {{previousDate}} at {{previousTime}}. Reply STOP to unsubscribe.`;
    }
}
exports.TemplateRegistry = TemplateRegistry;
