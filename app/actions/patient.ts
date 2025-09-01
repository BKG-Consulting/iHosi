"use server";

import db from "@/lib/db";
import { PatientFormSchema } from "@/lib/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { PHIEncryption } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";

export async function updatePatient(data: any, pid: string) {
  try {
    const validateData = PatientFormSchema.safeParse(data);

    if (!validateData.success) {
      return {
        success: false,
        error: true,
        msg: "Provide all required fields",
      };
    }

    const patientData = validateData.data;

    const client = await clerkClient();
    await client.users.updateUser(pid, {
      firstName: patientData.first_name,
      lastName: patientData.last_name,
    });

    // Encrypt PHI data before updating
    const encryptedPatientData = PHIEncryption.encryptPatientData(patientData);

    await db.patient.update({
      data: {
        ...encryptedPatientData,
      },
      where: { id: pid },
    });

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'PATIENT',
      resourceId: pid,
      patientId: pid,
      reason: 'Patient information update',
      phiAccessed: ['personal_info', 'contact_info', 'medical_info'],
      metadata: {
        updateType: 'patient_profile_update'
      }
    });

    return {
      success: true,
      error: false,
      msg: "Patient info updated successfully",
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: true, msg: error?.message };
  }
}

export async function createNewPatient(data: any, pid: string) {
  console.log("=== SERVER ACTION START ===");
  console.log("createNewPatient called with data:", data);
  console.log("Patient ID:", pid);
  console.log("Data type:", typeof data);
  console.log("PID type:", typeof pid);

  // Early return for test calls
  if (data.test) {
    console.log("Test call detected, returning test response");
    return { success: true, error: false, msg: "Test successful" };
  }

  try {
    // Convert ISO string back to Date for validation
    const processedData = {
      ...data,
      date_of_birth: new Date(data.date_of_birth)
    };

    console.log("Processed data:", processedData);
    console.log("About to validate with schema...");

    const validateData = PatientFormSchema.safeParse(processedData);
    
    console.log("Validation result:", validateData);

    if (!validateData.success) {
      console.error("Validation failed:", validateData.error);
      return {
        success: false,
        error: true,
        msg: "Validation failed: " + validateData.error.issues.map(i => i.message).join(", "),
      };
    }

    const patientData = validateData.data;
    let patient_id = pid;

    console.log("Validation passed, patient data:", patientData);

    const client = await clerkClient();
    if (pid === "new-patient") {
      console.log("Creating new Clerk user...");
      const user = await client.users.createUser({
        emailAddress: [patientData.email],
        password: patientData.phone,
        firstName: patientData.first_name,
        lastName: patientData.last_name,
        publicMetadata: { role: "patient" },
      });

      patient_id = user?.id;
      console.log("Clerk user created with ID:", patient_id);
    } else {
      console.log("Updating existing Clerk user...");
      await client.users.updateUser(pid, {
        publicMetadata: { role: "patient" },
      });
    }

    console.log("Encrypting PHI data...");
    const encryptedPatientData = PHIEncryption.encryptPatientData(patientData);
    console.log("PHI data encrypted successfully");

    console.log("Creating patient record in database...");
    await db.patient.create({
      data: {
        ...encryptedPatientData,
        id: patient_id,
      },
    });
    console.log("Patient record created successfully");

    console.log("Logging audit trail...");
    await logAudit({
      action: 'CREATE',
      resourceType: 'PATIENT',
      resourceId: patient_id,
      patientId: patient_id,
      reason: 'Patient registration',
      phiAccessed: ['personal_info', 'contact_info', 'medical_info'],
      metadata: {
        registrationType: 'self_registration'
      }
    });
    console.log("Audit log completed");

    const result = { success: true, error: false, msg: "Patient created successfully" };
    console.log("=== SERVER ACTION SUCCESS ===");
    console.log("Returning result:", result);
    return result;
  } catch (error: any) {
    console.error("=== SERVER ACTION ERROR ===");
    console.error("createNewPatient error:", error);
    console.error("Error stack:", error.stack);
    const errorResult = { success: false, error: true, msg: error?.message || "Unknown error occurred" };
    console.log("Returning error result:", errorResult);
    return errorResult;
  }
}
