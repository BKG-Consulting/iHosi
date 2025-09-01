#!/usr/bin/env node

/**
 * Debug SendGrid Issues
 * 
 * This script helps debug SendGrid email failures
 * Run with: node scripts/debug-sendgrid.js
 */

async function debugSendGrid() {
  console.log('🔍 Debugging SendGrid Issues\n');
  
  try {
    // Check environment variables
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const fromName = process.env.FROM_NAME;
    
    console.log('📋 Environment Check:');
    console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   From Email: ${fromEmail || '❌ Missing'}`);
    console.log(`   From Name: ${fromName || '❌ Missing'}`);
    
    if (!apiKey) {
      console.log('\n❌ SENDGRID_API_KEY is missing!');
      console.log('Please add to .env.local: SENDGRID_API_KEY=SG.your_key_here');
      return;
    }
    
    if (!fromEmail) {
      console.log('\n❌ FROM_EMAIL is missing!');
      console.log('Please add to .env.local: FROM_EMAIL=noreply@yourclinic.com');
      return;
    }
    
    console.log('\n🔍 Checking SendGrid Service...');
    
    // Test with a simple email
    const { SendGridEmailService } = require('../lib/email-service');
    
    console.log('📧 Testing with simple email...');
    
         // Test 1: Simple text email
     const simpleEmail = {
       to: 'greggambugua@gmail.com', // Using your email from the logs
       subject: '🧪 SendGrid Test - BKG Consultants',
       body: 'This is a test email from your healthcare system notification service.'
     };
    
    console.log('\n📤 Sending simple test email...');
    console.log('   To:', simpleEmail.to);
    console.log('   Subject:', simpleEmail.subject);
    console.log('   Body:', simpleEmail.body);
    
    const emailService = new SendGridEmailService();
    const result = await emailService.sendEmail(
      simpleEmail.to,
      simpleEmail.subject,
      simpleEmail.body
    );
    
    if (result) {
      console.log('✅ Simple email sent successfully!');
    } else {
      console.log('❌ Simple email failed');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email inbox (and spam folder)');
    console.log('2. If successful, the issue is with appointment data');
    console.log('3. If failed, check SendGrid dashboard for details');
    
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    
    if (error.code === 400) {
      console.log('\n🔍 400 Bad Request usually means:');
      console.log('   - Invalid email address format');
      console.log('   - Missing required fields');
      console.log('   - Email content issues');
    }
    
    if (error.code === 403) {
      console.log('\n🔍 403 Forbidden usually means:');
      console.log('   - "From" email not verified in SendGrid');
      console.log('   - Account restrictions');
      console.log('   - API key permissions');
    }
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Verify your "from" email in SendGrid dashboard');
    console.log('2. Check if your SendGrid account is active');
    console.log('3. Ensure API key has "Mail Send" permissions');
  }
}

// Run debug if this file is executed directly
if (require.main === module) {
  debugSendGrid();
}

module.exports = { debugSendGrid };
