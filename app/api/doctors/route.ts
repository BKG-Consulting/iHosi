import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { DoctorSchema } from "@/lib/schema";
import { PHIEncryption } from "@/lib/encryption";
import { decryptDoctorData } from "@/lib/data-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { UserCreationService } from "@/lib/user-creation-service";
import { EmailService } from "@/lib/email-service";

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
      whereClause = { ...whereClause, specialization: specialization };
    }

    const doctors = await db.doctor.findMany({
      where: whereClause,
      include: {
        working_days: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Decrypt sensitive data before returning
    const decryptedDoctors = decryptDoctorData(doctors);

    return NextResponse.json({
      success: true,
      data: decryptedDoctors,
      message: 'Doctors fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: 'Failed to fetch doctors'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

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

    // Strip titles from name (e.g., "Dr. John Doe" -> "John Doe")
    const cleanName = name.replace(/^(Dr\.|Dr|Mr\.|Mr|Ms\.|Ms|Mrs\.|Mrs)\s+/i, '');
    const nameParts = cleanName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create doctor using UserCreationService
    const createResult = await UserCreationService.createDoctor({
      email,
      password: password || 'TempPassword123!',
      firstName,
      lastName,
      role: 'DOCTOR',
      phone,
      address,
      department: department_id,
      license_number,
      specialization,
      experience_years,
      consultation_fee,
      max_patients_per_day,
      emergency_contact,
      emergency_phone,
      qualifications
    });

    if (!createResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: createResult.error || 'Failed to create doctor',
          message: createResult.message || 'Could not create doctor account'
        },
        { status: 400 }
      );
    }

    // Update doctor with additional fields
    await db.doctor.update({
      where: { id: createResult.userId! },
      data: {
        type: type || 'GENERAL',
        preferred_appointment_duration: preferred_appointment_duration || 30,
        availability_status: 'AVAILABLE' as const
      }
    });

    console.log('Doctor created successfully:', {
      id: createResult.userId,
      name,
      email,
      specialization
    });

    // Send welcome email
    try {
      await EmailService.sendSimpleEmail(
        email,
        'Welcome to iHosi Healthcare System',
        `Dear Dr. ${name},\n\nWelcome to iHosi Healthcare System! Your account has been created successfully.\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password || 'TempPassword123!'}\n\nPlease log in and update your password for security.\n\nBest regards,\niHosi Healthcare Team`
      );
      console.log('Welcome email sent to doctor:', email);
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor created successfully',
      data: {
        id: createResult.userId,
        name,
        email,
        specialization,
        department_id
      }
    });

  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        message: 'Failed to create doctor. Please try again.'
      },
      { status: 500 }
    );
  }
}
