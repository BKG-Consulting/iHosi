import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { WorkingDayConfig, ApiResponse, ScheduleData, } from '@/types/schedule-types';
import { scheduleService } from '@/services/scheduling/schedule-service';
import { errorHandler } from '@/services/scheduling/error-handler';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
}

const workingDaySchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  isWorking: z.boolean(),
  startTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:MM)'),
  breakStart: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:MM)').optional(),
  breakEnd: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:MM)').optional(),
  maxAppointments: z.number().min(1).max(32).default(20),
  appointmentDuration: z.number().min(15).max(480).default(30),
  bufferTime: z.number().min(0).max(60).default(5),
  timezone: z.string().default('UTC')
});

const updateScheduleSchema = z.object({
  workingHours: z.array(workingDaySchema),
  aiOptimization: z.boolean().optional(),
  recurrenceType: z.enum(['WEEKLY', 'DAILY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM']).optional(),
  effectiveFrom: z.string().optional(),
  effectiveUntil: z.string().optional(),
  customPattern: z.string().optional(),
  isTemplate: z.boolean().optional()
});

// GET /api/doctors/[id]/schedule - Get doctor's schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication - check cookies and Authorization header for mobile compatibility
    const oldToken = request.cookies.get('auth-token')?.value;
    const accessToken = request.cookies.get('access-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = bearerToken || accessToken || oldToken;
    
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
    const { id: doctorId } = await params;

    // Use enterprise service to get schedule
    const result = await scheduleService.getDoctorSchedule(doctorId);

    if (!result.success) {
      const error = await errorHandler.handleError(
        new Error(result.error || 'Failed to fetch schedule'),
        { userId: user.id, doctorId, operation: 'getSchedule' }
      );

      const origin = request.headers.get('origin');
      const response = NextResponse.json(
        {
          success: false,
          message: error.userMessage,
          errors: result.errors?.map(e => e.message) || [error.message]
        },
        { status: 500 }
      );
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    const responseData: ApiResponse<ScheduleData> = {
      success: true,
      data: result.data!,
      message: 'Schedule retrieved successfully'
    };

    const origin = request.headers.get('origin');
    const response = NextResponse.json(responseData);
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);

  } catch (error) {
    const handledError = await errorHandler.handleError(
      error as Error,
      { operation: 'getSchedule' }
    );

    const origin = request.headers.get('origin');
    const response = NextResponse.json(
      {
        success: false,
        message: handledError.userMessage,
        errors: [handledError.message]
      },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
  }
}

// PUT /api/doctors/[id]/schedule - Update doctor's schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication - check cookies and Authorization header for mobile compatibility
    const oldToken = request.cookies.get('auth-token')?.value;
    const accessToken = request.cookies.get('access-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = bearerToken || accessToken || oldToken;
    
    if (!token) {
      const origin = request.headers.get('origin');
      const response = NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      const origin = request.headers.get('origin');
      const response = NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    const user = sessionResult.user;
    const { id: doctorId } = await params;
    const body = await request.json();
    
    console.log('🔍 Backend received PUT /schedule:', {
      doctorId,
      bodyKeys: Object.keys(body),
      workingHoursCount: body.workingHours?.length,
      days: body.workingHours?.map((d: any) => d.day),
      uniqueDays: new Set(body.workingHours?.map((d: any) => d.day)).size,
    });
    
    // Validate request
    const validatedData = updateScheduleSchema.parse(body);

    // Convert WorkingDayFormData to WorkingDayConfig format for processing
    const workingDaysConfig: WorkingDayConfig[] = validatedData.workingHours.map(day => ({
      day: day.day,
      isWorking: day.isWorking,
      startTime: day.startTime,
      endTime: day.endTime,
      breakStart: day.breakStart,
      breakEnd: day.breakEnd,
      maxAppointments: day.maxAppointments,
      appointmentDuration: day.appointmentDuration || 30,
      bufferTime: day.bufferTime || 5,
      timezone: day.timezone || 'UTC',
      recurrenceType: validatedData.recurrenceType || 'WEEKLY',
      effectiveFrom: validatedData.effectiveFrom ? new Date(validatedData.effectiveFrom) : undefined,
      effectiveUntil: validatedData.effectiveUntil ? new Date(validatedData.effectiveUntil) : undefined,
      isTemplate: validatedData.isTemplate || false
    }));

    // Convert WorkingDayConfig to Prisma WorkingDay format for database
    const workingDaysForDB = workingDaysConfig.map(day => ({
      doctor_id: doctorId,
      day_of_week: day.day,
      start_time: day.startTime,
      end_time: day.endTime,
      is_working: day.isWorking,
      break_start_time: day.breakStart || null,
      break_end_time: day.breakEnd || null,
      max_appointments: day.maxAppointments,
      appointment_duration: day.appointmentDuration || 30,
      buffer_time: day.bufferTime || 5,
      recurrence_type: day.recurrenceType || 'WEEKLY',
      recurrence_pattern: null,
      effective_from: day.effectiveFrom || null,
      effective_until: day.effectiveUntil || null,
      timezone: day.timezone || 'UTC',
      is_template: day.isTemplate || false
    }));

    console.log('✅ Transformed to DB format (snake_case):', {
      count: workingDaysForDB.length,
      days: workingDaysForDB.map(d => d.day_of_week),
      sample: workingDaysForDB[0],
    });

    // Use enterprise service to update working days (validates internally with dual-format support)
    const result = await scheduleService.updateWorkingDays(
      doctorId,
      workingDaysForDB as any,
      user.id
    );

    // If this is marked as a template, create a template record
    if (validatedData.isTemplate) {
      const templateName = `Schedule Template - ${new Date().toLocaleDateString()}`;
      
      try {
        await db.scheduleTemplates.create({
          data: {
            doctor_id: doctorId,
            name: templateName,
            description: `Template created on ${new Date().toLocaleDateString()}`,
            template_type: validatedData.recurrenceType || 'WEEKLY',
            working_days: workingDaysConfig.map(day => ({
              day: day.day,
              isWorking: day.isWorking,
              startTime: day.startTime,
              endTime: day.endTime,
              breakStart: day.breakStart,
              breakEnd: day.breakEnd,
              maxAppointments: day.maxAppointments,
              appointmentDuration: day.appointmentDuration,
              bufferTime: day.bufferTime,
              timezone: day.timezone
            })),
            recurrence_rules: {
              recurrenceType: validatedData.recurrenceType || 'WEEKLY',
              effectiveFrom: validatedData.effectiveFrom ? validatedData.effectiveFrom : null,
              effectiveUntil: validatedData.effectiveUntil ? validatedData.effectiveUntil : null,
              customPattern: validatedData.customPattern || null
            },
            timezone: workingDaysConfig[0]?.timezone || 'UTC'
          }
        });

        // Log template creation
        await logAudit({
          action: 'CREATE',
          resourceType: 'SCHEDULE',
          resourceId: doctorId,
          reason: `Created schedule template: ${templateName}`,
          metadata: {
            templateName,
            workingDaysCount: workingDaysConfig.length,
            recurrenceType: validatedData.recurrenceType
          }
        }, {
          userId: user.id,
          userRole: user.role,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });

      } catch (templateError) {
        console.error('Error creating template:', templateError);
        console.error('Template creation details:', {
          doctorId,
          templateName,
          workingDaysCount: workingDaysConfig.length,
          recurrenceType: validatedData.recurrenceType
        });
        // Don't fail the main operation if template creation fails
      }
    }

    if (!result.success) {
      // If we have specific validation errors, return them directly
      if (result.errors && result.errors.length > 0) {
        const origin = request.headers.get('origin');
        const response = NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: result.errors.map(e => e.message)
          },
          { status: 400 }
        );
        return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
      }

      // Otherwise, handle as a general error
      const error = await errorHandler.handleError(
        new Error(result.error || 'Failed to update schedule'),
        { userId: user.id, doctorId, operation: 'updateSchedule' }
      );

      const origin = request.headers.get('origin');
      const response = NextResponse.json(
        {
          success: false,
          message: error.userMessage,
          errors: [error.message]
        },
        { status: 500 }
      );
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }

    const responseData: ApiResponse<{ doctorId: string; workingDaysCount: number; aiOptimization: boolean }> = {
      success: true,
      message: 'Schedule updated successfully',
      data: {
        doctorId,
        workingDaysCount: result.data!.updatedCount,
        aiOptimization: validatedData.aiOptimization || false
      }
    };

    const origin = request.headers.get('origin');
    const response = NextResponse.json(responseData);
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    
  } catch (error) {
    const handledError = await errorHandler.handleError(
      error as Error,
      { operation: 'updateSchedule' }
    );

    const origin = request.headers.get('origin');

    if (error instanceof z.ZodError) {
      const response = NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
      return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
    }
    
    const response = NextResponse.json(
      {
        success: false,
        message: handledError.userMessage,
        errors: [handledError.message]
      },
      { status: 500 }
    );
    return SecurityMiddleware.applyAPISecurityHeaders(response, origin || undefined);
  }
}