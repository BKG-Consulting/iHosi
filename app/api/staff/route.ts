import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { StaffSchema } from "@/lib/schema";
import { PHIEncryption } from "@/lib/encryption";
import { decryptStaffData } from "@/lib/data-utils";
import { clerkClient } from "@clerk/nextjs/server";
import { EmailService } from "@/lib/email-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id');
    const role = searchParams.get('role');

    let whereClause = {};
    
    if (departmentId && departmentId !== 'all') {
      whereClause = { ...whereClause, department_id: departmentId };
    }
    
    if (role && role !== 'all') {
      whereClause = { ...whereClause, role };
    }

    const staff = await db.staff.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Decrypt staff data before returning
    const decryptedStaff = decryptStaffData(staff);

    return NextResponse.json({
      success: true,
      staff: decryptedStaff,
      total: decryptedStaff.length
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch staff',
        message: 'Unable to retrieve staff information at this time'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, email, phone, address, license_number, department_id, password } = body;

    // Validate required fields
    if (!name || !role || !email || !phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Staff name, role, email, and phone are required'
        },
        { status: 400 }
      );
    }

    // Check if department exists
    if (department_id) {
      const department = await db.department.findUnique({
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

    // Test database connectivity
    try {
      const testQuery = await db.staff.count();
      console.log('Database connectivity test successful, current staff count:', testQuery);
    } catch (dbError) {
      console.error('Database connectivity test failed:', dbError);
      throw new Error('Database connection failed');
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
      console.log('Using existing Clerk user for staff creation');
      
      // Update the existing user's metadata if needed
      try {
        await client.users.updateUser(existingClerkUser.id, {
          publicMetadata: { 
            role: role.toLowerCase(),
            department_id: department_id,
            user_type: 'staff'
          },
          privateMetadata: {
            department_id: department_id,
            license_number: license_number
          }
        });
        console.log('Updated existing Clerk user metadata');
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
            role: role.toLowerCase(), // Map to lowercase for consistency
            department_id: department_id,
            user_type: 'staff'
          },
          privateMetadata: {
            department_id: department_id,
            license_number: license_number
          }
        });
        console.log('Created new Clerk user for staff');
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
      license_number
    });

    // Use Clerk user ID as the staff ID
    const staffId = clerkUser.id;

    // Check if staff record already exists in database
    const existingStaff = await db.staff.findUnique({
      where: { id: staffId }
    });

    if (existingStaff) {
      console.log('Staff record already exists in database:', {
        id: existingStaff.id,
        role: existingStaff.role,
        department: existingStaff.department
      });
      
      return NextResponse.json({
        success: true,
        staff: existingStaff,
        message: 'Staff member already exists in database'
      });
    }

    // Create new staff member in database
    console.log('Creating staff member in database with data:', {
      id: staffId,
      role,
      department: department_id,
      encryptedDataKeys: Object.keys(encryptedData)
    });

    const newStaff = await db.staff.create({
      data: {
        id: staffId,
        ...encryptedData,
        role,
        department_id: department_id || null, // Use department_id for the foreign key
        // Password is stored in Clerk, not in our database
      }
    });

    console.log('Staff member created successfully in database:', {
      id: newStaff.id,
      role: newStaff.role,
      department: newStaff.department
    });

    // Verify the staff was actually created
    if (!newStaff || !newStaff.id) {
      throw new Error('Staff creation failed - no record returned from database');
    }

    // Double-check by querying the database
    const verifyStaff = await db.staff.findUnique({
      where: { id: staffId }
    });

    if (!verifyStaff) {
      throw new Error('Staff creation verification failed - record not found in database');
    }

    console.log('Staff verification successful:', {
      id: verifyStaff.id,
      role: verifyStaff.role,
      department: verifyStaff.department
    });

    // Send welcome email to the new staff member
    try {
      // Email notification would be sent here using EmailService
      // await EmailService.sendVerificationEmail(email, 'REGISTRATION');
      
      // Get department name for email
      let departmentName = 'General';
      if (department_id) {
        const department = await db.department.findUnique({
          where: { id: department_id },
          select: { name: true }
        });
        departmentName = department?.name || 'General';
      }
      
      const emailSubject = `Welcome to the Healthcare Management System - ${departmentName} Department`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Our Healthcare Team!</h2>
          
          <p>Dear ${name},</p>
          
          <p>Welcome to our Healthcare Management System! Your account has been successfully created.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Your Account Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Role:</strong> ${role.replace('_', ' ')}</li>
              <li><strong>Department:</strong> ${departmentName}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Login URL:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in">Sign In Here</a></li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">🔐 Important Security Information:</h4>
            <p style="margin: 0;">Please change your password on first login for security purposes.</p>
          </div>
          
          <p>If you have any questions or need assistance, please contact your department administrator.</p>
          
          <p>Best regards,<br>
          Healthcare Management System Team</p>
        </div>
      `;
      
      // Note: EmailService.sendEmail is a private method, so we'll use sendVerificationEmail instead
      // await EmailService.sendVerificationEmail(email, 'REGISTRATION');
      console.log(`✅ Welcome email would be sent to new staff member: ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the entire operation if email fails
    }

    return NextResponse.json({
      success: true,
      staff: newStaff,
      message: 'Staff member created successfully'
    });

  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create staff member',
        message: 'Unable to create staff member at this time'
      },
      { status: 500 }
    );
  }
}
