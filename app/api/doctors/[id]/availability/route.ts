import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { AvailabilityStatus } from '@prisma/client';

// Validation schema
const updateAvailabilitySchema = z.object({
  availability_status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'BUSY', 'ON_BREAK', 'ON_LEAVE', 'EMERGENCY_ONLY']),
  reason: z.string().optional(),
});

// PUT /api/doctors/[id]/availability - Update doctor availability
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = sessionResult.user;
    const resolvedParams = await params;
    const doctorId = resolvedParams.id;
    const body = await request.json();
    
    // Validate request
    const validatedData = updateAvailabilitySchema.parse(body);
    
    // Check if doctor exists
    const existingDoctor = await db.doctor.findUnique({
      where: { id: doctorId },
    });
    
    if (!existingDoctor) {
      return NextResponse.json({
        success: false,
        message: 'Doctor not found',
      }, { status: 404 });
    }
    
    // Update doctor availability
    const updatedDoctor = await db.doctor.update({
      where: { id: doctorId },
      data: {
        availability_status: validatedData.availability_status,
      },
    });
    
    // Create availability update record
    await db.availabilityUpdate.create({
      data: {
        doctor_id: doctorId,
        update_type: 'SCHEDULE_CHANGE',
        effective_date: new Date(),
        reason: validatedData.reason || `Availability changed to ${validatedData.availability_status}`,
        is_temporary: false,
      },
    });
    
    // Log audit
    await logAudit({
      action: 'UPDATE',
      resourceType: 'DOCTOR',
      resourceId: doctorId,
      reason: 'Updated doctor availability status',
      metadata: {
        userId: user.id,
        userRole: user.role,
        doctorId,
        oldStatus: existingDoctor.availability_status,
        newStatus: validatedData.availability_status,
        reason: validatedData.reason,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoctor.id,
        availability_status: updatedDoctor.availability_status,
        updated_at: updatedDoctor.updated_at,
      },
      message: 'Doctor availability updated successfully',
    });
    
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update doctor availability',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}

// GET /api/doctors/[id]/availability - Get doctor availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = sessionResult.user;
    const resolvedParams = await params;
    const doctorId = resolvedParams.id;
    
    // Get doctor availability
    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        availability_status: true,
        working_days: {
          select: {
            day_of_week: true,
            start_time: true,
            end_time: true,
            is_working: true,
          },
        },
        availability_updates: {
          where: {
            effective_date: { lte: new Date() },
            OR: [
              { end_date: { gte: new Date() } },
              { end_date: null },
            ],
          },
          orderBy: { effective_date: 'desc' },
          take: 5,
        },
      },
    });
    
    if (!doctor) {
      return NextResponse.json({
        success: false,
        message: 'Doctor not found',
      }, { status: 404 });
    }
    
    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'DOCTOR',
      resourceId: doctorId,
      reason: 'Retrieved doctor availability',
      metadata: {
        userId: user.id,
        userRole: user.role,
        doctorId,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: doctor.id,
        name: doctor.name,
        availability_status: doctor.availability_status,
        working_days: doctor.working_days,
        recent_updates: doctor.availability_updates,
        is_available: doctor.availability_status === 'AVAILABLE',
      },
    });
    
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch doctor availability',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}
