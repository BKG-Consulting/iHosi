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

// Validation schema for department update
const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).max(10).optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  contact_number: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  head_doctor_id: z.string().optional().nullable(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']).optional(),
  current_load: z.number().int().min(0).optional(),
});

// GET - Fetch a single department by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // Get current facility
    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json(
        { error: 'Facility context required. Please access via facility subdomain or ensure your admin account is linked to a facility.' },
        { status: 400 }
      );
    }

    // Fetch department with all related data
    const department = await db.department.findFirst({
      where: {
        id,
        facility_id: facility.id,
      },
      include: {
        doctors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            phone: true,
          },
        },
        wards: {
          select: {
            id: true,
            name: true,
            capacity: true,
            current_occupancy: true,
            status: true,
          },
        },
        _count: {
          select: {
            doctors: true,
            staff: true,
            wards: true,
            equipment: true,
            admissions: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      department,
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}

// PATCH - Update a department
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check if department exists and belongs to facility
    const existingDepartment = await db.department.findFirst({
      where: {
        id,
        facility_id: facility.id,
      },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateDepartmentSchema.parse(body);

    // If updating code, check for duplicates
    if (validatedData.code && validatedData.code !== existingDepartment.code) {
      const duplicate = await db.department.findFirst({
        where: {
          facility_id: facility.id,
          code: validatedData.code,
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Department code already exists in this facility' },
          { status: 400 }
        );
      }
    }

    // Update department
    const department = await db.department.update({
      where: { id },
      data: {
        ...validatedData,
        updated_by: user.id,
        updated_at: new Date(),
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
      message: 'Department updated successfully',
    });
  } catch (error) {
    console.error('Error updating department:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const adminRoles = ['facility_admin', 'super_admin'];
    if (!adminRoles.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions - only facility admins can delete departments' },
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

    // Check if department exists and belongs to facility
    const department = await db.department.findFirst({
      where: {
        id,
        facility_id: facility.id,
      },
      include: {
        _count: {
          select: {
            doctors: true,
            staff: true,
            wards: true,
            admissions: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if department has active dependencies
    const hasActiveDependencies =
      department._count.doctors > 0 ||
      department._count.staff > 0 ||
      department._count.wards > 0 ||
      department._count.admissions > 0;

    if (hasActiveDependencies) {
      return NextResponse.json(
        {
          error: 'Cannot delete department with active dependencies',
          details: {
            doctors: department._count.doctors,
            staff: department._count.staff,
            wards: department._count.wards,
            admissions: department._count.admissions,
          },
        },
        { status: 400 }
      );
    }

    // Delete department
    await db.department.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}

