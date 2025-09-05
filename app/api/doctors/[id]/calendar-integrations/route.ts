import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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

    // Calendar integrations temporarily disabled
    return NextResponse.json({
      integrations: [],
      message: 'Calendar integrations temporarily disabled'
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

    // Calendar integration creation temporarily disabled
    return NextResponse.json({
      success: false,
      message: 'Calendar integration creation temporarily disabled'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar integration:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar integration' },
      { status: 500 }
    );
  }
}
