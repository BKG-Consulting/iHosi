/**
 * Script to create basic test data for the healthcare system
 * Run with: npx tsx scripts/create-basic-test-data.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createBasicTestData() {
  try {
    console.log('🚀 Creating basic test data...');

    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    await prisma.refreshToken.deleteMany();
    await prisma.userMFA.deleteMany();
    await prisma.rateLimit.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.staff.deleteMany();

    // Create test doctor
    const doctorPassword = await bcrypt.hash('Doctor123!', 12);
    const doctor = await prisma.doctor.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Dr. John Smith',
        email: 'mbuguamuiruri12@gmail.com',
        phone: '+1234567890',
        address: '123 Medical Center, Test City',
        specialization: 'General Practice',
        license_number: 'DOC123456',
        emergency_contact: 'Emergency Contact',
        emergency_phone: '+1234567899',
        qualifications: 'MBBS, MD',
        type: 'FULL',
        department_id: null,
        experience_years: 5,
        consultation_fee: 100,
        max_patients_per_day: 20,
        preferred_appointment_duration: 30,
        availability_status: 'AVAILABLE',
        password: doctorPassword,
        mfa_enabled: false,
        last_login_at: null,
        password_changed_at: new Date()
      }
    });

    console.log('✅ Doctor created:', {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email
    });

    // Create test admin (as staff with admin role)
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await prisma.staff.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Admin User',
        email: 'admin@test.com',
        phone: '+1234567891',
        address: '456 Admin Street, Test City',
        role: 'ADMIN',
        department_id: null,
        status: 'ACTIVE',
        password: adminPassword,
        mfa_enabled: false,
        last_login_at: null,
        password_changed_at: new Date()
      }
    });

    console.log('✅ Admin created:', {
      id: admin.id,
      name: admin.name,
      email: admin.email
    });

    // Create test patient
    const patientPassword = await bcrypt.hash('Patient123!', 12);
    const patient = await prisma.patient.create({
      data: {
        id: crypto.randomUUID(),
        first_name: 'John',
        last_name: 'Doe',
        email: 'greggambugua@gmail.com',
        phone: '+1234567892',
        date_of_birth: new Date('1990-01-01'),
        gender: 'MALE',
        marital_status: 'SINGLE',
        address: '789 Patient Lane, Test City',
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_number: '+1234567893',
        relation: 'Spouse',
        privacy_consent: true,
        service_consent: true,
        medical_consent: true,
        password: patientPassword,
        mfa_enabled: false,
        last_login_at: null,
        password_changed_at: new Date()
      }
    });

    console.log('✅ Patient created:', {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      email: patient.email
    });

    // Create a test nurse
    const nursePassword = await bcrypt.hash('Nurse123!', 12);
    const nurse = await prisma.staff.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Jane Nurse',
        email: 'nurse@test.com',
        phone: '+1234567894',
        address: '321 Nurse Street, Test City',
        role: 'NURSE',
        department_id: null,
        status: 'ACTIVE',
        password: nursePassword,
        mfa_enabled: false,
        last_login_at: null,
        password_changed_at: new Date()
      }
    });

    console.log('✅ Nurse created:', {
      id: nurse.id,
      name: nurse.name,
      email: nurse.email
    });

    // Create working schedule for doctor
    console.log('📅 Creating doctor working schedule...');
    const workingDays = [
      { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Saturday', isWorking: false, startTime: '09:00', endTime: '17:00', breakStart: null, breakEnd: null },
      { day: 'Sunday', isWorking: false, startTime: '09:00', endTime: '17:00', breakStart: null, breakEnd: null }
    ];

    for (const day of workingDays) {
      await prisma.workingDays.create({
        data: {
          doctor_id: doctor.id,
          day_of_week: day.day,
          is_working: day.isWorking,
          start_time: day.startTime,
          end_time: day.endTime,
          break_start_time: day.breakStart,
          break_end_time: day.breakEnd,
          max_appointments: 20,
          appointment_duration: 30,
          buffer_time: 5,
          timezone: 'UTC',
          recurrence_type: 'WEEKLY',
          effective_from: new Date(),
          effective_until: null,
          is_template: false
        }
      });
    }

    console.log('✅ Doctor working schedule created');

    // Create test appointments
    console.log('📋 Creating test appointments...');
    
    // Create some pending appointments for testing drag and drop
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const pendingAppointment1 = await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: tomorrow,
        time: '10:00',
        type: 'CONSULTATION',
        status: 'PENDING',
        reason: 'General checkup',
        note: 'Patient requested routine checkup'
      }
    });

    const pendingAppointment2 = await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: tomorrow,
        time: '11:00',
        type: 'FOLLOW_UP',
        status: 'PENDING',
        reason: 'Follow-up visit',
        note: 'Follow-up for previous treatment'
      }
    });

    // Create a scheduled appointment to show in the calendar
    const scheduledAppointment = await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: tomorrow,
        time: '14:00',
        type: 'CONSULTATION',
        status: 'SCHEDULED',
        reason: 'Regular consultation',
        note: 'Scheduled appointment'
      }
    });

    console.log('✅ Test appointments created:', {
      pending: 2,
      scheduled: 1,
      total: 3
    });

    console.log('\n🎉 Basic test data created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('┌─────────────────┬─────────────────────────────┬─────────────────┐');
    console.log('│ Role            │ Email                       │ Password        │');
    console.log('├─────────────────┼─────────────────────────────┼─────────────────┤');
    console.log('│ Doctor          │ mbuguamuiruri12@gmail.com   │ Doctor123!      │');
    console.log('│ Admin           │ admin@test.com              │ Admin123!       │');
    console.log('│ Patient         │ greggambugua@gmail.com      │ Patient123!     │');
    console.log('│ Nurse           │ nurse@test.com              │ Nurse123!       │');
    console.log('└─────────────────┴─────────────────────────────┴─────────────────┘');
    
    console.log('\n📧 Email Testing:');
    console.log('• Doctor will receive notifications at: mbuguamuiruri12@gmail.com');
    console.log('• Patient will receive notifications at: greggambugua@gmail.com');
    console.log('• Test the drag & drop scheduling to trigger email notifications!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createBasicTestData();



