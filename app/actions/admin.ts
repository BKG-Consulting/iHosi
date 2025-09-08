"use server";

import db from "@/lib/db";
import {
  DoctorSchema,
  ServicesSchema,
  StaffSchema,
} from "@/lib/schema";
import { generateRandomColor } from "@/utils";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";
import { UserCreationService } from "@/lib/user-creation-service";

export async function createNewStaff(data: any) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return { success: false, message: "Unauthorized" };
    }

    // Validate input data
    const values = StaffSchema.safeParse(data);
    if (!values.success) {
      return {
        success: false,
        errors: true,
        message: "Please provide all required information",
        validationErrors: values.error.errors,
      };
    }

    const validatedValues = values.data;

    // Validate password strength
    if (!validatedValues.password) {
      return {
        success: false,
        message: "Password is required"
      };
    }
    
    const passwordValidation = UserCreationService.validatePassword(validatedValues.password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        message: passwordValidation.message || "Invalid password"
      };
    }

    // Parse name into first and last name
    const nameParts = validatedValues.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "User";

    // Create staff user using our custom service
    const result = await UserCreationService.createStaff({
      email: validatedValues.email,
      password: validatedValues.password,
      firstName,
      lastName,
      role: validatedValues.role,
      phone: validatedValues.phone,
      address: validatedValues.address,
      department: validatedValues.department,
      license_number: validatedValues.license_number,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to create staff member"
      };
    }

    return {
      success: true,
      message: "Staff member added successfully",
      error: false,
    };
  } catch (error) {
    console.error("Error in createNewStaff:", error);
    return { 
      success: false, 
      message: "Something went wrong while creating staff member" 
    };
  }
}
export async function createNewDoctor(data: any) {
  console.log("=== SERVER ACTION START ===");
  console.log("createNewDoctor called with data:", data);
  console.log("Data type:", typeof data);
  console.log("Function: createNewDoctor");
  
  try {
    // Check authentication and admin role
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return { success: false, message: "Unauthorized" };
    }

    console.log("Validating data with DoctorSchema...");
    const values = DoctorSchema.safeParse(data);

    if (!values.success) {
      console.error("DoctorSchema validation failed:", values.error.errors);
      return {
        success: false,
        errors: true,
        message: "Please provide all required information",
        validationErrors: values.error.errors,
      };
    }
    
    console.log("DoctorSchema validation passed:", values.data);

    const validatedValues = values.data;

    // Validate password strength
    if (!validatedValues.password) {
      return {
        success: false,
        message: "Password is required"
      };
    }
    
    const passwordValidation = UserCreationService.validatePassword(validatedValues.password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        message: passwordValidation.message || "Invalid password"
      };
    }

    // Parse name into first and last name
    const nameParts = validatedValues.name.trim().split(" ");
    let firstName, lastName;
    
    if (nameParts.length === 1) {
      firstName = nameParts[0];
      lastName = "User";
    } else if (nameParts.length === 2) {
      firstName = nameParts[0];
      lastName = nameParts[1];
    } else {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    }
    
    // Remove common titles from first name
    if (firstName.toLowerCase().startsWith('dr') || 
        firstName.toLowerCase().startsWith('prof') ||
        firstName.toLowerCase().startsWith('mr') ||
        firstName.toLowerCase().startsWith('ms') ||
        firstName.toLowerCase().startsWith('mrs')) {
      firstName = nameParts[1] || "User";
      lastName = nameParts.slice(2).join(" ") || "User";
    }

    console.log("Creating doctor using custom user creation service...");
    
    // Create doctor user using our custom service
    const result = await UserCreationService.createDoctor({
      email: validatedValues.email,
      password: validatedValues.password,
      firstName,
      lastName,
      role: 'DOCTOR',
      phone: validatedValues.phone,
      address: validatedValues.address,
      specialization: validatedValues.specialization,
      license_number: validatedValues.license_number,
      department: validatedValues.department,
      experience_years: validatedValues.experience_years,
      languages: validatedValues.languages,
      consultation_fee: validatedValues.consultation_fee,
      max_patients_per_day: validatedValues.max_patients_per_day,
      emergency_contact: validatedValues.emergency_contact,
      emergency_phone: validatedValues.emergency_phone,
      qualifications: validatedValues.qualifications,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to create doctor"
      };
    }

    console.log("Doctor user created successfully:", result.userId);
    console.log("Note: Doctor can now set up their own schedule through the dashboard");

    console.log("=== SUCCESS: Doctor creation completed ===");
    return {
      success: true,
      message: "Doctor added successfully. The doctor can now set up their schedule through their dashboard.",
      error: false,
    };
  } catch (error) {
    console.error("=== ERROR IN createNewDoctor ===");
    console.error("Error details:", error);
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return { 
      success: false, 
      message: "Failed to create doctor. Please try again." 
    };
  }
}

export async function addNewService(data: any) {
  try {
    const isValidData = ServicesSchema.safeParse(data);

    const validatedData = isValidData.data;

    await db.services.create({
      data: { ...validatedData!, price: Number(data.price!) },
    });

    return {
      success: true,
      error: false,
      msg: `Service added successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}
