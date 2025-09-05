"use server";

import db from "@/lib/db";
import {
  DoctorSchema,
  ServicesSchema,
  StaffSchema,
  WorkingDaysSchema,
} from "@/lib/schema";
import { generateRandomColor } from "@/utils";
import { checkRole } from "@/utils/roles";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createNewStaff(data: any) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const isAdmin = await checkRole("ADMIN");

    if (!isAdmin) {
      return { success: false, msg: "Unauthorized" };
    }

    const values = StaffSchema.safeParse(data);

    if (!values.success) {
      return {
        success: false,
        errors: true,
        message: "Please provide all required info",
      };
    }

    const validatedValues = values.data;

    const client = await clerkClient();

    // Generate username from email
    const username = validatedValues.email.split('@')[0];
    
    const user = await client.users.createUser({
      emailAddress: [validatedValues.email],
      username: username,
      password: validatedValues.password,
      firstName: validatedValues.name.split(" ")[0],
      lastName: validatedValues.name.split(" ")[1] || "User",
      publicMetadata: { role: validatedValues.role.toLowerCase() },
    });

    delete validatedValues["password"];

    const doctor = await db.staff.create({
      data: {
        name: validatedValues.name,
        phone: validatedValues.phone,
        email: validatedValues.email,
        address: validatedValues.address,
        role: validatedValues.role as any,
        license_number: validatedValues.license_number,
        department: validatedValues.department,
        colorCode: generateRandomColor(),
        id: user.id,
        status: "ACTIVE",
      },
    });

    return {
      success: true,
      message: "Doctor added successfully",
      error: false,
    };
  } catch (error) {
    console.log(error);
    return { error: true, success: false, message: "Something went wrong" };
  }
}
export async function createNewDoctor(data: any) {
  console.log("=== SERVER ACTION START ===");
  console.log("createNewDoctor called with data:", data);
  console.log("Data type:", typeof data);
  console.log("Function: createNewDoctor");
  
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const isAdmin = await checkRole("ADMIN");

    if (!isAdmin) {
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

    console.log("Validating work schedule with WorkingDaysSchema...");
    const workingDaysValues = WorkingDaysSchema.safeParse(data?.work_schedule);

    if (!workingDaysValues.success) {
      console.error("Working days validation errors:", workingDaysValues.error.errors);
      return {
        success: false,
        errors: true,
        message: "Please provide valid working schedule",
        validationErrors: workingDaysValues.error.errors,
      };
    }
    
    console.log("Working days validation passed:", workingDaysValues.data);

    const validatedValues = values.data;
    const workingDayData = workingDaysValues.data!;

    // Normalize email first
    const normalizedEmail = validatedValues.email.toLowerCase().trim();
    console.log("Normalized email:", normalizedEmail);
    
    // Check if email already exists in database
    console.log("Checking if email already exists in database...");
    const existingDoctor = await db.doctor.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingDoctor) {
      console.log("Email already exists in database, returning error");
      return {
        success: false,
        message: "A doctor with this email already exists",
      };
    }
    
    // Skip Clerk check for now to isolate the issue
    console.log("Skipping Clerk email check for now...");
    const client = await clerkClient();

    console.log("Email is unique, proceeding with Clerk user creation...");

    console.log("Creating Clerk user...");
    console.log("Email:", validatedValues.email);
    console.log("Password length:", validatedValues.password?.length);
    console.log("Name:", validatedValues.name);
    
    // Better name handling for titles like "Dr"
    let firstName, lastName;
    const nameParts = validatedValues.name.trim().split(" ");
    
    if (nameParts.length === 1) {
      // Only one name provided
      firstName = nameParts[0];
      lastName = "User"; // Default last name
    } else if (nameParts.length === 2) {
      // Two names provided
      firstName = nameParts[0];
      lastName = nameParts[1];
    } else {
      // Multiple names - first is first name, rest is last name
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    }
    
    // Remove common titles from first name
    if (firstName.toLowerCase().startsWith('dr') || 
        firstName.toLowerCase().startsWith('prof') ||
        firstName.toLowerCase().startsWith('mr') ||
        firstName.toLowerCase().startsWith('ms') ||
        firstName.toLowerCase().startsWith('mrs')) {
      console.log("Title detected, adjusting names...");
      firstName = nameParts[1] || "User";
      lastName = nameParts.slice(2).join(" ") || "User";
      console.log("Adjusted first name:", firstName);
      console.log("Adjusted last name:", lastName);
    }
    
    console.log("First name:", firstName);
    console.log("Last name:", lastName);
    
    // Validate required fields for Clerk
    if (!firstName || firstName.length < 1) {
      console.error("Invalid first name for Clerk");
      return {
        success: false,
        message: "First name is required and must be at least 1 character"
      };
    }
    
    if (!lastName || lastName.length < 1) {
      console.error("Invalid last name for Clerk");
      return {
        success: false,
        message: "Last name is required and must be at least 1 character"
      };
    }
    
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      console.error("Invalid email format for Clerk");
      return {
        success: false,
        message: "Please provide a valid email address"
      };
    }
    
    if (!validatedValues.password || validatedValues.password.length < 8) {
      console.error("Invalid password for Clerk");
      return {
        success: false,
        message: "Password must be at least 8 characters long"
      };
    }
    
    // Generate username from email (remove @domain part)
    const username = normalizedEmail.split('@')[0];
    console.log("Generated username:", username);
    
    // Prepare Clerk user data
    const clerkUserData = {
      emailAddress: [normalizedEmail],
      username: username,
      password: validatedValues.password,
      firstName: firstName,
      lastName: lastName,
      publicMetadata: { role: "doctor" },
    };
    
    console.log("Clerk user data:", JSON.stringify(clerkUserData, null, 2));
    
    console.log("About to call Clerk createUser...");
    const user = await client.users.createUser(clerkUserData);
    console.log("Clerk user created successfully:", user.id);

    delete validatedValues["password"];

    console.log("Creating doctor record in database...");
    const doctor = await db.doctor.create({
      data: {
        ...validatedValues,
        email: normalizedEmail, // Use normalized email
        id: user.id,
        colorCode: generateRandomColor(),
      },
    });
    console.log("Doctor record created successfully:", doctor.id);

    // Create working days if provided
    if (workingDayData && workingDayData.length > 0) {
      console.log("Creating working days records...");
      await Promise.all(
        workingDayData.map((el) => {
          // Remove appointment_duration field as it's not in the database schema
          const { appointment_duration, ...workingDayDataWithoutDuration } = el;
          console.log("Working day data (without appointment_duration):", workingDayDataWithoutDuration);
          
          return db.workingDays.create({
            data: { ...workingDayDataWithoutDuration, doctor_id: doctor.id },
          });
        })
      );
      console.log("Working days records created successfully");
    }

    console.log("=== SUCCESS: Doctor creation completed ===");
    return {
      success: true,
      message: "Doctor added successfully",
      error: false,
    };
  } catch (error) {
    console.error("=== ERROR IN createNewDoctor ===");
    console.error("Error details:", error);
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Handle Clerk-specific errors
    if (error && typeof error === 'object' && 'clerkError' in error) {
      console.error("Clerk error detected");
      console.error("Clerk errors array:", (error as any).errors);
      
      // Check for specific Clerk validation errors
      if ((error as any).errors && Array.isArray((error as any).errors)) {
        const clerkErrors = (error as any).errors;
        console.error("Clerk validation errors:", clerkErrors);
        
        // Check for email validation errors
        const emailError = clerkErrors.find((err: any) => 
          err.code === 'form_identifier_exists' || 
          err.message?.toLowerCase().includes('email') ||
          err.message?.toLowerCase().includes('identifier')
        );
        
        if (emailError) {
          console.log("Email already exists in Clerk");
          return { 
            success: false, 
            message: "A doctor with this email already exists in the system" 
          };
        }
        
        // Check for password validation errors
        const passwordError = clerkErrors.find((err: any) => 
          err.message?.toLowerCase().includes('password') ||
          err.code?.toLowerCase().includes('password')
        );
        
        if (passwordError) {
          console.log("Password validation error");
          return { 
            success: false, 
            message: "Password does not meet security requirements. Please use at least 8 characters with a mix of letters, numbers, and symbols." 
          };
        }
        
        // Check for name validation errors
        const nameError = clerkErrors.find((err: any) => 
          err.message?.toLowerCase().includes('name') ||
          err.message?.toLowerCase().includes('first') ||
          err.message?.toLowerCase().includes('last')
        );
        
        if (nameError) {
          console.log("Name validation error");
          return { 
            success: false, 
            message: "Please provide a valid first and last name" 
          };
        }
        
        // Generic Clerk validation error
        console.log("Generic Clerk validation error");
        return { 
          success: false, 
          message: "User creation failed: " + clerkErrors.map((err: any) => err.message).join(", ") 
        };
      }
    }
    
    // Handle specific Clerk errors
    if (error instanceof Error) {
      if (error.message.includes("email")) {
        console.log("Email error detected, returning email exists message");
        return { 
          success: false, 
          message: "A doctor with this email already exists" 
        };
      }
      if (error.message.includes("password")) {
        console.log("Password error detected, returning password requirements message");
        return { 
          success: false, 
          message: "Password does not meet requirements" 
        };
      }
    }
    
    console.log("Returning generic error message");
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
