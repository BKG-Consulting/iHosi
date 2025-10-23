import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedTestCredentials() {
  console.log("Seeding test credentials...");

  // Hash passwords
  const password = await bcrypt.hash("Test123!", 10);

  // Create test doctor with credentials
  const testDoctor = await prisma.doctor.upsert({
    where: { email: "doctor@test.com" },
    update: {},
    create: {
      id: "test-doctor-id",
      email: "doctor@test.com",
      name: "Dr. John Smith",
      specialization: "General Medicine",
      license_number: "MD-12345",
      phone: "+1-555-0101",
      address: "123 Medical Center Dr",
      department: "General Practice",
      emergency_contact: "Jane Smith",
      emergency_phone: "+1-555-0102",
      qualifications: "MD, MBBS, General Medicine",
      experience_years: 10,
      languages: ["English", "German"],
      consultation_fee: 100.00,
      max_patients_per_day: 20,
      preferred_appointment_duration: 30,
      password: password,
      availability_status: "AVAILABLE",
      colorCode: "#4A90E2",
      type: "FULL",
      working_days: {
        create: [
          {
            day_of_week: "Monday",
            start_time: "09:00",
            end_time: "17:00",
          },
          {
            day_of_week: "Tuesday",
            start_time: "09:00",
            end_time: "17:00",
          },
          {
            day_of_week: "Wednesday",
            start_time: "09:00",
            end_time: "17:00",
          },
          {
            day_of_week: "Thursday",
            start_time: "09:00",
            end_time: "17:00",
          },
          {
            day_of_week: "Friday",
            start_time: "09:00",
            end_time: "17:00",
          },
        ],
      },
    },
  });

  // Create test staff members with credentials
  const testNurse = await prisma.staff.upsert({
    where: { email: "nurse@test.com" },
    update: {},
    create: {
      id: "test-nurse-id",
      email: "nurse@test.com",
      name: "Sarah Johnson",
      phone: "+1-555-0201",
      address: "456 Healthcare St",
      department: "General Ward",
      role: "NURSE",
      password: password,
      status: "ACTIVE",
      colorCode: "#E74C3C",
    },
  });

  const testCashier = await prisma.staff.upsert({
    where: { email: "cashier@test.com" },
    update: {},
    create: {
      id: "test-cashier-id",
      email: "cashier@test.com",
      name: "Mike Davis",
      phone: "+1-555-0301",
      address: "789 Admin Blvd",
      department: "Billing",
      role: "CASHIER",
      password: password,
      status: "ACTIVE",
      colorCode: "#3498DB",
    },
  });

  const testLabTech = await prisma.staff.upsert({
    where: { email: "lab@test.com" },
    update: {},
    create: {
      id: "test-lab-id",
      email: "lab@test.com",
      name: "Emily Wilson",
      phone: "+1-555-0401",
      address: "321 Laboratory Ln",
      department: "Laboratory",
      role: "LAB_TECHNICIAN",
      password: password,
      status: "ACTIVE",
      colorCode: "#2ECC71",
    },
  });

  // Create test patient
  const testPatient = await prisma.patient.upsert({
    where: { email: "patient@test.com" },
    update: {},
    create: {
      id: "test-patient-id",
      first_name: "Alice",
      last_name: "Williams",
      date_of_birth: new Date("1990-05-15"),
      gender: "FEMALE",
      phone: "+1-555-0501",
      email: "patient@test.com",
      marital_status: "Single",
      address: "555 Patient Ave",
      emergency_contact_name: "Bob Williams",
      emergency_contact_number: "+1-555-0502",
      relation: "Brother",
      blood_group: "O+",
      allergies: "Penicillin",
      medical_conditions: "None",
      password: password,
      privacy_consent: true,
      service_consent: true,
      medical_consent: true,
      colorCode: "#9B59B6",
    },
  });

  // Create admin user if Admin model exists
  try {
    await prisma.$executeRaw`
      INSERT INTO "Admin" (id, email, name, password, role, status)
      VALUES ('test-admin-id', 'admin@test.com', 'Admin User', ${password}, 'SUPER_ADMIN', 'ACTIVE')
      ON CONFLICT (email) DO NOTHING;
    `;
  } catch (error) {
    console.log("Admin table might not exist, skipping admin creation");
  }

  console.log("\n✅ Test credentials created successfully!\n");
  console.log("═══════════════════════════════════════════");
  console.log("🔐 TEST CREDENTIALS (Password: Test123!)");
  console.log("═══════════════════════════════════════════\n");
  
  console.log("👨‍⚕️  DOCTOR:");
  console.log("   Email: doctor@test.com");
  console.log("   Name: Dr. John Smith");
  console.log("   Specialization: General Medicine\n");
  
  console.log("👩‍⚕️  NURSE:");
  console.log("   Email: nurse@test.com");
  console.log("   Name: Sarah Johnson\n");
  
  console.log("💵  CASHIER:");
  console.log("   Email: cashier@test.com");
  console.log("   Name: Mike Davis\n");
  
  console.log("🔬  LAB TECHNICIAN:");
  console.log("   Email: lab@test.com");
  console.log("   Name: Emily Wilson\n");
  
  console.log("👤  PATIENT:");
  console.log("   Email: patient@test.com");
  console.log("   Name: Alice Williams\n");
  
  console.log("🔧  ADMIN:");
  console.log("   Email: admin@test.com");
  console.log("   Name: Admin User\n");
  
  console.log("═══════════════════════════════════════════");
  console.log("Password for all accounts: Test123!");
  console.log("═══════════════════════════════════════════\n");

  await prisma.$disconnect();
}

seedTestCredentials().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

