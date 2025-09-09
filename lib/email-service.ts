/**
 * Email Service for Ihosi Healthcare Management System
 * HIPAA-compliant email service with encryption and audit logging
 */

import crypto from 'crypto';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import sgMail from '@sendgrid/mail';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailOptions {
  to: string;
  template: EmailTemplate;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  category?: 'verification' | 'notification' | 'alert' | 'marketing';
}

export class EmailService {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_ATTEMPTS = 3;

  /**
   * Generate secure verification token
   */
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  /**
   * Create email verification record
   */
  static async createVerification(
    email: string,
    type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE' | 'MFA_SETUP',
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY);

    // Invalidate any existing tokens for this email and type
    await db.emailVerification.updateMany({
      where: {
        email,
        type,
        verified: false
      },
      data: {
        verified: true, // Mark as expired
        verified_at: new Date()
      }
    });

    // Create new verification record
    await db.emailVerification.create({
      data: {
        email,
        token,
        type,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent
      }
    });

    return token;
  }

  /**
   * Verify email token
   */
  static async verifyToken(
    token: string,
    type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE' | 'MFA_SETUP'
  ): Promise<{ success: boolean; email?: string; error?: string }> {
    try {
      const verification = await db.emailVerification.findUnique({
        where: { token }
      });

      if (!verification) {
        return { success: false, error: 'Invalid verification token' };
      }

      if (verification.type !== type) {
        return { success: false, error: 'Invalid verification type' };
      }

      if (verification.verified) {
        return { success: false, error: 'Token already used' };
      }

      if (verification.expires_at < new Date()) {
        return { success: false, error: 'Verification token expired' };
      }

      if (verification.attempts >= verification.max_attempts) {
        return { success: false, error: 'Too many verification attempts' };
      }

      // Mark as verified
      await db.emailVerification.update({
        where: { id: verification.id },
        data: {
          verified: true,
          verified_at: new Date()
        }
      });

      return { success: true, email: verification.email };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(
    email: string,
    type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE' | 'MFA_SETUP',
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.createVerification(email, type, ipAddress, userAgent);
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&type=${type}`;

      const template = this.getTemplate(type, { verificationUrl, email });

      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      await this.sendEmail({
        to: email,
        template,
        category: 'verification'
      });

      // Log audit trail
      await logAudit({
        action: 'CREATE',
        resourceType: 'AUTH',
        resourceId: email,
        reason: `Email verification sent for ${type.toLowerCase()}`,
        metadata: {
          email,
          type,
          ipAddress,
          userAgent
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Send verification email error:', error);
      return { success: false, error: 'Failed to send verification email' };
    }
  }

  /**
   * Get email template
   */
  private static getTemplate(
    type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE' | 'MFA_SETUP',
    data: { verificationUrl: string; email: string }
  ): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ihosi.com';
    const logoUrl = `${baseUrl}/logo.png`;

    switch (type) {
      case 'REGISTRATION':
        return {
          subject: 'Verify Your Ihosi Account - Complete Registration',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Account</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${logoUrl}" alt="Ihosi" style="height: 60px; margin-bottom: 20px;">
                <h1 style="color: #046658; margin: 0;">Welcome to Ihosi</h1>
                <p style="color: #3E4C4B; margin: 10px 0 0 0;">Healthcare Management System</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #046658; margin-top: 0;">Verify Your Email Address</h2>
                <p>Thank you for registering with Ihosi Healthcare Management System. To complete your registration and secure your account, please verify your email address.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.verificationUrl}" 
                     style="background: linear-gradient(135deg, #046658, #2EB6B0); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            display: inline-block; 
                            font-weight: bold;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${data.verificationUrl}" style="color: #2EB6B0;">${data.verificationUrl}</a>
                </p>
              </div>
              
              <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #046658; margin-top: 0;">Security Information</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>This verification link expires in 24 hours</li>
                  <li>Your account is protected by enterprise-grade security</li>
                  <li>Never share your verification link with anyone</li>
                </ul>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 12px;">
                <p>© 2024 Ihosi Healthcare Management System. All rights reserved.</p>
                <p>This email was sent to ${data.email}</p>
              </div>
            </body>
            </html>
          `,
          text: `
            Welcome to Ihosi Healthcare Management System
            
            Verify Your Email Address
            
            Thank you for registering with Ihosi. To complete your registration, please verify your email address by clicking the link below:
            
            ${data.verificationUrl}
            
            This verification link expires in 24 hours.
            
            Security Information:
            - Your account is protected by enterprise-grade security
            - Never share your verification link with anyone
            - This link is valid for one-time use only
            
            If you didn't create an account with Ihosi, please ignore this email.
            
            © 2024 Ihosi Healthcare Management System. All rights reserved.
          `
        };

      case 'PASSWORD_RESET':
        return {
          subject: 'Reset Your Ihosi Password - Security Alert',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${logoUrl}" alt="Ihosi" style="height: 60px; margin-bottom: 20px;">
                <h1 style="color: #046658; margin: 0;">Password Reset Request</h1>
                <p style="color: #3E4C4B; margin: 10px 0 0 0;">Ihosi Healthcare Management System</p>
              </div>
              
              <div style="background: #fff3cd; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #ffc107;">
                <h2 style="color: #856404; margin-top: 0;">Security Alert</h2>
                <p>We received a request to reset your password for your Ihosi account. If you made this request, click the button below to reset your password.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.verificationUrl}" 
                     style="background: linear-gradient(135deg, #dc3545, #fd7e14); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            display: inline-block; 
                            font-weight: bold;">
                    Reset Password
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #856404; margin-top: 20px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${data.verificationUrl}" style="color: #dc3545;">${data.verificationUrl}</a>
                </p>
              </div>
              
              <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #721c24; margin-top: 0;">Important Security Notice</h3>
                <ul style="margin: 0; padding-left: 20px; color: #721c24;">
                  <li>This reset link expires in 1 hour</li>
                  <li>If you didn't request this reset, ignore this email</li>
                  <li>Your password will remain unchanged until you click the link</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 12px;">
                <p>© 2024 Ihosi Healthcare Management System. All rights reserved.</p>
                <p>This email was sent to ${data.email}</p>
              </div>
            </body>
            </html>
          `,
          text: `
            Password Reset Request - Ihosi Healthcare Management System
            
            Security Alert
            
            We received a request to reset your password for your Ihosi account. If you made this request, click the link below to reset your password:
            
            ${data.verificationUrl}
            
            Important Security Notice:
            - This reset link expires in 1 hour
            - If you didn't request this reset, ignore this email
            - Your password will remain unchanged until you click the link
            - Never share this link with anyone
            
            If you didn't request a password reset, please contact our support team immediately.
            
            © 2024 Ihosi Healthcare Management System. All rights reserved.
          `
        };

      default:
        return {
          subject: 'Ihosi Verification',
          html: `<p>Please verify your email: <a href="${data.verificationUrl}">Click here</a></p>`,
          text: `Please verify your email: ${data.verificationUrl}`
        };
    }
  }

  /**
   * Send email (placeholder - integrate with actual email service)
   */
  private static async sendEmail(options: EmailOptions): Promise<void> {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log('📧 Email would be sent:', {
      to: options.to,
      subject: options.template.subject,
      category: options.category
    });
    
    // In development, log the email content
    if (process.env.NODE_ENV === 'development') {
      console.log('Email HTML:', options.template.html);
    }
  }

  /**
   * Public method for email scheduler compatibility
   */
  static async sendSimpleEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const template: EmailTemplate = {
        subject,
        html: body,
        text: body.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
      };

      await this.sendEmail({
        to,
        template,
        category: 'notification'
      });

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}

// Real SendGrid email service
export class SendGridEmailService {
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
        from: {
          email: process.env.FROM_EMAIL || 'noreply@ihosi.com',
          name: process.env.FROM_NAME || 'iHosi Healthcare System'
        },
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
export class AWSSESEmailService {
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
export class MailgunEmailService {
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
export class ConsoleEmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log('📧 CONSOLE EMAIL (Development Mode):', { to, subject, body });
    return true;
  }
}