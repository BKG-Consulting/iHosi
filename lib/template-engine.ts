
// Notification types
export enum NotificationType {
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  DOCTOR_AVAILABILITY = 'DOCTOR_AVAILABILITY',
}

// Notification channels
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

// Template variable interface
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  description: string;
  defaultValue?: any;
}

// Template context interface
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

// Template configuration interface
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

// Template engine for rendering dynamic content
export class TemplateEngine {
  private static instance: TemplateEngine;
  private templateCache: Map<string, string> = new Map();
  private compiledTemplates: Map<string, Function> = new Map();
  private cacheSize: number = 100; // Maximum cache size

  private constructor() {}

  public static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }

  // Compile template string into executable function
  public compileTemplate(template: string): Function {
    try {
      // Simple template compilation using Function constructor
      // This is a basic implementation - in production, consider using a proper template engine
      const templateFunction = new Function('context', `
        return \`${template.replace(/\{\{([^}]+)\}\}/g, '${this.getVariableValue(context, "$1")}')}\`;
      `);
      
      return templateFunction.bind(this);
    } catch (error) {
      console.error('Template compilation error:', error);
      return () => 'Template compilation failed';
    }
  }

  // Get variable value from context with fallback support
  private getVariableValue(context: TemplateContext, variable: string): string {
    const value = context[variable as keyof TemplateContext];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return this.getFallbackValue(variable);
  }

  // Get fallback value for missing variables
  private getFallbackValue(variable: string): string {
    const fallbacks: Record<string, string> = {
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
  private getDateFormat(): Intl.DateTimeFormatOptions {
    return {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
  }

  // Format date for display
  private formatDate(date: Date): string {
    try {
      const options = this.getDateFormat();
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return date.toLocaleDateString();
    }
  }

  // Render template with context
  public renderTemplate(template: string, context: TemplateContext): string {
    try {
      // Check cache first
      const cacheKey = `${template}_${JSON.stringify(context)}`;
      if (this.templateCache.has(cacheKey)) {
        return this.templateCache.get(cacheKey)!;
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
    } catch (error) {
      console.error('Template rendering error:', error);
      return 'Template rendering failed';
    }
  }

  // Validate template variables
  public validateTemplate(template: string, requiredVariables: string[]): boolean {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const foundVariables = new Set<string>();
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
  public clearCache(): void {
    this.templateCache.clear();
    this.compiledTemplates.clear();
  }

  // Get template statistics
  public getStats(): { cacheSize: number; compiledTemplates: number } {
    return {
      cacheSize: this.templateCache.size,
      compiledTemplates: this.compiledTemplates.size
    };
  }
}

// Template registry for managing all templates
export class TemplateRegistry {
  private static instance: TemplateRegistry;
  private templates: Map<string, TemplateConfig> = new Map();
  private engine: TemplateEngine;

  private constructor() {
    this.engine = TemplateEngine.getInstance();
    this.initializeDefaultTemplates();
  }

  public static getInstance(): TemplateRegistry {
    if (!TemplateRegistry.instance) {
      TemplateRegistry.instance = new TemplateRegistry();
    }
    return TemplateRegistry.instance;
  }

  // Initialize default templates
  private initializeDefaultTemplates(): void {
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
      id: 'appointment_scheduled',
      name: 'Appointment Scheduled Email',
      description: 'Email sent when appointment is scheduled by doctor',
      version: '1.0.0',
      type: NotificationType.APPOINTMENT_BOOKED,
      channel: NotificationChannel.EMAIL,
      subject: 'Your Appointment Has Been Scheduled - {{appointmentType}}',
      body: this.getDefaultAppointmentScheduledEmail(),
      variables: ['recipientName', 'appointmentType', 'appointmentDate', 'appointmentTime', 'doctorName', 'requirements', 'notes'],
      fallbacks: {
        appointmentType: 'Medical Appointment',
        doctorName: 'Your Healthcare Provider',
        requirements: 'Please bring your ID and insurance card'
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
  public registerTemplate(template: TemplateConfig): void {
    // Validate template
    if (!this.engine.validateTemplate(template.body, template.variables)) {
      throw new Error(`Template validation failed for ${template.id}`);
    }

    this.templates.set(template.id, template);
    console.log(`✅ Template registered: ${template.id} (v${template.version})`);
  }

  // Get template by ID
  public getTemplate(id: string): TemplateConfig | undefined {
    return this.templates.get(id);
  }

  // Get templates by type and channel
  public getTemplates(type: NotificationType, channel: NotificationChannel): TemplateConfig[] {
    return Array.from(this.templates.values()).filter(
      template => template.type === type && template.channel === channel
    );
  }

  // Render template with context
  public renderTemplate(templateId: string, context: TemplateContext): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return this.engine.renderTemplate(template.body, context);
  }

  // Get template subject (for emails)
  public getTemplateSubject(templateId: string, context: TemplateContext): string {
    const template = this.getTemplate(templateId);
    if (!template?.subject) {
      return 'Notification from Healthcare System';
    }

    return this.engine.renderTemplate(template.subject, context);
  }

  // Validate template content against variables
  public validateTemplate(templateBody: string, variables: string[]): boolean {
    try {
      // Extract all template variables from the body
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const foundVariables = new Set<string>();
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
    } catch (error) {
      console.error('Template validation error:', error);
      return false;
    }
  }

  // List all templates
  public listTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }

  // Update template
  public updateTemplate(id: string, updates: Partial<TemplateConfig>): void {
    const existing = this.getTemplate(id);
    if (!existing) {
      throw new Error(`Template not found: ${id}`);
    }

    const updated = { ...existing, ...updates, version: this.incrementVersion(existing.version) };
    this.templates.set(id, updated);
    console.log(`✅ Template updated: ${id} (v${updated.version})`);
  }

  // Delete template
  public deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  // Increment version number
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    if (parts.length === 3) {
      const patch = parseInt(parts[2]) + 1;
      return `${parts[0]}.${parts[1]}.${patch}`;
    }
    return `${version}.1`;
  }

  // Default template content methods
  private getDefaultAppointmentBookedEmail(): string {
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

  private getDefaultAppointmentScheduledEmail(): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #046658 0%, #2EB6B0 100%); padding: 20px; border-radius: 12px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #046658; margin: 0; font-size: 28px;">Your Appointment Has Been Scheduled!</h1>
            <p style="color: #3E4C4B; margin: 10px 0 0 0; font-size: 16px;">iHosi Healthcare</p>
          </div>
          
          <p style="color: #3E4C4B; font-size: 16px; margin-bottom: 20px;">Dear {{recipientName}},</p>
          
          <p style="color: #3E4C4B; font-size: 16px; margin-bottom: 25px;">
            Great news! Your appointment has been confirmed and scheduled. Here are all the details you need:
          </p>
          
          <div style="background: linear-gradient(135deg, #F5F7FA 0%, #D1F1F2 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #046658;">
            <h3 style="color: #046658; margin: 0 0 15px 0; font-size: 20px;">📅 Appointment Details</h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: #2EB6B0; font-weight: bold;">Type:</span>
                <span style="color: #3E4C4B;">{{appointmentType}}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: #2EB6B0; font-weight: bold;">Date:</span>
                <span style="color: #3E4C4B;">{{appointmentDate}}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: #2EB6B0; font-weight: bold;">Time:</span>
                <span style="color: #3E4C4B;">{{appointmentTime}}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: #2EB6B0; font-weight: bold;">Doctor:</span>
                <span style="color: #3E4C4B;">Dr. {{doctorName}}</span>
              </div>
            </div>
          </div>
          
          <div style="background: #F5F7FA; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2EB6B0;">
            <h3 style="color: #046658; margin: 0 0 15px 0; font-size: 18px;">📋 Preparation Requirements</h3>
            <p style="color: #3E4C4B; margin: 0; line-height: 1.6;">{{requirements}}</p>
          </div>
          
          {{#if notes}}
          <div style="background: #FFF8E1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFA726;">
            <h3 style="color: #E65100; margin: 0 0 15px 0; font-size: 18px;">📝 Additional Notes</h3>
            <p style="color: #3E4C4B; margin: 0; line-height: 1.6;">{{notes}}</p>
          </div>
          {{/if}}
          
          <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 18px;">⏰ Important Reminders</h3>
            <ul style="color: #3E4C4B; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Please arrive <strong>15 minutes early</strong> for check-in</li>
              <li>Bring a valid photo ID and insurance card</li>
              <li>Bring any relevant medical records or test results</li>
              <li>If you need to reschedule, please call us at least 24 hours in advance</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #D1F1F2;">
            <p style="color: #3E4C4B; margin: 0 0 10px 0; font-size: 16px;">
              <strong>Questions or need to reschedule?</strong>
            </p>
            <p style="color: #2EB6B0; margin: 0; font-size: 14px;">
              📞 Call us at +1 (555) 123-4567 | ✉️ Email: info@ihosi.com
            </p>
            <p style="color: #3E4C4B; margin: 10px 0 0 0; font-size: 14px;">
              We look forward to seeing you!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <p style="color: #046658; font-weight: bold; margin: 0;">
              Best regards,<br>
              The iHosi Healthcare Team
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private getDefaultAppointmentReminderEmail(): string {
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

  private getDefaultAppointmentCancelledEmail(): string {
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

  private getDefaultAppointmentConfirmedEmail(): string {
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

  private getDefaultAppointmentRescheduledEmail(): string {
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

  private getDefaultAppointmentReminderSMS(): string {
    return `Hi {{recipientName}}, reminder: {{appointmentType}} appointment with {{doctorName}} tomorrow at {{appointmentTime}}. Reply STOP to unsubscribe.`;
  }

  private getDefaultAppointmentBookedSMS(): string {
    return `Hi {{recipientName}}, your {{appointmentType}} appointment is confirmed for {{appointmentDate}} at {{appointmentTime}} with {{doctorName}}. Reply STOP to unsubscribe.`;
  }

  private getDefaultAppointmentCancelledSMS(): string {
    return `Hi {{recipientName}}, your {{appointmentType}} appointment for {{appointmentDate}} at {{appointmentTime}} has been cancelled. Reply STOP to unsubscribe.`;
  }

  private getDefaultAppointmentRescheduledSMS(): string {
    return `Hi {{recipientName}}, your {{appointmentType}} appointment has been rescheduled to {{appointmentDate}} at {{appointmentTime}} with {{doctorName}}. Previous time was {{previousDate}} at {{previousTime}}. Reply STOP to unsubscribe.`;
  }
}
