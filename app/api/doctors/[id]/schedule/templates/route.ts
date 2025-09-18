import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication - check both token formats
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

    const { id: doctorId } = await params;
    
    const templates = await db.scheduleTemplates.findMany({
      where: { doctor_id: doctorId },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        templateType: template.template_type,
        isDefault: template.is_default,
        workingDays: template.working_days,
        recurrenceRules: template.recurrence_rules,
        timezone: template.timezone,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching schedule templates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch schedule templates' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await params;
    const body = await request.json();
    
    const template = await db.scheduleTemplates.create({
      data: {
        doctor_id: doctorId,
        name: body.name,
        description: body.description,
        template_type: body.templateType,
        is_default: body.isDefault || false,
        working_days: body.workingDays,
        recurrence_rules: body.recurrenceRules,
        timezone: body.timezone || 'UTC'
      }
    });

    await logAudit({
      action: 'CREATE',
      resourceType: 'SCHEDULE_TEMPLATE',
      resourceId: template.id.toString(),
      reason: 'Created new schedule template',
      metadata: { doctorId, templateType: body.templateType }
    });

    return NextResponse.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating schedule template:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create schedule template' },
      { status: 500 }
    );
  }
}
