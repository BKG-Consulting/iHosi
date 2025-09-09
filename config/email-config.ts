// Email Service Configuration
// This file configures the email service for the healthcare system

export const emailConfig = {
  // Choose your email service based on EMAIL_SERVICE env var
  service: process.env.EMAIL_SERVICE || 'sendgrid', // 'sendgrid' | 'aws_ses' | 'mailgun' | 'console'
  
  // SendGrid Configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@ihosi.com',
    fromName: process.env.FROM_NAME || 'iHosi Healthcare System',
  },
  
  // AWS SES Configuration
  awsSES: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    fromEmail: process.env.FROM_EMAIL || 'noreply@ihosi.com',
  },
  
  // Mailgun Configuration
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || 'ihosi.com',
    fromEmail: process.env.FROM_EMAIL || 'noreply@ihosi.com',
  },
  
  // Development/Production flags
  isProduction: process.env.NODE_ENV === 'production',
  enableRealEmails: process.env.ENABLE_REAL_NOTIFICATIONS === 'true' || process.env.NODE_ENV === 'production',
};
