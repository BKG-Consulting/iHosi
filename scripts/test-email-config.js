#!/usr/bin/env node

/**
 * Test Email Configuration Script
 * This script tests the email service configuration
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('🧪 Testing Email Configuration');
console.log('==============================\n');

// Check environment variables
const requiredVars = [
  'SENDGRID_API_KEY',
  'FROM_EMAIL', 
  'FROM_NAME',
  'ENABLE_REAL_NOTIFICATIONS'
];

const optionalVars = [
  'EMAIL_SERVICE'
];

console.log('📋 Environment Variables Check:');
console.log('--------------------------------');

let allRequiredPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allRequiredPresent = false;
  }
});

optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`ℹ️  ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (using default)`);
  }
});

console.log('\n🔧 Configuration Status:');
console.log('-------------------------');

if (allRequiredPresent) {
  console.log('✅ All required environment variables are set');
  console.log('✅ Email service should be able to send real emails');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('❌ Email service will fall back to mock mode');
}

console.log('\n📧 Email Service Test:');
console.log('----------------------');

try {
  // Test the email service initialization
  const { SendGridEmailService } = require('../dist/lib/email-service');
  
  if (process.env.SENDGRID_API_KEY && process.env.ENABLE_REAL_NOTIFICATIONS === 'true') {
    const service = new SendGridEmailService();
    console.log('✅ SendGrid service initialized successfully');
    console.log('✅ Ready to send real emails');
  } else {
    console.log('⚠️  SendGrid not configured or disabled');
    console.log('⚠️  Will use mock email service');
  }
} catch (error) {
  console.log('❌ Error initializing email service:', error.message);
  console.log('💡 Try running: npm run build');
}

console.log('\n🚀 Next Steps:');
console.log('---------------');
console.log('1. Make sure SENDGRID_API_KEY is set to your actual SendGrid API key');
console.log('2. Set ENABLE_REAL_NOTIFICATIONS=true to enable real email sending');
console.log('3. Restart your development server');
console.log('4. Test the appointment booking workflow');

console.log('\n✨ Configuration test complete!');
