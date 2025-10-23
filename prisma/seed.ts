const { PrismaClient } = require("@prisma/client");
const { fakerDE: faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

// Generate random color function
function generateRandomColor(): string {
  let hexColor = "";
  do {
    const randomInt = Math.floor(Math.random() * 16777216);
    hexColor = `#${randomInt.toString(16).padStart(6, "0")}`;
  } while (
    hexColor.toLowerCase() === "#ffffff" ||
    hexColor.toLowerCase() === "#000000"
  );
  return hexColor;
}

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding data...");

  // Create 3 staff (skip - not needed for doctor app testing)
  // Focusing on doctors and patients for mobile app development

  // Create 10 doctors with proper working days
  const doctors = [];
  const specializations = ["Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology"];
  const hashedPassword = await bcrypt.hash("Doctor@123", 10);
  
  for (let i = 0; i < 10; i++) {
    const doctorId = faker.string.uuid();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = `doctor${i + 1}@hospital.com`;
    const specialization = specializations[i % specializations.length];
    
    // Create doctor record with authentication and proper working days
    const doctor = await prisma.doctor.create({
      data: {
        id: doctorId,
        email: email,
        name: `Dr. ${firstName} ${lastName}`,
        specialization: specialization,
        license_number: `LIC-${faker.string.alphanumeric(8).toUpperCase()}`,
        phone: faker.phone.number(),
        address: faker.address.streetAddress(),
        department: specialization,
        emergency_contact: faker.name.fullName(),
        emergency_phone: faker.phone.number(),
        qualifications: `MD, ${specialization} Specialist`,
        experience_years: Math.floor(Math.random() * 20) + 5,
        languages: ["English", "Spanish"],
        consultation_fee: 150.0,
        max_patients_per_day: 16,
        preferred_appointment_duration: 30,
        availability_status: i % 3 === 0 ? "BUSY" : "AVAILABLE", // Mix of available and busy
        password: hashedPassword, // Add password for authentication
        mfa_enabled: false,
        colorCode: generateRandomColor(),
        type: i % 2 === 0 ? "FULL" : "PART",
        working_days: {
          create: [
            // Monday
            {
              day_of_week: "Monday",
              start_time: "09:00",
              end_time: "17:00",
              is_working: true,
              break_start_time: "12:00",
              break_end_time: "13:00",
              appointment_duration: 30,
              buffer_time: 5,
              max_appointments: 16,
              timezone: "UTC",
              recurrence_type: "WEEKLY",
            },
            // Tuesday
            {
              day_of_week: "Tuesday",
              start_time: "09:00",
              end_time: "17:00",
              is_working: true,
              break_start_time: "12:00",
              break_end_time: "13:00",
              appointment_duration: 30,
              buffer_time: 5,
              max_appointments: 16,
              timezone: "UTC",
              recurrence_type: "WEEKLY",
            },
            // Wednesday
            {
              day_of_week: "Wednesday",
              start_time: "09:00",
              end_time: "17:00",
              is_working: true,
              break_start_time: "12:00",
              break_end_time: "13:00",
              appointment_duration: 30,
              buffer_time: 5,
              max_appointments: 16,
              timezone: "UTC",
              recurrence_type: "WEEKLY",
            },
            // Thursday
            {
              day_of_week: "Thursday",
              start_time: "09:00",
              end_time: "17:00",
              is_working: true,
              break_start_time: "12:00",
              break_end_time: "13:00",
              appointment_duration: 30,
              buffer_time: 5,
              max_appointments: 16,
              timezone: "UTC",
              recurrence_type: "WEEKLY",
            },
            // Friday
            {
              day_of_week: "Friday",
              start_time: "09:00",
              end_time: "17:00",
              is_working: true,
              break_start_time: "12:00",
              break_end_time: "13:00",
              appointment_duration: 30,
              buffer_time: 5,
              max_appointments: 16,
              timezone: "UTC",
              recurrence_type: "WEEKLY",
            },
            // Saturday - Not working
            {
              day_of_week: "Saturday",
              start_time: "09:00",
              end_time: "17:00",
              is_working: false,
              break_start_time: null,
              break_end_time: null,
              appointment_duration: 30,
              buffer_time: 5,
              max_appointments: 0,
              timezone: "UTC",
              recurrence_type: "WEEKLY",
            },
            // Sunday - Not working
            {
              day_of_week: "Sunday",
              start_time: "09:00",
              end_time: "17:00",
              is_working: false,
              break_start_time: null,
              break_end_time: null,
              appointment_duration: 30,
              buffer_time: 5,
              max_appointments: 0,
              timezone: "UTC",
              recurrence_type: "WEEKLY",
            },
          ],
        },
      },
      include: {
        working_days: true,
      },
    });
    doctors.push(doctor);
    
    console.log(`Created doctor: ${doctor.name} (${email}) - ${doctor.availability_status}`);
  }

  // Create 20 patients with authentication
  const patients = [];
  const patientPassword = await bcrypt.hash("Patient@123", 10);
  
  for (let i = 0; i < 20; i++) {
    const patientId = faker.string.uuid();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = `patient${i + 1}@email.com`;
    
    // Create patient record with authentication
    const patient = await prisma.patient.create({
      data: {
        id: patientId,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: faker.date.birthdate(),
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        phone: faker.phone.number(),
        email: email,
        marital_status: i % 3 === 0 ? "Married" : "Single",
        address: faker.address.streetAddress(),
        emergency_contact_name: faker.name.fullName(),
        emergency_contact_number: faker.phone.number(),
        relation: "Sibling",
        blood_group: i % 4 === 0 ? "O+" : "A+",
        allergies: faker.lorem.words(2),
        medical_conditions: faker.lorem.words(3),
        privacy_consent: true,
        service_consent: true,
        medical_consent: true,
        password: patientPassword, // Add password for authentication
        mfa_enabled: false,
        colorCode: generateRandomColor(),
      },
    });

    patients.push(patient);
    console.log(`Created patient: ${firstName} ${lastName} (${email})`);
  }

  // Create Appointments with realistic distribution
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const appointmentTypes = [
    "General Consultation",
    "Follow-up Visit",
    "Annual Physical",
    "Urgent Care",
    "Specialist Consultation",
    "Routine Checkup",
    "Preventive Care",
    "Chronic Disease Management"
  ];
  
  const appointmentReasons = [
    "Routine checkup and health assessment",
    "Follow-up for blood pressure monitoring",
    "Diabetes management and blood sugar review",
    "Persistent headaches for the past week",
    "Annual physical examination",
    "Medication review and adjustment",
    "Lab results discussion",
    "Chest pain and breathing difficulties",
    "Skin rash assessment",
    "Back pain management"
  ];
  
  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
  
  // Create appointments for doctor2 (our test doctor) - mix of statuses and dates
  const testDoctor = doctors[1]; // doctor2@hospital.com
  const testDoctorAppointments = [
    // Today - 3 scheduled appointments
    { date: today, time: "09:00", status: "SCHEDULED", type: "General Consultation", reason: "Annual physical examination", note: "Patient requests blood work" },
    { date: today, time: "10:30", status: "SCHEDULED", type: "Follow-up Visit", reason: "Follow-up for blood pressure monitoring", note: "BP was 140/90 last visit" },
    { date: today, time: "14:00", status: "COMPLETED", type: "Routine Checkup", reason: "Routine checkup and health assessment", note: "Patient doing well" },
    
    // Today - 1 pending request
    { date: today, time: "15:30", status: "PENDING", type: "Urgent Care", reason: "Persistent headaches for the past week", note: "Needs immediate attention" },
    
    // Tomorrow - 2 scheduled
    { date: tomorrow, time: "09:30", status: "SCHEDULED", type: "Specialist Consultation", reason: "Diabetes management and blood sugar review", note: "HbA1c results pending" },
    { date: tomorrow, time: "11:00", status: "SCHEDULED", type: "Follow-up Visit", reason: "Medication review and adjustment", note: null },
    
    // Yesterday - 2 completed
    { date: yesterday, time: "10:00", status: "COMPLETED", type: "General Consultation", reason: "Chest pain and breathing difficulties", note: "Referred to cardiologist" },
    { date: yesterday, time: "14:30", status: "COMPLETED", type: "Routine Checkup", reason: "Skin rash assessment", note: "Prescribed topical cream" },
    
    // Next week - 3 scheduled
    { date: nextWeek, time: "09:00", status: "SCHEDULED", type: "Follow-up Visit", reason: "Lab results discussion", note: null },
    { date: nextWeek, time: "10:30", status: "SCHEDULED", type: "Chronic Disease Management", reason: "Diabetes follow-up", note: null },
    { date: nextWeek, time: "15:00", status: "SCHEDULED", type: "Preventive Care", reason: "Vaccination and health screening", note: null },
  ];
  
  for (let i = 0; i < testDoctorAppointments.length; i++) {
    const apptData = testDoctorAppointments[i];
    const patient = patients[i % patients.length];
    
    await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: testDoctor.id,
        appointment_date: apptData.date,
        time: apptData.time,
        status: apptData.status,
        type: apptData.type,
        reason: apptData.reason,
        note: apptData.note,
      },
    });
  }
  
  console.log(`✅ Created ${testDoctorAppointments.length} appointments for test doctor (doctor2@hospital.com)`);
  
  // Create appointments for doctor3 - another test doctor
  const testDoctor3 = doctors[2]; // doctor3@hospital.com
  const doctor3Appointments = [
    // Today - mix of statuses
    { date: today, time: "09:30", status: "COMPLETED", type: "General Consultation", reason: "Back pain management", note: "Prescribed pain medication" },
    { date: today, time: "11:00", status: "SCHEDULED", type: "Follow-up Visit", reason: "Post-surgery follow-up", note: "Check wound healing" },
    { date: today, time: "14:30", status: "SCHEDULED", type: "Urgent Care", reason: "Severe allergic reaction", note: "Patient reports hives" },
    
    // Today - pending requests
    { date: today, time: "16:00", status: "PENDING", type: "General Consultation", reason: "Fever and cough for 3 days", note: "Possible flu" },
    
    // Tomorrow
    { date: tomorrow, time: "10:00", status: "SCHEDULED", type: "Routine Checkup", reason: "Annual health screening", note: null },
    { date: tomorrow, time: "15:00", status: "SCHEDULED", type: "Specialist Consultation", reason: "Arthritis pain management", note: null },
  ];
  
  for (let i = 0; i < doctor3Appointments.length; i++) {
    const apptData = doctor3Appointments[i];
    const patient = patients[(i + 5) % patients.length];
    
    await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: testDoctor3.id,
        appointment_date: apptData.date,
        time: apptData.time,
        status: apptData.status,
        type: apptData.type,
        reason: apptData.reason,
        note: apptData.note,
      },
    });
  }
  
  console.log(`✅ Created ${doctor3Appointments.length} appointments for test doctor (doctor3@hospital.com)`);
  
  // Create random appointments for other doctors
  for (let i = 0; i < 30; i++) {
    const doctor = doctors[3 + (i % 7)]; // Use doctors 4-10
    const patient = patients[i % patients.length];
    const randomDaysOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
    const appointmentDate = new Date(today);
    appointmentDate.setDate(appointmentDate.getDate() + randomDaysOffset);
    
    const statuses = ["PENDING", "SCHEDULED", "SCHEDULED", "COMPLETED", "CANCELLED"];
    const status = statuses[i % statuses.length];
    
    await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: appointmentDate,
        time: timeSlots[i % timeSlots.length],
        status: status,
        type: appointmentTypes[i % appointmentTypes.length],
        reason: appointmentReasons[i % appointmentReasons.length],
        note: i % 3 === 0 ? faker.lorem.sentence() : null,
      },
    });
  }
  
  console.log(`✅ Created 30 random appointments for other doctors`);

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 TEST CREDENTIALS:");
  console.log("====================");
  console.log("\n👨‍⚕️ DOCTOR ACCOUNTS:");
  console.log("Email: ~ to doctor10@hospital.com");
  console.log("Password: Doctor@123");
  console.log("\n👤 PATIENT ACCOUNTS:");
  console.log("Email: patient1@email.com to patient20@email.com");
  console.log("Password: Patient@123");
  
  console.log("\n📅 TEST APPOINTMENTS:");
  console.log("====================");
  console.log("\n🩺 Doctor 2 (doctor2@hospital.com):");
  console.log("  • Today: 3 scheduled, 1 pending, 1 completed");
  console.log("  • Tomorrow: 2 scheduled");
  console.log("  • Yesterday: 2 completed");
  console.log("  • Next week: 3 scheduled");
  console.log("  Total: 11 appointments");
  
  console.log("\n🩺 Doctor 3 (doctor3@hospital.com):");
  console.log("  • Today: 2 scheduled, 1 pending, 1 completed");
  console.log("  • Tomorrow: 2 scheduled");
  console.log("  Total: 6 appointments");
  
  console.log("\n💡 TIPS:");
  console.log("  • Login as doctor2 or doctor3 to see rich appointment data");
  console.log("  • Appointments include realistic types, reasons, and notes");
  console.log("  • Mix of PENDING, SCHEDULED, and COMPLETED for testing");
  console.log("  • Some doctors are BUSY to test availability filtering");
  console.log("  • Tap SCHEDULED appointments to test clinical tools\n");
  
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
