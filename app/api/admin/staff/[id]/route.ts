import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-helper';
import { getCurrentFacility } from '@/lib/facility-helpers';
import { z } from 'zod';

// Helper function
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

const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  department_id: z.string().optional().nullable(),
  license_number: z.string().optional().nullable(),
  employment_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']).optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']).optional(),
});

// GET - Fetch single staff member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;
    const facility = await getFacilityContext(user.id);
    
    if (!facility) {
      return NextResponse.json({ error: 'Facility context required' }, { status: 400 });
    }

    const staffFacility = await db.staffFacility.findFirst({
      where: {
        staff_id: id,
        facility_id: facility.id,
      },
      include: {
        staff: {
          include: {
            department_ref: true,
          },
        },
      },
    });

    if (!staffFacility) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      staff: {
        ...staffFacility.staff,
        employment_type: staffFacility.employment_type,
        facility_status: staffFacility.status,
        start_date: staffFacility.start_date,
        end_date: staffFacility.end_date,
      },
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 });
  }
}

// PATCH - Update staff member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;
    const adminRoles = ['facility_admin', 'facility_manager', 'super_admin'];
    if (!adminRoles.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json({ error: 'Facility context required' }, { status: 400 });
    }

    const staffFacility = await db.staffFacility.findFirst({
      where: {
        staff_id: id,
        facility_id: facility.id,
      },
    });

    if (!staffFacility) {
      return NextResponse.json({ error: 'Staff member not found at this facility' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateStaffSchema.parse(body);

    // Update staff record
    const { employment_type, status, department_id, ...staffUpdates } = validatedData;

    if (Object.keys(staffUpdates).length > 0) {
      await db.staff.update({
        where: { id: id },
        data: staffUpdates,
      });
    }

    // Update facility-staff relationship
    const facilityUpdates: any = {};
    if (employment_type) facilityUpdates.employment_type = employment_type;
    if (status) facilityUpdates.status = status;
    if (department_id !== undefined) facilityUpdates.department_id = department_id;

    if (Object.keys(facilityUpdates).length > 0) {
      await db.staffFacility.update({
        where: { id: staffFacility.id },
        data: facilityUpdates,
      });
    }

    const updatedStaffFacility = await db.staffFacility.findUnique({
      where: { id: staffFacility.id },
      include: {
        staff: {
          include: {
            department_ref: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      staff: updatedStaffFacility?.staff,
      message: 'Staff member updated successfully',
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

// DELETE - Remove staff from facility
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;
    const adminRoles = ['facility_admin', 'super_admin'];
    if (!adminRoles.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions - only facility admins can remove staff' },
        { status: 403 }
      );
    }

    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json({ error: 'Facility context required' }, { status: 400 });
    }

    const staffFacility = await db.staffFacility.findFirst({
      where: {
        staff_id: id,
        facility_id: facility.id,
      },
    });

    if (!staffFacility) {
      return NextResponse.json({ error: 'Staff member not found at this facility' }, { status: 404 });
    }

    // Remove from facility (but don't delete the staff record - they might be at other facilities)
    await db.staffFacility.delete({
      where: { id: staffFacility.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member removed from facility',
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to remove staff member' }, { status: 500 });
  }
}










