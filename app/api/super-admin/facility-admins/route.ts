import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-helper';

const createAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  facility_id: z.string().min(1, 'Facility ID is required'),
});

export async function POST(request: NextRequest) {
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
    const validated = createAdminSchema.parse(body);

    // Check if email already exists
    const existing = await db.admin.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An admin with this email already exists' },
        { status: 400 }
      );
    }

    // Verify facility exists
    const facility = await db.facility.findUnique({
      where: { id: validated.facility_id },
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Create admin
    const admin = await db.admin.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        facility_id: validated.facility_id,
        role: 'FACILITY_ADMIN',
        is_super_admin: false,
        status: 'ACTIVE',
        created_by: authResult.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        facility_id: admin.facility_id,
      },
      message: 'Facility admin created successfully',
    });
  } catch (error) {
    console.error('Error creating facility admin:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create facility admin' },
      { status: 500 }
    );
  }
}

