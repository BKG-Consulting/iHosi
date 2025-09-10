// Test SendGrid email configuration
require('dotenv').config();

const sgMail = require('@sendgrid/mail');

async function testSendGrid() {
  console.log('🧪 Testing SendGrid Configuration...\n');
  
  // Check environment variables
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@ihosi.com';
  const fromName = process.env.FROM_NAME || 'iHosi Healthcare System';
  
  console.log('📋 Configuration Check:');
  console.log(`   SENDGRID_API_KEY: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   FROM_EMAIL: ${fromEmail}`);
  console.log(`   FROM_NAME: ${fromName}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   ENABLE_REAL_NOTIFICATIONS: ${process.env.ENABLE_REAL_NOTIFICATIONS}`);
  
  if (!apiKey) {
    console.log('\n❌ SENDGRID_API_KEY is not set!');
    console.log('📝 To fix this:');
    console.log('   1. Get your SendGrid API key from https://app.sendgrid.com/settings/api_keys');
    console.log('   2. Add it to your .env file: SENDGRID_API_KEY=your_api_key_here');
    console.log('   3. Also add: ENABLE_REAL_NOTIFICATIONS=true');
    console.log('   4. Restart your development server');
    return;
  }
  
  // Initialize SendGrid
  sgMail.setApiKey(apiKey);
  
  // Test email
  const testEmail = {
    to: 'test@example.com', // This won't actually send
    from: {
      email: fromEmail,
      name: fromName
    },
    subject: 'Test Email from iHosi',
    html: '<h1>Test Email</h1><p>This is a test email from iHosi Healthcare System.</p>',
    text: 'Test Email - This is a test email from iHosi Healthcare System.'
  };
  
  console.log('\n📧 Test Email Configuration:');
  console.log(`   To: ${testEmail.to}`);
  console.log(`   From: ${testEmail.from.name} <${testEmail.from.email}>`);
  console.log(`   Subject: ${testEmail.subject}`);
  
  try {
    // Validate the configuration (this will throw if API key is invalid)
    console.log('\n🔍 Validating SendGrid API key...');
    await sgMail.send(testEmail);
    console.log('✅ SendGrid configuration is valid!');
  } catch (error) {
    if (error.response) {
      console.log('❌ SendGrid API Error:');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.body?.errors?.[0]?.message || 'Unknown error'}`);
      
      if (error.response.status === 401) {
        console.log('\n💡 This usually means your API key is invalid or not properly set.');
      } else if (error.response.status === 403) {
        console.log('\n💡 This usually means your API key doesn\'t have permission to send emails.');
      }
    } else {
      console.log('❌ SendGrid Error:', error.message);
    }
  }
}

testSendGrid().catch(console.error);

