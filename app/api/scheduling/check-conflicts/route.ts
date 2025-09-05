import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { EnterpriseSchedulingService } from '@/lib/enterprise-scheduling-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      doctor_id,
      appointment_date,
      time,
      duration_minutes
    } = body;

    if (!doctor_id || !appointment_date || !time) {
      return NextResponse.json(
        { error: 'doctor_id, appointment_date, and time are required' },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(appointment_date);
    const endTime = duration_minutes ? 
      new Date(appointmentDate.getTime() + duration_minutes * 60000) : 
      new Date(appointmentDate.getTime() + 30 * 60000);

    const conflictResult = await EnterpriseSchedulingService.checkSchedulingConflicts(
      doctor_id,
      appointmentDate,
      time,
      endTime
    );

    return NextResponse.json(conflictResult);
  } catch (error) {
    console.error('Error checking scheduling conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to check scheduling conflicts' },
      { status: 500 }
    );
  }
}

