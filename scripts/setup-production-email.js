#!/usr/bin/env node

/**
 * Production Email Service Setup Script
 * 
 * This script shows how to integrate real email services
 * Run with: node scripts/setup-production-email.js
 */

const { notificationService } = require('../lib/notifications');
const { SendGridEmailService, AWSSESEmailService, MailgunEmailService } = require('../lib/email-service');

async function setupProductionEmail() {
  console.log('🚀 Setting up Production Email Service\n');
  
  try {
    // Check environment variables
    const emailService = process.env.EMAIL_SERVICE || 'sendgrid';
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      console.log('❌ No email API key found. Please set environment variables:');
      console.log('   SENDGRID_API_KEY=your_api_key_here');
      console.log('   FROM_EMAIL=noreply@yourclinic.com');
      console.log('   FROM_NAME=Your Healthcare Clinic');
      return;
    }
    
    console.log(`✅ Email service configured: ${emailService.toUpperCase()}`);
    console.log(`✅ From email: ${process.env.FROM_EMAIL || 'noreply@yourclinic.com'}`);
    
    // Choose email service based on environment
    let emailServiceInstance;
    
    switch (emailService.toLowerCase()) {
      case 'sendgrid':
        emailServiceInstance = new SendGridEmailService();
        console.log('✅ SendGrid email service initialized');
        break;
        
      case 'aws_ses':
        emailServiceInstance = new AWSSESEmailService();
        console.log('✅ AWS SES email service initialized');
        break;
        
      case 'mailgun':
        emailServiceInstance = new MailgunEmailService();
        console.log('✅ Mailgun email service initialized');
        break;
        
      default:
        console.log('❌ Unknown email service:', emailService);
        return;
    }
    
    // Update notification service to use real email
    notificationService.setEmailService(emailServiceInstance);
    
    console.log('\n🎉 Production email service setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test with a real appointment booking');
    console.log('2. Check your email inbox for notifications');
    console.log('3. Monitor SendGrid dashboard for delivery status');
    console.log('4. Set up email templates and branding');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check environment variables are set');
    console.log('2. Verify API key is valid');
    console.log('3. Ensure email service account is active');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupProductionEmail();
}

module.exports = { setupProductionEmail };
