import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { DoctorSchema } from "@/lib/schema";
import { PHIEncryption } from "@/lib/encryption";

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
    const decryptedDoctors = doctors.map(doctor => PHIEncryption.decryptDoctorData(doctor));

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

    // Create new doctor
    const newDoctor = await db.doctor.create({
      data: {
        ...encryptedData,
        type,
        department_id: department_id || null,
        experience_years: experience_years || 0,
        consultation_fee: consultation_fee || 0,
        max_patients_per_day: max_patients_per_day || 20,
        preferred_appointment_duration: preferred_appointment_duration || 30,
        password: password || null,
      }
    });

    return NextResponse.json({
      success: true,
      doctor: newDoctor,
      message: 'Doctor created successfully'
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
