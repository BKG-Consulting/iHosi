/**
 * Debug script to check what's actually in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database contents...\n');

    // Check all patients
    console.log('👥 All patients in database:');
    const allPatients = await prisma.patient.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        password: true
      }
    });
    console.log(`Found ${allPatients.length} patients:`);
    allPatients.forEach(patient => {
      console.log(`  - ID: ${patient.id}`);
      console.log(`    Email: ${patient.email}`);
      console.log(`    Name: ${patient.first_name} ${patient.last_name}`);
      console.log(`    Has Password: ${!!patient.password}`);
      console.log('');
    });

    // Check all doctors
    console.log('👨‍⚕️ All doctors in database:');
    const allDoctors = await prisma.doctor.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    });
    console.log(`Found ${allDoctors.length} doctors:`);
    allDoctors.forEach(doctor => {
      console.log(`  - ID: ${doctor.id}`);
      console.log(`    Email: ${doctor.email}`);
      console.log(`    Name: ${doctor.name}`);
      console.log(`    Has Password: ${!!doctor.password}`);
      console.log('');
    });

    // Check all staff
    console.log('👨‍💼 All staff in database:');
    const allStaff = await prisma.staff.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    });
    console.log(`Found ${allStaff.length} staff:`);
    allStaff.forEach(staff => {
      console.log(`  - ID: ${staff.id}`);
      console.log(`    Email: ${staff.email}`);
      console.log(`    Name: ${staff.name}`);
      console.log(`    Role: ${staff.role}`);
      console.log(`    Has Password: ${!!staff.password}`);
      console.log('');
    });

    // Test specific email lookup
    console.log('🔍 Testing specific email lookup:');
    const testEmail = 'greggambugua@gmail.com';
    
    const patientByEmail = await prisma.patient.findUnique({
      where: { email: testEmail }
    });
    console.log(`Patient lookup for ${testEmail}:`, patientByEmail ? 'FOUND' : 'NOT FOUND');
    
    const doctorByEmail = await prisma.doctor.findUnique({
      where: { email: testEmail }
    });
    console.log(`Doctor lookup for ${testEmail}:`, doctorByEmail ? 'FOUND' : 'NOT FOUND');
    
    const staffByEmail = await prisma.staff.findUnique({
      where: { email: testEmail }
    });
    console.log(`Staff lookup for ${testEmail}:`, staffByEmail ? 'FOUND' : 'NOT FOUND');

  } catch (error) {
    console.error('❌ Error debugging database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();

