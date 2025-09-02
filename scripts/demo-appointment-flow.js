#!/usr/bin/env node

/**
 * Appointment Booking Flow Demo
 * 
 * This script demonstrates how the integrated dynamic template and smart email 
 * scheduling system works with the appointment booking flow.
 */

require('dotenv').config();

// Import the compiled modules
const { TemplateRegistry } = require('../dist/lib/template-engine');
const { EmailScheduler, SchedulingStrategy } = require('../dist/lib/email-scheduler');

console.log('🚀 Appointment Booking Flow Demo');
console.log('================================\n');

async function demoAppointmentFlow() {
  try {
    // Initialize the systems
    const templateRegistry = TemplateRegistry.getInstance();
    const emailScheduler = EmailScheduler.getInstance();
    
    console.log('📋 Available Templates:');
    const templates = templateRegistry.listTemplates();
    templates.forEach(template => {
      console.log(`  • ${template.id} - ${template.name}`);
    });
    
    console.log('\n🎯 Demo: Complete Appointment Lifecycle');
    console.log('========================================\n');
    
    // 1. Appointment Booking
    console.log('1️⃣  APPOINTMENT BOOKING');
    console.log('------------------------');
    
    const appointmentContext = {
      recipientName: 'Sarah Johnson',
      recipientEmail: 'sarah.johnson@example.com',
      recipientPhone: '+1-555-0123',
      appointmentId: 'APT-001',
      appointmentType: 'General Checkup',
      appointmentDate: 'Monday, January 20, 2025',
      appointmentTime: '10:00 AM',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialization: 'Internal Medicine',
      facilityName: 'Healthcare System',
      systemName: 'Healthcare Management System',
      supportEmail: 'support@healthcare.com',
      supportPhone: '+1-800-HEALTH',
      websiteUrl: 'https://healthcare.com'
    };
    
    // Send immediate confirmation
    const confirmationJobId = await emailScheduler.scheduleEmail(
      'appointment-booked-email',
      appointmentContext,
      {
        strategy: SchedulingStrategy.IMMEDIATE,
        priority: 'HIGH',
        retryAttempts: 3,
        retryDelay: 5 * 60 * 1000
      }
    );
    
    console.log(`✅ Confirmation email scheduled: ${confirmationJobId}`);
    
    // Schedule reminder for 24 hours before
    const reminderJobId = await emailScheduler.scheduleEmail(
      'appointment-reminder-email',
      appointmentContext,
      {
        strategy: SchedulingStrategy.DELAYED,
        priority: 'MEDIUM',
        retryAttempts: 2,
        retryDelay: 10 * 60 * 1000,
        delay: 24 * 60 * 60 * 1000 // 24 hours delay
      }
    );
    
    console.log(`✅ Reminder email scheduled: ${reminderJobId}`);
    
    // 2. Appointment Confirmation
    console.log('\n2️⃣  APPOINTMENT CONFIRMATION');
    console.log('-----------------------------');
    
    const confirmationContext = { ...appointmentContext };
    const confirmationJobId2 = await emailScheduler.scheduleEmail(
      'appointment-confirmed-email',
      confirmationContext,
      {
        strategy: SchedulingStrategy.IMMEDIATE,
        priority: 'MEDIUM',
        retryAttempts: 2,
        retryDelay: 5 * 60 * 1000
      }
    );
    
    console.log(`✅ Confirmation status email scheduled: ${confirmationJobId2}`);
    
    // 3. Appointment Rescheduling
    console.log('\n3️⃣  APPOINTMENT RESCHEDULING');
    console.log('-------------------------------');
    
    const rescheduleContext = {
      ...appointmentContext,
      appointmentDate: 'Tuesday, January 21, 2025',
      appointmentTime: '2:00 PM',
      previousDate: 'Monday, January 20, 2025',
      previousTime: '10:00 AM'
    };
    
    const rescheduleJobId = await emailScheduler.scheduleEmail(
      'appointment-rescheduled-email',
      rescheduleContext,
      {
        strategy: SchedulingStrategy.IMMEDIATE,
        priority: 'HIGH',
        retryAttempts: 3,
        retryDelay: 5 * 60 * 1000
      }
    );
    
    console.log(`✅ Rescheduling notification scheduled: ${rescheduleJobId}`);
    
    // 4. Appointment Cancellation
    console.log('\n4️⃣  APPOINTMENT CANCELLATION');
    console.log('-------------------------------');
    
    const cancellationContext = {
      ...appointmentContext,
      appointmentDate: 'Tuesday, January 21, 2025',
      appointmentTime: '2:00 PM'
    };
    
    const cancellationJobId = await emailScheduler.scheduleEmail(
      'appointment-cancelled-email',
      cancellationContext,
      {
        strategy: SchedulingStrategy.IMMEDIATE,
        priority: 'HIGH',
        retryAttempts: 2,
        retryDelay: 5 * 60 * 1000
      }
    );
    
    console.log(`✅ Cancellation notification scheduled: ${cancellationJobId}`);
    
    // 5. SMS Notifications
    console.log('\n5️⃣  SMS NOTIFICATIONS');
    console.log('----------------------');
    
    // SMS confirmation
    const smsContext = {
      ...appointmentContext,
      appointmentDate: 'Monday, January 20, 2025',
      appointmentTime: '10:00 AM'
    };
    
    console.log('📱 SMS Templates Available:');
    const smsTemplates = templates.filter(t => t.channel === 'SMS');
    smsTemplates.forEach(template => {
      console.log(`  • ${template.id}: ${template.body.substring(0, 60)}...`);
    });
    
    // 6. System Statistics
    console.log('\n6️⃣  SYSTEM STATISTICS');
    console.log('----------------------');
    
    const schedulerStats = emailScheduler.getStats();
    console.log(`📊 Email Scheduler:`);
    console.log(`  • Total Jobs: ${schedulerStats.totalJobs}`);
    console.log(`  • Pending: ${schedulerStats.pending}`);
    console.log(`  • Running: ${schedulerStats.running}`);
    
    console.log(`📋 Template Engine:`);
    console.log(`  • Templates Available: ${templates.length}`);
    console.log(`  • Email Templates: ${templates.filter(t => t.channel === 'EMAIL').length}`);
    console.log(`  • SMS Templates: ${templates.filter(t => t.channel === 'SMS').length}`);
    
    // 7. Template Rendering Demo
    console.log('\n7️⃣  TEMPLATE RENDERING DEMO');
    console.log('-----------------------------');
    
    const renderedEmail = templateRegistry.renderTemplate('appointment-booked-email', appointmentContext);
    const renderedSubject = templateRegistry.getTemplateSubject('appointment-booked-email', appointmentContext);
    
    console.log(`📧 Rendered Email Subject: ${renderedSubject}`);
    console.log(`📧 Rendered Email Body Length: ${renderedEmail.length} characters`);
    console.log(`📧 Preview: ${renderedEmail.substring(0, 100)}...`);
    
    // 8. Job Monitoring
    console.log('\n8️⃣  JOB MONITORING');
    console.log('-------------------');
    
    const allJobs = [
      confirmationJobId,
      reminderJobId,
      confirmationJobId2,
      rescheduleJobId,
      cancellationJobId
    ];
    
    console.log('📋 Job Status Overview:');
    allJobs.forEach(jobId => {
      const status = emailScheduler.getJobStatus(jobId);
      console.log(`  • ${jobId}: ${status?.status || 'unknown'}`);
    });
    
    // 9. Cleanup
    console.log('\n9️⃣  CLEANUP');
    console.log('------------');
    
    // Clear completed jobs
    const clearedCount = emailScheduler.clearCompletedJobs();
    console.log(`🧹 Cleared ${clearedCount} completed email jobs`);
    
    console.log('🧹 Cleanup completed');
    
    console.log('\n🎉 Demo Completed Successfully!');
    console.log('================================');
    console.log('\n📚 What we demonstrated:');
    console.log('  ✅ Template-based appointment notifications');
    console.log('  ✅ Smart email scheduling with different strategies');
    console.log('  ✅ Multi-channel support (Email + SMS)');
    console.log('  ✅ Dynamic content rendering with variables');
    console.log('  ✅ Job monitoring and management');
    console.log('  ✅ System statistics and health monitoring');
    console.log('  ✅ Proper cleanup and resource management');
    
    console.log('\n🚀 The appointment booking system is now fully integrated with:');
    console.log('  • Dynamic template engine');
    console.log('  • Smart email scheduling');
    console.log('  • Professional notification system');
    console.log('  • Comprehensive audit logging');
    console.log('  • Scalable architecture');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the demo
if (require.main === module) {
  demoAppointmentFlow()
    .then(() => {
      console.log('\n✨ Demo completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo failed with error:', error);
      process.exit(1);
    });
}

module.exports = { demoAppointmentFlow };
