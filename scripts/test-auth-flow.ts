/**
 * Test the exact authentication flow to debug the issue
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuthFlow() {
  try {
    console.log('🔍 Testing exact authentication flow...\n');

    const email = 'greggambugua@gmail.com';
    const password = 'Patient123!';

    console.log(`Testing login for: ${email}`);

    // Step 1: Find user by email (exact same query as authentication service)
    console.log('\n1️⃣ Finding user by email...');
    const patient = await prisma.patient.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        address: true,
        password: true,
        mfa_enabled: true,
        last_login_at: true,
        created_at: true,
        updated_at: true
      }
    });

    console.log('Patient lookup result:', patient ? {
      id: patient.id,
      email: patient.email,
      name: `${patient.first_name} ${patient.last_name}`,
      hasPassword: !!patient.password
    } : 'NOT FOUND');

    if (!patient) {
      console.log('❌ Patient not found - this is the issue!');
      return;
    }

    // Step 2: Check password
    console.log('\n2️⃣ Checking password...');
    if (!patient.password) {
      console.log('❌ No password found');
      return;
    }

    const passwordValid = await bcrypt.compare(password, patient.password);
    console.log(`Password valid: ${passwordValid}`);

    if (passwordValid) {
      console.log('✅ Authentication should succeed!');
    } else {
      console.log('❌ Password mismatch');
    }

    // Step 3: Test the exact database connection
    console.log('\n3️⃣ Testing database connection...');
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection test:', dbTest);

    // Step 4: Test raw query
    console.log('\n4️⃣ Testing raw query...');
    const rawPatient = await prisma.$queryRaw`
      SELECT id, email, first_name, last_name, password 
      FROM "Patient" 
      WHERE email = ${email}
    `;
    console.log('Raw query result:', rawPatient);

  } catch (error) {
    console.error('❌ Error in auth flow test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFlow();

