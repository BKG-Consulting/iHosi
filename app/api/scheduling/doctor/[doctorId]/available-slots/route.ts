import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { EnterpriseSchedulingService } from '@/lib/enterprise-scheduling-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '30');

    if (!date) {
      return NextResponse.json(
        { error: 'date parameter is required' },
        { status: 400 }
      );
    }

    // Allow patients to check availability for any doctor
    const timeSlots = await EnterpriseSchedulingService.getAvailableTimeSlots(
      doctorId,
      new Date(date),
      duration
    );

    // Format time slots for frontend
    const formattedSlots = timeSlots.map(slot => ({
      id: slot.id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      duration: slot.duration_minutes,
      isEmergencyOnly: slot.is_emergency_only,
      requiresApproval: slot.requires_approval,
      maxDuration: slot.max_duration
    }));

    return NextResponse.json({ 
      slots: formattedSlots,
      date: date,
      doctorId: doctorId
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

