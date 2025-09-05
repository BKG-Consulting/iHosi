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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Verify the doctor is accessing their own data or user is admin
    if (userId !== doctorId) {
      // TODO: Add admin check here
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const schedules = await EnterpriseSchedulingService.getDoctorSchedule(doctorId, start, end);
    
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorId } = await params;
    
    // Verify the doctor is accessing their own data
    if (userId !== doctorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      schedule_type,
      timezone,
      effective_from,
      effective_until,
      auto_accept_bookings,
      require_confirmation,
      max_advance_booking_days,
      min_advance_booking_hours,
      conflict_resolution
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Schedule name is required' },
        { status: 400 }
      );
    }

    const schedule = await EnterpriseSchedulingService.createDoctorSchedule(doctorId, {
      name,
      description,
      schedule_type,
      timezone,
      effective_from: effective_from ? new Date(effective_from) : undefined,
      effective_until: effective_until ? new Date(effective_until) : undefined,
      auto_accept_bookings,
      require_confirmation,
      max_advance_booking_days,
      min_advance_booking_hours,
      conflict_resolution
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

