/**
 * Script to create test users for the custom authentication system
 * Run with: npx tsx scripts/create-test-users.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users...');

    // Create test doctor
    const doctorPassword = await bcrypt.hash('Doctor123!', 12);
    const doctor = await prisma.doctor.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test Doctor',
        email: 'doctor@test01.com',
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
        password: doctorPassword,
        mfa_enabled: false,
        last_login_at: null,
        password_changed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Doctor created:', {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      role: 'DOCTOR'
    });

    // Create test admin (as staff with admin role)
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await prisma.staff.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Admin User',
        email: 'admin@test01.com',
        phone: '+1234567891',
        address: '456 Admin Street, Test City',
        role: 'ADMIN',
        department_id: null,
        status: 'ACTIVE',
        password: adminPassword,
        mfa_enabled: false,
        last_login_at: null,
        password_changed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Admin created:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'ADMIN'
    });

    // Create test patient
    const patientPassword = await bcrypt.hash('Patient123!', 12);
    const patient = await prisma.patient.create({
      data: {
        id: crypto.randomUUID(),
        first_name: 'TestPatient',
        last_name: 'Patient',
        email: 'patient@test01.com',
        phone: '0701134048',
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
        password_changed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Patient created:', {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      email: patient.email,
      role: 'PATIENT'
    });

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('┌─────────────────┬─────────────────┬─────────────────┐');
    console.log('│ Role            │ Email           │ Password        │');
    console.log('├─────────────────┼─────────────────┼─────────────────┤');
    console.log('│ Doctor          │ doctor@test.com │ Doctor123!      │');
    console.log('│ Admin           │ admin@test.com  │ Admin123!       │');
    console.log('│ Patient         │ patient@test.com│ Patient123!     │');
    console.log('└─────────────────┴─────────────────┴─────────────────┘');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestUsers();
