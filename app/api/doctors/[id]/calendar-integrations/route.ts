import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DoctorSchedulingService } from '@/utils/services/doctor-scheduling';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify the doctor is accessing their own data
    if (userId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const integrations = await DoctorSchedulingService.getCalendarIntegrations(id);
    
    return NextResponse.json({
      integrations,
      message: integrations.length === 0 ? 'Calendar integrations not yet implemented' : 'Calendar integrations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching calendar integrations:', error);
    // Return empty array instead of error to prevent UI crashes
    return NextResponse.json({
      integrations: [],
      message: 'Calendar integrations not yet implemented',
      error: 'Feature not available'
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify the doctor is accessing their own data
    if (userId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      provider, 
      provider_calendar_id, 
      calendar_name, 
      access_token, 
      refresh_token, 
      expires_at, 
      sync_direction 
    } = body;

    if (!provider || !provider_calendar_id || !calendar_name || !access_token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const integration = await DoctorSchedulingService.createCalendarIntegration(id, {
      provider,
      provider_calendar_id,
      calendar_name,
      access_token,
      refresh_token,
      expires_at: expires_at ? new Date(expires_at) : undefined,
      sync_direction,
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar integration:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar integration' },
      { status: 500 }
    );
  }
}
