"use server";

import db from "@/lib/db";
import { PatientFormSchema } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { UserCreationService } from "@/lib/user-creation-service";
import { PHIEncryption } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";
import { generateRandomColor } from "@/utils";

export async function updatePatient(data: any, pid: string) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: true,
        msg: "Unauthorized",
      };
    }

    const validateData = PatientFormSchema.safeParse(data);

    if (!validateData.success) {
      return {
        success: false,
        error: true,
        msg: "Provide all required fields",
      };
    }

    const patientData = validateData.data;

    // Encrypt PHI data before updating
    const encryptedPatientData = PHIEncryption.encryptPatientData(patientData);

    await db.patient.update({
      data: {
        ...encryptedPatientData,
        updated_at: new Date(),
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
        updateType: 'patient_profile_update',
        updatedBy: user.id
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

    if (pid === "new-patient") {
      console.log("Creating new patient using custom user creation service...");
      
      // Create patient user using our custom service
      const result = await UserCreationService.createPatient({
        email: patientData.email,
        password: patientData.phone, // Using phone as password for now
        firstName: patientData.first_name,
        lastName: patientData.last_name,
        role: 'PATIENT',
        phone: patientData.phone,
        address: patientData.address || '',
      });

      if (!result.success) {
        return {
          success: false,
          error: true,
          msg: result.error || "Failed to create patient user",
        };
      }

      patient_id = result.userId!;
      console.log("Patient user created with ID:", patient_id);
    } else {
      console.log("Updating existing patient...");
      // For existing patients, we just update the database record
    }

    console.log("Encrypting PHI data...");
    const encryptedPatientData = PHIEncryption.encryptPatientData(patientData);
    console.log("PHI data encrypted successfully");

    console.log("Creating/updating patient record in database...");
    if (pid === "new-patient") {
      // Patient user was already created by UserCreationService
      // Use upsert to ensure the record is properly updated
      await db.patient.upsert({
        where: { id: patient_id },
        update: {
          ...encryptedPatientData,
          updated_at: new Date(),
        },
        create: {
          id: patient_id,
          ...encryptedPatientData,
          password: '', // Will be set by UserCreationService
          mfa_enabled: false,
          is_active: true,
          colorCode: generateRandomColor(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    } else {
      // Update existing patient
      await db.patient.update({
        where: { id: pid },
        data: {
          ...encryptedPatientData,
          updated_at: new Date(),
        },
      });
    }
    console.log("Patient record updated successfully");

    // Verify the patient record was created/updated successfully
    const verifyPatient = await db.patient.findUnique({
      where: { id: patient_id },
      select: { id: true, first_name: true, last_name: true }
    });
    console.log("Patient verification result:", verifyPatient);

    if (!verifyPatient) {
      console.error("Patient record verification failed - record not found after creation");
      return {
        success: false,
        error: true,
        msg: "Patient record creation failed - please try again",
      };
    }

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
