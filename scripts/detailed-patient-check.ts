/**
 * Detailed patient check to see what's wrong with the patient record
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function detailedPatientCheck() {
  try {
    console.log('🔍 Detailed patient check...\n');

    const testEmail = 'greggambugua@gmail.com';
    
    // Get the full patient record
    const patient = await prisma.patient.findUnique({
      where: { email: testEmail }
    });

    if (patient) {
      console.log('✅ Patient found! Full record:');
      console.log(JSON.stringify(patient, null, 2));
      
      // Check if password field exists and has value
      console.log('\n🔐 Password field analysis:');
      console.log(`Password field exists: ${'password' in patient}`);
      console.log(`Password value: ${patient.password}`);
      console.log(`Password type: ${typeof patient.password}`);
      console.log(`Password length: ${patient.password?.length || 0}`);
      
      // Check all fields
      console.log('\n📋 All patient fields:');
      Object.keys(patient).forEach(key => {
        const value = patient[key as keyof typeof patient];
        console.log(`  ${key}: ${typeof value} = ${value}`);
      });
      
    } else {
      console.log('❌ Patient not found!');
    }

  } catch (error) {
    console.error('❌ Error checking patient:', error);
  } finally {
    await prisma.$disconnect();
  }
}

detailedPatientCheck();

