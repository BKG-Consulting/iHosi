import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { logAudit } from '@/lib/audit';

const integrationSchema = z.object({
  provider: z.enum(['GOOGLE', 'OUTLOOK', 'APPLE', 'CUSTOM']),
  provider_id: z.string().min(1, 'Provider ID is required'),
  calendar_id: z.string().min(1, 'Calendar ID is required'),
  sync_enabled: z.boolean().default(true),
  sync_direction: z.enum(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL']).default('BIDIRECTIONAL'),
  credentials: z.any().optional(),
  settings: z.any().optional()
});

// GET /api/doctors/[id]/schedule/integrations - Get doctor's calendar integrations
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

    // Get doctor's calendar integrations
    const integrations = await db.calendarIntegrations.findMany({
      where: { doctor_id: doctorId },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: integrations.map(integration => ({
        id: integration.id,
        provider: integration.provider,
        providerId: integration.provider_id,
        calendarId: integration.calendar_id,
        syncEnabled: integration.sync_enabled,
        syncDirection: integration.sync_direction,
        lastSync: integration.last_sync,
        settings: integration.settings,
        createdAt: integration.created_at,
        updatedAt: integration.updated_at
      }))
    });

  } catch (error) {
    console.error('Error fetching calendar integrations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch calendar integrations',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}

// POST /api/doctors/[id]/schedule/integrations - Create calendar integration
export async function POST(
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

    const user = sessionResult.user;
    const { id: doctorId } = await params;
    const body = await request.json();
    
    // Validate request
    const validatedData = integrationSchema.parse(body);

    // Check if integration already exists
    const existingIntegration = await db.calendarIntegrations.findFirst({
      where: {
        doctor_id: doctorId,
        provider: validatedData.provider,
        calendar_id: validatedData.calendar_id
      }
    });

    if (existingIntegration) {
      return NextResponse.json({
        success: false,
        message: 'Calendar integration already exists for this provider and calendar'
      }, { status: 409 });
    }

    // Create new integration
    const integration = await db.calendarIntegrations.create({
      data: {
        doctor_id: doctorId,
        provider: validatedData.provider,
        provider_id: validatedData.provider_id,
        calendar_id: validatedData.calendar_id,
        sync_enabled: validatedData.sync_enabled,
        sync_direction: validatedData.sync_direction,
        credentials: validatedData.credentials || {},
        settings: validatedData.settings || {}
      }
    });

    // Log audit trail
    await logAudit({
      action: 'CREATE',
      resourceType: 'SCHEDULE',
      resourceId: integration.id.toString(),
      reason: 'Calendar integration created',
      metadata: {
        userId: user.id,
        userRole: user.role,
        provider: validatedData.provider,
        calendarId: validatedData.calendar_id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Calendar integration created successfully',
      data: {
        id: integration.id,
        provider: integration.provider,
        providerId: integration.provider_id,
        calendarId: integration.calendar_id,
        syncEnabled: integration.sync_enabled,
        syncDirection: integration.sync_direction,
        createdAt: integration.created_at
      }
    });
    
  } catch (error) {
    console.error('Error creating calendar integration:', error);
    
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
        message: 'Failed to create calendar integration',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}