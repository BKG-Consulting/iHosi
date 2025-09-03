import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { DoctorSchema } from "@/lib/schema";
import { PHIEncryption } from "@/lib/encryption";
import { decryptDoctorData } from "@/lib/data-utils";
import { clerkClient } from "@clerk/nextjs/server";
import { SendGridEmailService } from "@/lib/email-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id');
    const specialization = searchParams.get('specialization');

    let whereClause = {};
    
    if (departmentId && departmentId !== 'all') {
      whereClause = { ...whereClause, department_id: departmentId };
    }
    
    if (specialization && specialization !== 'all') {
      whereClause = { ...whereClause, specialization };
    }

    const doctors = await db.doctor.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Decrypt doctor data
    const decryptedDoctors = decryptDoctorData(doctors);

    return NextResponse.json({
      success: true,
      doctors: decryptedDoctors,
      total: decryptedDoctors.length
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch doctors',
        message: 'Unable to retrieve doctor information at this time'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, email, phone, specialization, address, type, department_id, 
      license_number, emergency_contact, emergency_phone, qualifications, 
      experience_years, consultation_fee, max_patients_per_day, 
      preferred_appointment_duration, password 
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !specialization || !license_number) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Doctor name, email, phone, specialization, and license number are required'
        },
        { status: 400 }
      );
    }

    // Check if department exists
    if (department_id) {
      const department = await (db as any).department.findUnique({
        where: { id: department_id }
      });

      if (!department) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid department',
            message: 'The selected department does not exist'
          },
          { status: 400 }
        );
      }
    }

    // Check if user already exists in Clerk
    const client = await clerkClient();
    let existingClerkUser = null;
    try {
      const existingUser = await client.users.getUserList({
        emailAddress: [email]
      });
      
      if (existingUser.data.length > 0) {
        existingClerkUser = existingUser.data[0];
        console.log('Found existing Clerk user:', {
          id: existingClerkUser.id,
          email: existingClerkUser.emailAddresses[0]?.emailAddress,
          role: existingClerkUser.publicMetadata?.role
        });
      }
    } catch (error) {
      console.log('No existing Clerk user found, will create new one');
    }

    // Create or use existing Clerk user account
    let clerkUser;
    if (existingClerkUser) {
      // Use existing Clerk user
      clerkUser = existingClerkUser;
      console.log('Using existing Clerk user for doctor creation');
      
      // Update the existing user's metadata if needed
      try {
        await client.users.updateUser(existingClerkUser.id, {
          publicMetadata: { 
            role: 'doctor',
            department_id: department_id,
            user_type: 'doctor',
            specialization: specialization
          },
          privateMetadata: {
            department_id: department_id,
            license_number: license_number,
            specialization: specialization
          }
        });
        console.log('Updated existing Clerk user metadata for doctor');
      } catch (updateError) {
        console.warn('Failed to update existing user metadata:', updateError);
        // Continue anyway, the user exists
      }
    } else {
      // Create new Clerk user account
      try {
        // Strip titles from name (e.g., "Dr. John Doe" -> "John Doe")
        const cleanName = name.replace(/^(Dr\.|Dr|Mr\.|Mr|Ms\.|Ms|Mrs\.|Mrs)\s+/i, '');
        const nameParts = cleanName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        clerkUser = await client.users.createUser({
          emailAddress: [email],
          password: password || 'TempPassword123!', // Default password if none provided
          firstName: firstName,
          lastName: lastName,
          username: email.split('@')[0], // Use email prefix as username
          publicMetadata: { 
            role: 'doctor',
            department_id: department_id,
            user_type: 'doctor',
            specialization: specialization
          },
          privateMetadata: {
            department_id: department_id,
            license_number: license_number,
            specialization: specialization
          }
        });
        console.log('Created new Clerk user for doctor');
      } catch (error: any) {
        console.error('Error creating Clerk user:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create user account',
            message: error.errors?.[0]?.message || 'Unable to create user account'
          },
          { status: 400 }
        );
      }
    }

    // Encrypt sensitive data
    const encryptedData = PHIEncryption.encryptDoctorData({
      name,
      email,
      phone,
      address,
      license_number,
      specialization,
      emergency_contact,
      emergency_phone,
      qualifications
    });

    // Use Clerk user ID as the doctor ID
    const doctorId = clerkUser.id;

    // Check if doctor record already exists in database
    const existingDoctor = await db.doctor.findUnique({
      where: { id: doctorId }
    });

    if (existingDoctor) {
      console.log('Doctor record already exists in database:', {
        id: existingDoctor.id,
        specialization: existingDoctor.specialization,
        department_id: existingDoctor.department_id
      });
      
      return NextResponse.json({
        success: true,
        doctor: existingDoctor,
        message: 'Doctor already exists in database'
      });
    }

    // Create new doctor
    const newDoctor = await db.doctor.create({
      data: {
        id: doctorId,
        ...encryptedData,
        type,
        department_id: department_id || null, // Use department_id for the foreign key
        experience_years: experience_years || 0,
        consultation_fee: consultation_fee || 0,
        max_patients_per_day: max_patients_per_day || 20,
        preferred_appointment_duration: preferred_appointment_duration || 30,
        // Remove password field - it doesn't exist in the Doctor model
      }
    });

    // Send welcome email to the new doctor
    try {
      const emailService = new SendGridEmailService();
      
      // Get department name for email
      let departmentName = 'General';
      if (department_id) {
        const department = await (db as any).department.findUnique({
          where: { id: department_id },
          select: { name: true }
        });
        departmentName = department?.name || 'General';
      }
      
      const emailSubject = `Welcome to the Healthcare Management System - ${departmentName} Department`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Our Healthcare Team!</h2>
          
          <p>Dear Dr. ${name},</p>
          
          <p>Welcome to our Healthcare Management System! Your doctor account has been successfully created.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Your Account Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Role:</strong> Doctor</li>
              <li><strong>Specialization:</strong> ${specialization}</li>
              <li><strong>Department:</strong> ${departmentName}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>License Number:</strong> ${license_number}</li>
              <li><strong>Login URL:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in">Sign In Here</a></li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">🔐 Important Security Information:</h4>
            <p style="margin: 0;">Please change your password on first login for security purposes.</p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #065f46; margin-top: 0;">📋 Next Steps:</h4>
            <ul style="margin: 0;">
              <li>Complete your profile setup</li>
              <li>Set your working hours and availability</li>
              <li>Review department protocols and procedures</li>
              <li>Contact your department head for any questions</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact your department administrator.</p>
          
          <p>Best regards,<br>
          Healthcare Management System Team</p>
        </div>
      `;
      
      await emailService.sendEmail(email, emailSubject, emailBody);
      console.log(`✅ Welcome email sent to new doctor: ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the entire operation if email fails
    }

    return NextResponse.json({
      success: true,
      doctor: newDoctor,
      message: 'Doctor created successfully and welcome email sent'
    });

  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create doctor',
        message: 'Unable to create doctor at this time'
      },
      { status: 500 }
    );
  }
}
