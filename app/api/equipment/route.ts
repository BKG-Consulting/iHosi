import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { EquipmentSchema } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id');
    const wardId = searchParams.get('ward_id');
    const equipmentType = searchParams.get('equipment_type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let whereClause: any = {};
    
    if (departmentId && departmentId !== 'all') {
      whereClause.department_id = departmentId;
    }
    
    if (wardId && wardId !== 'all') {
      whereClause.ward_id = wardId;
    }
    
    if (equipmentType && equipmentType !== 'all') {
      whereClause.equipment_type = equipmentType;
    }
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { serial_number: { contains: search, mode: "insensitive" } },
        { manufacturer: { contains: search, mode: "insensitive" } }
      ];
    }

    const equipment = await db.equipment.findMany({
      where: whereClause,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      equipment,
      total: equipment.length
    });

  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch equipment',
        message: 'Unable to retrieve equipment information at this time'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      model, 
      serial_number, 
      department_id, 
      ward_id, 
      equipment_type, 
      manufacturer, 
      purchase_date, 
      warranty_expiry, 
      maintenance_cycle 
    } = body;

    // Validate required fields
    if (!name || !serial_number || !equipment_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Equipment name, serial number, and type are required'
        },
        { status: 400 }
      );
    }

    // Check if serial number already exists
    const existingEquipment = await db.equipment.findUnique({
      where: { serial_number }
    });

    if (existingEquipment) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Duplicate serial number',
          message: 'Equipment with this serial number already exists'
        },
        { status: 400 }
      );
    }

    // Validate department exists if provided
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

    // Validate ward exists if provided
    if (ward_id) {
      const ward = await db.ward.findUnique({
        where: { id: ward_id }
      });

      if (!ward) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid ward',
            message: 'The selected ward does not exist'
          },
          { status: 400 }
        );
      }
    }

    // Calculate next maintenance date if maintenance cycle is provided
    let nextMaintenance = null;
    if (maintenance_cycle && maintenance_cycle > 0) {
      nextMaintenance = new Date();
      nextMaintenance.setDate(nextMaintenance.getDate() + maintenance_cycle);
    }

    // Create new equipment
    const newEquipment = await db.equipment.create({
      data: {
        name,
        model,
        serial_number,
        department_id: department_id || null,
        ward_id: ward_id || null,
        equipment_type,
        manufacturer: manufacturer || null,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : null,
        maintenance_cycle: maintenance_cycle || null,
        next_maintenance: nextMaintenance
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      equipment: newEquipment,
      message: 'Equipment created successfully'
    });

  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create equipment',
        message: 'Unable to create equipment at this time'
      },
      { status: 500 }
    );
  }
}
