import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-helper';

const createFacilitySchema = z.object({
  name: z.string().min(1, 'Facility name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  legal_name: z.string().min(1, 'Legal name is required'),
  facility_code: z.string().min(1, 'Facility code is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email is required'),
  website: z.string().optional(),
  primary_color: z.string().default('#3b82f6'),
  secondary_color: z.string().default('#8b5cf6'),
  accent_color: z.string().default('#10b981'),
  timezone: z.string().default('America/New_York'),
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
    const validated = createFacilitySchema.parse(body);

    // Check if slug already exists
    const existing = await db.facility.findUnique({
      where: { slug: validated.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A facility with this subdomain already exists' },
        { status: 400 }
      );
    }

    // Create facility
    const facility = await db.facility.create({
      data: {
        ...validated,
        created_by: authResult.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      facility,
      message: 'Facility created successfully',
    });
  } catch (error) {
    console.error('Error creating facility:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create facility' },
      { status: 500 }
    );
  }
}

