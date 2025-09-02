import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { WardSchema } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id');
    const status = searchParams.get('status');

    let whereClause = {};
    
    if (departmentId && departmentId !== 'all') {
      whereClause = { ...whereClause, department_id: departmentId };
    }
    
    if (status && status !== 'all') {
      whereClause = { ...whereClause, status };
    }

    const wards = await db.ward.findMany({
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
      wards,
      total: wards.length
    });

  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch wards',
        message: 'Unable to retrieve ward information at this time'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, department_id, floor, wing, capacity, ward_type, status } = body;

    // Validate required fields
    if (!name || !department_id || !capacity || !ward_type || !status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Ward name, department, capacity, type, and status are required'
        },
        { status: 400 }
      );
    }

    // Check if department exists
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

    // Create new ward
    const newWard = await db.ward.create({
      data: {
        name,
        department_id,
        floor: floor || null,
        wing: wing || null,
        capacity: parseInt(capacity),
        current_occupancy: 0,
        ward_type,
        status
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
      ward: newWard,
      message: 'Ward created successfully'
    });

  } catch (error) {
    console.error('Error creating ward:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create ward',
        message: 'Unable to create ward at this time'
      },
      { status: 500 }
    );
  }
}
