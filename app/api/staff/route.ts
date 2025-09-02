import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { StaffSchema } from "@/lib/schema";
import { PHIEncryption } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id');
    const role = searchParams.get('role');

    let whereClause = {};
    
    if (departmentId && departmentId !== 'all') {
      whereClause = { ...whereClause, department_id };
    }
    
    if (role && role !== 'all') {
      whereClause = { ...whereClause, role };
    }

    const staff = await db.staff.findMany({
      where: whereClause,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      staff,
      total: staff.length
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

    // Encrypt sensitive data
    const encryptedData = PHIEncryption.encryptDoctorData({
      name,
      email,
      phone,
      address,
      license_number
    });

    // Create new staff member
    const newStaff = await db.staff.create({
      data: {
        ...encryptedData,
        role,
        department_id: department_id || null,
        password: password || null,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

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
