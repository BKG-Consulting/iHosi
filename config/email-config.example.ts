// Email Service Configuration Example
// Copy this file to config/email-config.ts and fill in your actual values

export const emailConfig = {
  // Choose your email service
  service: 'sendgrid', // 'sendgrid' | 'aws_ses' | 'mailgun' | 'console'
  
  // SendGrid Configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || 'your_sendgrid_api_key_here',
    fromEmail: process.env.FROM_EMAIL || 'noreply@yourclinic.com',
    fromName: process.env.FROM_NAME || 'Your Healthcare Clinic',
  },
  
  // AWS SES Configuration
  awsSES: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your_aws_access_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your_aws_secret_key',
    region: process.env.AWS_REGION || 'us-east-1',
    fromEmail: process.env.FROM_EMAIL || 'noreply@yourclinic.com',
  },
  
  // Mailgun Configuration
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || 'your_mailgun_api_key',
    domain: process.env.MAILGUN_DOMAIN || 'yourclinic.com',
    fromEmail: process.env.FROM_EMAIL || 'noreply@yourclinic.com',
  },
  
  // Development/Production flags
  isProduction: process.env.NODE_ENV === 'production',
  enableRealEmails: process.env.ENABLE_REAL_NOTIFICATIONS === 'true',
};

// Usage example:
// import { emailConfig } from './config/email-config';
// 
// if (emailConfig.service === 'sendgrid' && emailConfig.enableRealEmails) {
//   // Use SendGrid service
// } else {
//   // Use console logging (development)
// }
