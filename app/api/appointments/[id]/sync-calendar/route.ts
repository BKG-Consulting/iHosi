import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DoctorSchedulingService } from '@/utils/services/doctor-scheduling';

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
    const body = await request.json();
    const { integration_id, calendar_id } = body;

    if (!integration_id || !calendar_id) {
      return NextResponse.json(
        { error: 'Missing integration_id or calendar_id' },
        { status: 400 }
      );
    }

    // Sync appointment to calendar
    const calendarEvent = await DoctorSchedulingService.syncAppointmentToCalendar(id, calendar_id);
    
    return NextResponse.json({
      success: true,
      calendarEvent,
      message: 'Appointment synced to calendar successfully'
    });
  } catch (error) {
    console.error('Error syncing appointment to calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync appointment to calendar' },
      { status: 500 }
    );
  }
}

