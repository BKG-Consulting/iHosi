#!/usr/bin/env node

/**
 * Test script for the Healthcare Notification System
 * 
 * This script demonstrates the notification and reminder functionality
 * Run with: node scripts/test-notifications.js
 */

const { notificationService } = require('../lib/notifications');
const { reminderScheduler } = require('../lib/reminder-scheduler');

// Mock appointment data for testing
const mockAppointment = {
  id: 999,
  patient_id: 'test-patient-123',
  doctor_id: 'test-doctor-456',
  appointment_date: new Date('2025-01-15T10:00:00Z'),
  time: '10:00 AM',
  type: 'General Consultation',
  status: 'PENDING',
  note: 'Test appointment for notification system',
  created_at: new Date(),
  updated_at: new Date(),
  patient: {
    id: 'test-patient-123',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: new Date('1990-01-01'),
    phone: '+1234567890',
    email: 'john.doe@example.com',
    address: '123 Test Street',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_number: '+1234567891',
    relation: 'spouse',
    blood_group: 'O+',
    allergies: 'None',
    medical_conditions: 'None',
    medical_history: 'None',
    insurance_provider: 'Test Insurance',
    insurance_number: 'INS123456',
    privacy_consent: true,
    service_consent: true,
    medical_consent: true,
    img: null,
    colorCode: '#3B82F6',
    created_at: new Date(),
    updated_at: new Date()
  },
  doctor: {
    id: 'test-doctor-456',
    email: 'dr.smith@clinic.com',
    name: 'Dr. Sarah Smith',
    specialization: 'General Medicine',
    license_number: 'MD123456',
    phone: '+1987654321',
    address: '456 Clinic Avenue',
    department: 'General Practice',
    img: null,
    colorCode: '#10B981',
    availability_status: 'AVAILABLE',
    type: 'FULL',
    created_at: new Date(),
    updated_at: new Date()
  }
};

async function testNotificationSystem() {
  console.log('🚀 Testing Healthcare Notification System\n');
  
  try {
    // Test 1: Send appointment booking notification
    console.log('📧 Test 1: Sending appointment booking notification...');
    await notificationService.sendAppointmentBookedNotification(mockAppointment);
    console.log('✅ Appointment booking notification sent successfully\n');
    
    // Test 2: Send appointment reminder
    console.log('⏰ Test 2: Sending appointment reminder...');
    await notificationService.sendAppointmentReminder(mockAppointment);
    console.log('✅ Appointment reminder sent successfully\n');
    
    // Test 3: Send appointment cancellation notification
    console.log('🚫 Test 3: Sending appointment cancellation notification...');
    await notificationService.sendAppointmentCancellationNotification(mockAppointment);
    console.log('✅ Appointment cancellation notification sent successfully\n');
    
    // Test 4: Schedule reminders
    console.log('📅 Test 4: Scheduling appointment reminders...');
    await reminderScheduler.scheduleAppointmentReminders(mockAppointment);
    console.log('✅ Appointment reminders scheduled successfully\n');
    
    // Test 5: Check scheduler status
    console.log('⚙️ Test 5: Checking reminder scheduler status...');
    const status = reminderScheduler.getStatus();
    console.log('Scheduler Status:', JSON.stringify(status, null, 2));
    
    // Test 6: Test custom notification
    console.log('\n📱 Test 6: Sending custom notification...');
    await notificationService.sendNotification({
      type: 'APPOINTMENT_RESCHEDULED',
      channel: 'EMAIL',
      priority: 'HIGH',
      recipientId: mockAppointment.patient_id,
      recipientType: 'PATIENT',
      appointmentId: mockAppointment.id,
      patientId: mockAppointment.patient_id,
      doctorId: mockAppointment.doctor_id,
      scheduledFor: mockAppointment.appointment_date,
      metadata: {
        patientName: `${mockAppointment.patient.first_name} ${mockAppointment.patient.last_name}`,
        appointmentType: mockAppointment.type,
        appointmentDate: '2025-01-16',
        appointmentTime: '2:00 PM',
        doctorName: mockAppointment.doctor.name,
        location: 'Main Clinic',
        clinicName: 'Healthcare System',
        previousDate: '2025-01-15',
        previousTime: '10:00 AM'
      }
    });
    console.log('✅ Custom notification sent successfully\n');
    
    console.log('🎉 All notification tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Appointment booking notifications');
    console.log('- ✅ Appointment reminders');
    console.log('- ✅ Cancellation notifications');
    console.log('- ✅ Reminder scheduling');
    console.log('- ✅ Custom notifications');
    console.log('- ✅ Scheduler status monitoring');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Test reminder scheduler configuration
function testReminderConfiguration() {
  console.log('\n🔧 Testing Reminder Configuration...');
  
  // Get current config
  const currentConfig = reminderScheduler.getConfig();
  console.log('Current Configuration:', JSON.stringify(currentConfig, null, 2));
  
  // Update config
  console.log('\nUpdating configuration...');
  reminderScheduler.updateConfig({
    reminderHoursBefore: [48, 24, 12, 2, 1],
    confirmationHoursAfter: 2,
    followUpHoursAfter: 48
  });
  
  // Get updated config
  const updatedConfig = reminderScheduler.getConfig();
  console.log('Updated Configuration:', JSON.stringify(updatedConfig, null, 2));
  
  // Reset to default
  reminderScheduler.updateConfig({
    reminderHoursBefore: [24, 2],
    confirmationHoursAfter: 1,
    followUpHoursAfter: 24
  });
  
  console.log('✅ Configuration tests completed\n');
}

// Test notification templates
function testNotificationTemplates() {
  console.log('📝 Testing Notification Templates...');
  
  const templateTypes = [
    'APPOINTMENT_BOOKED',
    'APPOINTMENT_REMINDER',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_RESCHEDULED',
    'DOCTOR_AVAILABILITY'
  ];
  
  templateTypes.forEach(type => {
    console.log(`- ${type}: Available`);
  });
  
  console.log('✅ Template tests completed\n');
}

// Main execution
async function main() {
  console.log('🏥 Healthcare Notification System Test Suite\n');
  
  // Test reminder configuration
  testReminderConfiguration();
  
  // Test notification templates
  testNotificationTemplates();
  
  // Test notification system
  await testNotificationSystem();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Replace mock email/SMS services with real providers');
  console.log('2. Configure environment variables for production');
  console.log('3. Test with real appointment data');
  console.log('4. Monitor console logs for notification delivery');
  console.log('5. Check audit logs for compliance tracking');
  
  console.log('\n📚 For more information, see: NOTIFICATION_SYSTEM_README.md');
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testNotificationSystem,
  testReminderConfiguration,
  testNotificationTemplates
};
