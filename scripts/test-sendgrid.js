#!/usr/bin/env node

/**
 * Test SendGrid Integration
 * 
 * This script tests if SendGrid is properly configured and can send emails
 * Run with: node scripts/test-sendgrid.js
 */

require('dotenv').config({ path: '.env.local' });

async function testSendGrid() {
  console.log('🧪 Testing SendGrid Integration\n');
  
  try {
    // Check environment variables
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const fromName = process.env.FROM_NAME;
    
    console.log('📋 Configuration Check:');
    console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   From Email: ${fromEmail || '❌ Missing'}`);
    console.log(`   From Name: ${fromName || '❌ Missing'}`);
    
    if (!apiKey || !fromEmail) {
      console.log('\n❌ Missing required configuration!');
      console.log('Please set in .env.local:');
      console.log('   SENDGRID_API_KEY=your_api_key_here');
      console.log('   FROM_EMAIL=noreply@yourclinic.com');
      console.log('   FROM_NAME=Your Healthcare Clinic');
      return;
    }
    
    // Test SendGrid service
    console.log('\n🚀 Testing SendGrid Service...');
    
    const { SendGridEmailService } = require('../lib/email-service');
    const emailService = new SendGridEmailService();
    
    // Test email
    const testEmail = {
      to: 'test@example.com', // Replace with your email for testing
      subject: '🧪 SendGrid Test - Healthcare System',
      body: `
        <h2>🎉 SendGrid Integration Test Successful!</h2>
        <p>This email confirms that your SendGrid integration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
        <hr>
        <p><em>This is a test email from your healthcare system notification service.</em></p>
      `
    };
    
    console.log('📧 Sending test email...');
    const result = await emailService.sendEmail(
      testEmail.to,
      testEmail.subject,
      testEmail.body
    );
    
    if (result) {
      console.log('✅ Test email sent successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Check your email inbox (and spam folder)');
      console.log('2. Book a real appointment to test notifications');
      console.log('3. Monitor SendGrid dashboard for delivery status');
    } else {
      console.log('❌ Test email failed to send');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your SendGrid API key is correct');
    console.log('2. Check if your SendGrid account is active');
    console.log('3. Ensure your "from" email is verified in SendGrid');
    console.log('4. Check SendGrid dashboard for any account issues');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSendGrid();
}

module.exports = { testSendGrid };
