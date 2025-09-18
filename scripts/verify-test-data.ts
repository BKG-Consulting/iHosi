/**
 * Script to verify test data was created correctly
 * Run with: npx tsx scripts/verify-test-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTestData() {
  try {
    console.log('🔍 Verifying test data...\n');

    // Check database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Check patients
    console.log('👥 Checking patients...');
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        created_at: true
      }
    });
    console.log(`Found ${patients.length} patients:`);
    patients.forEach(patient => {
      console.log(`  - ${patient.first_name} ${patient.last_name} (${patient.email})`);
    });
    console.log('');

    // Check doctors
    console.log('👨‍⚕️ Checking doctors...');
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        availability_status: true,
        created_at: true
      }
    });
    console.log(`Found ${doctors.length} doctors:`);
    doctors.forEach(doctor => {
      console.log(`  - ${doctor.name} (${doctor.email}) - Status: ${doctor.availability_status}`);
    });
    console.log('');

    // Check working days
    console.log('📅 Checking working days...');
    const workingDays = await prisma.workingDays.findMany({
      select: {
        doctor_id: true,
        day_of_week: true,
        is_working: true,
        start_time: true,
        end_time: true
      }
    });
    console.log(`Found ${workingDays.length} working day entries:`);
    workingDays.forEach(day => {
      console.log(`  - ${day.day_of_week}: ${day.is_working ? 'Working' : 'Not working'} (${day.start_time}-${day.end_time})`);
    });
    console.log('');

    // Check appointments
    console.log('📋 Checking appointments...');
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        },
        doctor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    console.log(`Found ${appointments.length} appointments:`);
    appointments.forEach(appointment => {
      console.log(`  - ${appointment.patient.first_name} ${appointment.patient.last_name} -> ${appointment.doctor.name}`);
      console.log(`    Date: ${appointment.appointment_date.toDateString()}, Time: ${appointment.time}, Status: ${appointment.status}`);
    });
    console.log('');

    // Test authentication for patient
    console.log('🔐 Testing patient authentication...');
    const testPatient = await prisma.patient.findUnique({
      where: { email: 'greggambugua@gmail.com' },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        password: true
      }
    });

    if (testPatient) {
      console.log(`✅ Patient found: ${testPatient.first_name} ${testPatient.last_name} (${testPatient.email})`);
      console.log(`   Password hash present: ${testPatient.password ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Patient not found!');
    }
    console.log('');

    // Test authentication for doctor
    console.log('🔐 Testing doctor authentication...');
    const testDoctor = await prisma.doctor.findUnique({
      where: { email: 'mbuguamuiruri12@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        availability_status: true
      }
    });

    if (testDoctor) {
      console.log(`✅ Doctor found: ${testDoctor.name} (${testDoctor.email})`);
      console.log(`   Password hash present: ${testDoctor.password ? 'Yes' : 'No'}`);
      console.log(`   Availability status: ${testDoctor.availability_status}`);
    } else {
      console.log('❌ Doctor not found!');
    }
    console.log('');

    console.log('🎉 Test data verification completed!');
    console.log('\n📧 Test Credentials:');
    console.log('┌─────────────────┬─────────────────────────────┬─────────────────┐');
    console.log('│ Role            │ Email                       │ Password        │');
    console.log('├─────────────────┼─────────────────────────────┼─────────────────┤');
    console.log('│ Doctor          │ mbuguamuiruri12@gmail.com   │ Doctor123!      │');
    console.log('│ Patient         │ greggambugua@gmail.com      │ Patient123!     │');
    console.log('└─────────────────┴─────────────────────────────┴─────────────────┘');

  } catch (error) {
    console.error('❌ Error verifying test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
verifyTestData();
