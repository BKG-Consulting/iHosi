require('dotenv').config();
const { TemplateRegistry } = require('../dist/lib/template-engine');
const { EmailScheduler, EmailSchedulingPatterns, SchedulingStrategy } = require('../dist/lib/email-scheduler');

async function testTemplateSystem() {
  console.log('🚀 Testing Dynamic Template System...\n');

  try {
    // Get template registry instance
    const templateRegistry = TemplateRegistry.getInstance();
    
    // List all available templates
    console.log('📋 Available Templates:');
    const templates = templateRegistry.listTemplates();
    templates.forEach(template => {
      console.log(`  • ${template.id} (v${template.version}) - ${template.name}`);
      console.log(`    Type: ${template.type}, Channel: ${template.channel}`);
      console.log(`    Variables: ${template.variables.join(', ')}`);
      console.log('');
    });

    // Test template rendering
    console.log('🎨 Testing Template Rendering...');
    
    const testContext = {
      recipientName: 'John Doe',
      recipientEmail: 'john.doe@example.com',
      recipientPhone: '+1-555-0123',
      appointmentType: 'General Checkup',
      appointmentDate: 'Monday, January 15th, 2024',
      appointmentTime: '2:30 PM',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'Internal Medicine',
      facilityName: 'Healthcare System',
      systemName: 'Healthcare Management System',
      supportEmail: 'support@healthcare.com',
      supportPhone: '+1-800-HEALTH',
      websiteUrl: 'https://healthcare.com'
    };

    // Test appointment confirmation email
    const confirmationEmail = templateRegistry.renderTemplate('appointment-booked-email', testContext);
    console.log('✅ Appointment Confirmation Email:');
    console.log('Subject:', templateRegistry.getTemplateSubject('appointment-booked-email', testContext));
    console.log('Body length:', confirmationEmail.length, 'characters');
    console.log('Preview:', confirmationEmail.substring(0, 200) + '...\n');

    // Test appointment reminder email
    const reminderEmail = templateRegistry.renderTemplate('appointment-reminder-email', testContext);
    console.log('✅ Appointment Reminder Email:');
    console.log('Subject:', templateRegistry.getTemplateSubject('appointment-reminder-email', testContext));
    console.log('Body length:', reminderEmail.length, 'characters');
    console.log('Preview:', reminderEmail.substring(0, 200) + '...\n');

    // Test SMS template
    const smsBody = templateRegistry.renderTemplate('appointment-reminder-sms', testContext);
    console.log('✅ SMS Template:');
    console.log('Body:', smsBody);
    console.log('Length:', smsBody.length, 'characters\n');

    // Test email scheduling
    console.log('⏰ Testing Email Scheduling...');
    
    const emailScheduler = EmailScheduler.getInstance();
    
    // Start the scheduler
    emailScheduler.start();
    
    // Test different scheduling strategies
    console.log('\n📧 Scheduling Test Emails...');
    
    // Immediate email
    const immediateJobId = await EmailSchedulingPatterns.immediate(
      'appointment-booked-email',
      testContext
    );
    console.log(`✅ Immediate email scheduled: ${immediateJobId}`);
    
    // Delayed email (5 seconds)
    const delayedJobId = await EmailSchedulingPatterns.delayed(
      'appointment-reminder-email',
      testContext,
      5000 // 5 seconds
    );
    console.log(`✅ Delayed email scheduled: ${delayedJobId}`);
    
    // Intelligent scheduling
    const intelligentJobId = await EmailSchedulingPatterns.intelligent(
      'appointment-booked-email',
      testContext,
      'America/New_York'
    );
    console.log(`✅ Intelligent email scheduled: ${intelligentJobId}`);
    
    // Batch email
    const batchJobId = await EmailSchedulingPatterns.batch(
      'appointment-reminder-email',
      testContext,
      5
    );
    console.log(`✅ Batch email scheduled: ${batchJobId}`);
    
    // Wait a bit for processing
    console.log('\n⏳ Waiting for email processing...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Get scheduler statistics
    const stats = emailScheduler.getStats();
    console.log('\n📊 Email Scheduler Statistics:');
    console.log(`  Total Jobs: ${stats.totalJobs}`);
    console.log(`  Pending: ${stats.pendingJobs}`);
    console.log(`  Sent: ${stats.sentJobs}`);
    console.log(`  Failed: ${stats.failedJobs}`);
    console.log(`  Cancelled: ${stats.cancelledJobs}`);
    console.log(`  Running: ${stats.isRunning}`);
    
    // Get individual job statuses
    console.log('\n🔍 Job Status Details:');
    [immediateJobId, delayedJobId, intelligentJobId, batchJobId].forEach(async (jobId) => {
      const job = emailScheduler.getJobStatus(jobId);
      if (job) {
        console.log(`  ${jobId}: ${job.status} (${job.attempts} attempts)`);
      }
    });
    
    // Test template validation
    console.log('\n✅ Testing Template Validation...');
    const validTemplate = templateRegistry.getTemplate('appointment-booked-email');
    if (validTemplate) {
      const isValid = templateRegistry.validateTemplate(validTemplate.body, validTemplate.variables);
      console.log(`Template validation: ${isValid ? 'PASSED' : 'FAILED'}`);
    }
    
    // Test custom template registration
    console.log('\n🆕 Testing Custom Template Registration...');
    try {
      templateRegistry.registerTemplate({
        id: 'custom-test-email',
        name: 'Custom Test Email',
        description: 'A test template for demonstration',
        version: '1.0.0',
        type: 'APPOINTMENT_BOOKED',
        channel: 'EMAIL',
        subject: 'Custom Test - {{recipientName}}',
        body: `
          <h1>Hello {{recipientName}}!</h1>
          <p>This is a custom test template.</p>
          <p>Your appointment is scheduled for {{appointmentDate}} at {{appointmentTime}}.</p>
          <p>Best regards,<br>{{systemName}}</p>
        `,
        variables: ['recipientName', 'appointmentDate', 'appointmentTime', 'systemName'],
        fallbacks: {
          systemName: 'Healthcare System'
        }
      });
      
      // Test the custom template
      const customEmail = templateRegistry.renderTemplate('custom-test-email', testContext);
      console.log('✅ Custom template rendered successfully');
      console.log('Preview:', customEmail.substring(0, 150) + '...');
      
    } catch (error) {
      console.error('❌ Custom template registration failed:', error.message);
    }
    
    // Test template engine statistics
    console.log('\n📈 Template Engine Statistics:');
    const engine = require('../dist/lib/template-engine').TemplateEngine.getInstance();
    const engineStats = engine.getStats();
    console.log(`  Cache Size: ${engineStats.cacheSize}`);
    console.log(`  Compiled Templates: ${engineStats.compiledTemplates}`);
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    emailScheduler.clearCompletedJobs();
    emailScheduler.stop();
    
    console.log('\n🎉 Template System Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Template system test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testTemplateSystem().catch(console.error);
}

module.exports = { testTemplateSystem };
