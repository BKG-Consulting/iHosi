import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-helper';
import { getCurrentFacility } from '@/lib/facility-helpers';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';

// Helper function to get facility from context or admin record
async function getFacilityContext(userId: string) {
  let facility = await getCurrentFacility();
  
  if (!facility) {
    const admin = await db.admin.findUnique({
      where: { id: userId },
      include: { facility: true },
    });
    facility = admin?.facility;
  }
  
  return facility;
}

// Validation schema for staff creation
const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  role: z.enum(['NURSE', 'LAB_TECHNICIAN', 'CASHIER', 'ADMIN_ASSISTANT']),
  department_id: z.string().optional(),
  license_number: z.string().optional(),
  employment_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']).default('FULL_TIME'),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']).default('ACTIVE'),
});

// GET - List all staff for the current facility
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;
    const facility = await getFacilityContext(user.id);
    
    if (!facility) {
      return NextResponse.json(
        { error: 'Facility context required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const department_id = searchParams.get('department_id');
    const search = searchParams.get('search');

    // Build query for staff at this facility
    const where: any = {};

    // Filter by facility through StaffFacility relation
    const staffFacilities = await db.staffFacility.findMany({
      where: {
        facility_id: facility.id,
        ...(status && status !== 'all' ? { status } : {}),
        ...(department_id ? { department_id } : {}),
      },
      include: {
        staff: {
          include: {
            department_ref: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    let staff = staffFacilities.map(sf => ({
      ...sf.staff,
      staff_facility_id: sf.id,
      employment_type: sf.employment_type,
      facility_status: sf.status,
      start_date: sf.start_date,
      end_date: sf.end_date,
    }));

    // Apply additional filters
    if (role && role !== 'all') {
      staff = staff.filter(s => s.role === role);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      staff = staff.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        s.phone.includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      staff,
      total: staff.length,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;

    // Check permissions
    const adminRoles = ['facility_admin', 'facility_manager', 'super_admin'];
    if (!adminRoles.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json(
        { error: 'Facility context required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    // Check if email already exists
    const existingStaff = await db.staff.findUnique({
      where: { email: validatedData.email },
    });

    if (existingStaff) {
      // Check if already at this facility
      const existingAtFacility = await db.staffFacility.findFirst({
        where: {
          staff_id: existingStaff.id,
          facility_id: facility.id,
        },
      });

      if (existingAtFacility) {
        return NextResponse.json(
          { error: 'Staff member already exists at this facility' },
          { status: 400 }
        );
      }

      // Add existing staff to this facility
      const staffFacility = await db.staffFacility.create({
        data: {
          staff_id: existingStaff.id,
          facility_id: facility.id,
          role: validatedData.role,
          department_id: validatedData.department_id,
          employment_type: validatedData.employment_type,
          status: validatedData.status,
        },
      });

      return NextResponse.json({
        success: true,
        staff: existingStaff,
        staff_facility: staffFacility,
        message: 'Existing staff member added to facility',
      }, { status: 201 });
    }

    // Create new staff member
    const defaultPassword = 'Staff123!'; // Should be changed on first login
    const hashedPassword = await bcryptjs.hash(defaultPassword, 10);

    const staff = await db.staff.create({
      data: {
        id: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        role: validatedData.role,
        department_id: validatedData.department_id,
        license_number: validatedData.license_number,
        password: hashedPassword,
        status: 'ACTIVE',
      },
    });

    // Link to facility
    const staffFacility = await db.staffFacility.create({
      data: {
        staff_id: staff.id,
        facility_id: facility.id,
        role: validatedData.role,
        department_id: validatedData.department_id,
        employment_type: validatedData.employment_type,
        status: validatedData.status,
      },
    });

    return NextResponse.json({
      success: true,
      staff,
      staff_facility: staffFacility,
      message: 'Staff member created successfully',
      default_password: defaultPassword,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}




