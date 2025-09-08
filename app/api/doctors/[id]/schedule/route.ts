import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth-helpers';

// Schema for schedule validation
const WorkingHoursSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  isWorking: z.boolean(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  maxAppointments: z.number().min(1).max(50).optional(),
});

const ScheduleSchema = z.object({
  workingHours: z.array(WorkingHoursSchema),
  appointmentDuration: z.number().min(15).max(240), // 15 minutes to 4 hours
  bufferTime: z.number().min(0).max(60), // 0 to 60 minutes
  templates: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    workingHours: z.array(WorkingHoursSchema),
    appointmentDuration: z.number().min(15).max(240),
    bufferTime: z.number().min(0).max(60),
    isDefault: z.boolean().optional(),
  })).optional(),
});

// GET - Fetch doctor's schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const doctorId = resolvedParams.id;

    // Verify user authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view this doctor's schedule
    if (user.role?.toLowerCase() !== 'admin' && user.id !== doctorId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Fetch doctor's working days
    const workingDays = await db.workingDays.findMany({
      where: { doctor_id: doctorId },
      orderBy: { day_of_week: 'asc' }
    });

    // Fetch doctor's availability updates
    const availabilityUpdates = await db.availabilityUpdate.findMany({
      where: { doctor_id: doctorId },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    // Fetch leave requests
    const leaveRequests = await db.leaveRequest.findMany({
      where: { doctor_id: doctorId },
      orderBy: { start_date: 'desc' }
    });

    // Transform data to match frontend format
    const workingHours = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ].map(day => {
      const workingDay = workingDays.find(wd => wd.day_of_week === day);
      return {
        day,
        isWorking: workingDay?.is_working || false,
        startTime: workingDay?.start_time || '09:00',
        endTime: workingDay?.end_time || '17:00',
        breakStart: workingDay?.break_start_time || undefined,
        breakEnd: workingDay?.break_end_time || undefined,
        maxAppointments: workingDay?.max_appointments || 20
      };
    });

    const schedule = {
      workingHours,
      appointmentDuration: 30, // Default, could be stored in doctor profile
      bufferTime: 5, // Default, could be stored in doctor profile
      availabilityUpdates,
      leaveRequests: leaveRequests.map(leave => ({
        id: leave.id.toString(),
        startDate: leave.start_date.toISOString().split('T')[0],
        endDate: leave.end_date.toISOString().split('T')[0],
        reason: leave.reason,
        status: leave.status,
        type: leave.leave_type
      }))
    };

    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'SCHEDULE',
      resourceId: doctorId,
      reason: 'Doctor schedule accessed',
      success: true,
      metadata: {
        userId: user.id,
        userRole: user.role
      }
    });

    return NextResponse.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    
    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'SCHEDULE',
      resourceId: 'unknown',
      reason: 'Failed to fetch doctor schedule',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch schedule'
    }, { status: 500 });
  }
}

// PUT - Update doctor's schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const doctorId = resolvedParams.id;
    const body = await request.json();

    // Verify user authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to update this doctor's schedule
    if (user.role?.toLowerCase() !== 'admin' && user.id !== doctorId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Validate request body
    const validatedData = ScheduleSchema.parse(body);

    // Start transaction
    await db.$transaction(async (tx) => {
      // Update working days
      for (const dayHours of validatedData.workingHours) {
        await tx.workingDays.upsert({
          where: {
            doctor_id_day_of_week: {
              doctor_id: doctorId,
              day_of_week: dayHours.day
            }
          },
          update: {
            is_working: dayHours.isWorking,
            start_time: dayHours.startTime,
            end_time: dayHours.endTime,
            break_start_time: dayHours.breakStart || null,
            break_end_time: dayHours.breakEnd || null,
            max_appointments: dayHours.maxAppointments || 20,
            updated_at: new Date()
          },
          create: {
            doctor_id: doctorId,
            day_of_week: dayHours.day,
            is_working: dayHours.isWorking,
            start_time: dayHours.startTime,
            end_time: dayHours.endTime,
            break_start_time: dayHours.breakStart || null,
            break_end_time: dayHours.breakEnd || null,
            max_appointments: dayHours.maxAppointments || 20,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // Update doctor profile with appointment settings
      await tx.doctor.update({
        where: { id: doctorId },
        data: {
          updated_at: new Date()
          // Could add appointment_duration and buffer_time fields to doctor table
        }
      });
    });

    // Log audit
    await logAudit({
      action: 'UPDATE',
      resourceType: 'SCHEDULE',
      resourceId: doctorId,
      reason: 'Doctor schedule updated',
      success: true,
      metadata: {
        userId: user.id,
        userRole: user.role
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully'
    });

  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid schedule data',
        errors: error.errors
      }, { status: 400 });
    }

    // Log audit
    await logAudit({
      action: 'UPDATE',
      resourceType: 'SCHEDULE',
      resourceId: 'unknown',
      reason: 'Failed to update doctor schedule',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      message: 'Failed to update schedule'
    }, { status: 500 });
  }
}

// POST - Create leave request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const doctorId = resolvedParams.id;
    const body = await request.json();

    // Verify user authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create leave request for this doctor
    if (user.role?.toLowerCase() !== 'admin' && user.id !== doctorId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Validate leave request data
    const LeaveRequestSchema = z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      reason: z.string().min(1).max(500),
      type: z.enum(['VACATION', 'SICK_LEAVE', 'PERSONAL', 'CONFERENCE', 'OTHER'])
    });

    const validatedData = LeaveRequestSchema.parse(body);

    // Check for date conflicts
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (startDate > endDate) {
      return NextResponse.json({
        success: false,
        message: 'Start date cannot be after end date'
      }, { status: 400 });
    }

    // Create leave request
    const leaveRequest = await db.leaveRequest.create({
      data: {
        doctor_id: doctorId,
        start_date: startDate,
        end_date: endDate,
        reason: validatedData.reason,
        leave_type: validatedData.type,
        status: 'PENDING',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Log audit
    await logAudit({
      action: 'CREATE',
      resourceType: 'LEAVE_REQUEST',
      resourceId: leaveRequest.id.toString(),
      reason: 'Leave request created',
      success: true,
      metadata: {
        userId: user.id,
        userRole: user.role
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Leave request created successfully',
      data: {
        id: leaveRequest.id.toString(),
        startDate: leaveRequest.start_date.toISOString().split('T')[0],
        endDate: leaveRequest.end_date.toISOString().split('T')[0],
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        type: leaveRequest.leave_type
      }
    });

  } catch (error) {
    console.error('Error creating leave request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid leave request data',
        errors: error.errors
      }, { status: 400 });
    }

    // Log audit
    await logAudit({
      action: 'CREATE',
      resourceType: 'LEAVE_REQUEST',
      resourceId: 'unknown',
      reason: 'Failed to create leave request',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      message: 'Failed to create leave request'
    }, { status: 500 });
  }
}

