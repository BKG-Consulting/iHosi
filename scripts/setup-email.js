#!/usr/bin/env node

/**
 * Email Setup Script for iHosi Healthcare System
 * This script helps configure email services for the application
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 iHosi Email Service Setup');
console.log('============================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env.local file...');
  fs.writeFileSync(envPath, '');
}

// Read current .env.local content
let envContent = '';
if (envExists) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Email configuration template
const emailConfig = `
# Email Service Configuration
# =========================

# Enable real email notifications (set to 'true' to send real emails)
ENABLE_REAL_NOTIFICATIONS=true

# SendGrid Configuration (Recommended)
# Get your API key from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Email sender configuration
FROM_EMAIL=noreply@ihosi.com
FROM_NAME=iHosi Healthcare System

# Alternative: AWS SES Configuration
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_REGION=us-east-1

# Alternative: Mailgun Configuration
# MAILGUN_API_KEY=your_mailgun_api_key
# MAILGUN_DOMAIN=ihosi.com
`;

// Check if email config already exists
if (envContent.includes('SENDGRID_API_KEY')) {
  console.log('✅ Email configuration already exists in .env.local');
  console.log('📧 Current configuration:');
  
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.includes('SENDGRID_API_KEY') || 
        line.includes('FROM_EMAIL') || 
        line.includes('ENABLE_REAL_NOTIFICATIONS')) {
      console.log(`   ${line}`);
    }
  });
  
  console.log('\n💡 To update your configuration, edit the .env.local file');
} else {
  console.log('📝 Adding email configuration to .env.local...');
  
  // Append email config to .env.local
  const updatedContent = envContent + emailConfig;
  fs.writeFileSync(envPath, updatedContent);
  
  console.log('✅ Email configuration added to .env.local');
  console.log('\n📋 Next steps:');
  console.log('1. Get your SendGrid API key from: https://app.sendgrid.com/settings/api_keys');
  console.log('2. Replace "your_sendgrid_api_key_here" with your actual API key');
  console.log('3. Update FROM_EMAIL and FROM_NAME if needed');
  console.log('4. Restart your development server');
}

console.log('\n🔧 Email Service Options:');
console.log('• SendGrid (Recommended): Easy setup, reliable delivery');
console.log('• AWS SES: Cost-effective for high volume');
console.log('• Mailgun: Good alternative to SendGrid');
console.log('• Console (Development): Logs emails to console');

console.log('\n📚 Documentation:');
console.log('• SendGrid: https://docs.sendgrid.com/');
console.log('• AWS SES: https://docs.aws.amazon.com/ses/');
console.log('• Mailgun: https://documentation.mailgun.com/');

console.log('\n✨ Setup complete! Happy emailing!');
