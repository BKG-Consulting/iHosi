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

    const schedules = await DoctorSchedulingService.getDoctorSchedules(id);
    
    return NextResponse.json(schedules);
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
    const { name, description, timezone, is_default } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Schedule name is required' },
        { status: 400 }
      );
    }

    const schedule = await DoctorSchedulingService.createSchedule(id, {
      name,
      description,
      timezone,
      is_default,
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

