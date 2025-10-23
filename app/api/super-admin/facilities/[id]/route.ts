import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-helper';

const updateFacilitySchema = z.object({
  name: z.string().min(1).optional(),
  legal_name: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  accent_color: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  default_open_time: z.string().optional(),
  default_close_time: z.string().optional(),
  max_doctors: z.number().optional(),
  max_patients: z.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify super admin authentication
    const authResult = await verifyAuth();
    
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authResult.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = updateFacilitySchema.parse(body);

    // Update facility
    const facility = await db.facility.update({
      where: { id: id },
      data: {
        ...validated,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      facility,
      message: 'Facility updated successfully',
    });
  } catch (error) {
    console.error('Error updating facility:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update facility' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify super admin authentication
    const authResult = await verifyAuth();
    
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authResult.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    // Soft delete - just set status to INACTIVE
    const facility = await db.facility.update({
      where: { id: id },
      data: {
        status: 'INACTIVE',
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Facility deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: 'Failed to delete facility' },
      { status: 500 }
    );
  }
}

