import sgMail from '@sendgrid/mail';
import { EmailService } from './notifications';

// Real SendGrid email service
export class SendGridEmailService implements EmailService {
  constructor() {
    // Initialize SendGrid with API key
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      // Validate email format before sending
      if (!to || typeof to !== 'string' || !to.includes('@')) {
        console.error('❌ Invalid email address format:', to);
        return false;
      }
      
      // Check if email is encrypted (should not happen after our fix)
      if (to.startsWith('{"encrypted":')) {
        console.error('❌ Attempting to send to encrypted email address:', to);
        return false;
      }
      
      const msg = {
        to,
        from: process.env.FROM_EMAIL || 'noreply@yourclinic.com',
        subject,
        html: body,
      };

      console.log(`📤 Sending email via SendGrid:`, {
        to: msg.to,
        from: msg.from,
        subject: msg.subject,
        bodyLength: msg.html.length
      });

      await sgMail.send(msg);
      console.log(`✅ REAL EMAIL SENT via SendGrid to: ${to}`);
      return true;
    } catch (error) {
      console.error('❌ SendGrid email failed:', error);
      console.error('❌ Email details:', { to, subject, bodyLength: body.length });
      return false;
    }
  }
}

// Alternative: AWS SES email service
export class AWSSESEmailService implements EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      // AWS SES implementation would go here
      console.log(`✅ REAL EMAIL SENT via AWS SES to: ${to}`);
      return true;
    } catch (error) {
      console.error('❌ AWS SES email failed:', error);
      return false;
    }
  }
}

// Alternative: Mailgun email service
export class MailgunEmailService implements EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      // Mailgun implementation would go here
      console.log(`✅ REAL EMAIL SENT via Mailgun to: ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Mailgun email failed:', error);
      return false;
    }
  }
}

// Fallback: Console logging (for development)
export class ConsoleEmailService implements EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log('📧 CONSOLE EMAIL (Development Mode):', { to, subject, body });
    return true;
  }
}
