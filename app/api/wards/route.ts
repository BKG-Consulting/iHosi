import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id');

    let whereClause: any = {};
    
    if (departmentId && departmentId !== 'all') {
      whereClause.department_id = departmentId;
    }

    const wards = await db.ward.findMany({
      where: whereClause,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, department_id, floor, wing, capacity, ward_type } = body;

    // Validate required fields
    if (!name || !department_id || !capacity || !ward_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Ward name, department, capacity, and type are required'
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
          error: 'Department not found',
          message: 'The specified department does not exist'
        },
        { status: 404 }
      );
    }

    // Create new ward
    const newWard = await db.ward.create({
      data: {
        name,
        department_id,
        floor: floor ? parseInt(floor) : null,
        wing: wing || null,
        capacity: parseInt(capacity),
        ward_type: ward_type as any,
        current_occupancy: 0,
        status: 'ACTIVE' as any
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Log audit trail
    await logAudit({
      action: 'CREATE',
      resourceType: 'WARD',
      resourceId: newWard.id,
      metadata: {
        ward_name: newWard.name,
        department_id: newWard.department_id,
        capacity: newWard.capacity,
        ward_type: newWard.ward_type
      },
    });

    return NextResponse.json({
      success: true,
      ward: newWard,
      message: 'Ward created successfully'
    }, { status: 201 });

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