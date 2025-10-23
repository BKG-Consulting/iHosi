import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-helper';
import { getCurrentFacility } from '@/lib/facility-helpers';
import { z } from 'zod';

// Helper function to get facility from context or admin record
async function getFacilityContext(userId: string) {
  // Try subdomain context first
  let facility = await getCurrentFacility();
  
  if (!facility) {
    // If no subdomain context, get facility from admin record
    const admin = await db.admin.findUnique({
      where: { id: userId },
      include: {
        facility: true,
      },
    });

    if (admin?.facility) {
      facility = admin.facility;
    }
  }
  
  return facility;
}

// Validation schema for department creation
const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  code: z.string().min(2, 'Department code must be at least 2 characters').max(10, 'Department code must not exceed 10 characters'),
  description: z.string().optional(),
  location: z.string().optional(),
  contact_number: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  head_doctor_id: z.string().optional(),
  capacity: z.number().int().min(1).default(100),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']).default('ACTIVE'),
});

// GET - List all departments for the current facility
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { id } = await params;

    // Get current facility
    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json(
        { error: 'Facility context required. Please access via facility subdomain or ensure your admin account is linked to a facility.' },
        { status: 400 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    const where: any = {
      facility_id: facility.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch departments with related data
    const departments = await db.department.findMany({
      where,
      include: {
        _count: {
          select: {
            doctors: true,
            staff: true,
            wards: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      departments,
      total: departments.length,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST - Create a new department
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { id } = await params;

    // Check if user has admin privileges
    const adminRoles = ['facility_admin', 'facility_manager', 'super_admin'];
    if (!adminRoles.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get current facility
    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json(
        { error: 'Facility context required. Please access via facility subdomain or ensure your admin account is linked to a facility.' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createDepartmentSchema.parse(body);

    // Check if department code already exists in this facility
    const existing = await db.department.findFirst({
      where: {
        facility_id: facility.id,
        code: validatedData.code,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Department code already exists in this facility' },
        { status: 400 }
      );
    }

    // Create department
    const department = await db.department.create({
      data: {
        ...validatedData,
        facility_id: facility.id,
        created_by: user.id,
        updated_by: user.id,
      },
      include: {
        _count: {
          select: {
            doctors: true,
            staff: true,
            wards: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      department,
      message: 'Department created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}

