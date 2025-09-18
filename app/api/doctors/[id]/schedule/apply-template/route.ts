import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { logAudit } from '@/lib/audit';

const applyTemplateSchema = z.object({
  templateId: z.number().min(1, 'Template ID is required')
});

// POST /api/doctors/[id]/schedule/apply-template - Apply a template to current schedule
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== APPLY TEMPLATE API CALLED ===');
  try {
    // Verify authentication
    const oldToken = request.cookies.get('auth-token')?.value;
    const accessToken = request.cookies.get('access-token')?.value;
    const token = accessToken || oldToken;
    
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
    const body = await request.json();
    
    console.log('Apply template request:', { doctorId, body });
    
    // Validate request
    const { templateId } = applyTemplateSchema.parse(body);
    console.log('Template ID to apply:', templateId);

    // Get the template
    const template = await db.scheduleTemplates.findUnique({
      where: { 
        id: templateId,
        doctor_id: doctorId 
      }
    });

    console.log('Found template:', template ? { id: template.id, name: template.name } : 'null');

    if (!template) {
      console.log('Template not found for ID:', templateId, 'Doctor:', doctorId);
      return NextResponse.json(
        { success: false, message: 'Template not found' },
        { status: 404 }
      );
    }

    // Parse working days from template
    const templateWorkingDays = Array.isArray(template.working_days) 
      ? template.working_days as any[]
      : [];

    console.log('Template working days:', templateWorkingDays.length, 'days');

    // Clear existing working days for this doctor
    console.log('Clearing existing working days for doctor:', doctorId);
    const deleteResult = await db.workingDays.deleteMany({
      where: { doctor_id: doctorId }
    });
    console.log('Deleted existing working days:', deleteResult.count);

    // Create new working days from template
    const newWorkingDays = templateWorkingDays.map((day: any) => ({
      doctor_id: doctorId,
      day_of_week: day.day,
      is_working: day.isWorking,
      start_time: day.startTime,
      end_time: day.endTime,
      break_start_time: day.breakStart || null,
      break_end_time: day.breakEnd || null,
      max_appointments: day.maxAppointments || 20,
      appointment_duration: day.appointmentDuration || 30,
      buffer_time: day.bufferTime || 5,
      timezone: day.timezone || 'UTC',
      recurrence_type: template.template_type,
      effective_from: null, // Reset effective dates when applying template
      effective_until: null,
      is_template: false // This is now the active schedule, not a template
    }));

    console.log('Creating new working days:', newWorkingDays.length, 'days');
    console.log('Sample working day:', newWorkingDays[0]);

    const createResult = await db.workingDays.createMany({
      data: newWorkingDays
    });
    console.log('Created working days:', createResult.count);

    // Log template application
    await logAudit({
      action: 'UPDATE',
      resourceType: 'SCHEDULE',
      resourceId: doctorId,
      reason: `Applied template: ${template.name}`,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        generatedDays: createResult.count
      }
    }, {
      userId: user.id,
      userRole: user.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" applied successfully`,
      data: {
        templateId: template.id,
        templateName: template.name,
        workingDaysCount: newWorkingDays.length
      }
    });

  } catch (error) {
    console.error('=== APPLY TEMPLATE ERROR ===');
    console.error('Error applying template:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, message: 'Failed to apply template' },
      { status: 500 }
    );
  }
}
