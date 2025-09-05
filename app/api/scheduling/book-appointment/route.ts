import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { EnterpriseSchedulingService } from '@/lib/enterprise-scheduling-service';
import { AppointmentSchema } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      patient_id,
      doctor_id,
      appointment_date,
      time,
      type,
      note,
      service_id,
      booking_source,
      confirmation_required
    } = body;

    // Validate appointment data using existing schema
    const validatedData = AppointmentSchema.safeParse({
      doctor_id,
      type,
      appointment_date,
      time,
      note
    });

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid appointment data', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    // Use patient_id from auth if not provided (for patients booking their own appointments)
    const finalPatientId = patient_id || userId;

    const bookingResult = await EnterpriseSchedulingService.bookAppointment({
      patient_id: finalPatientId,
      doctor_id,
      appointment_date: new Date(appointment_date),
      time,
      type,
      note,
      service_id,
      booking_source: booking_source || 'WEB',
      confirmation_required
    });

    if (!bookingResult.success) {
      return NextResponse.json(
        { 
          error: bookingResult.error || 'Failed to book appointment',
          conflicts: bookingResult.conflicts
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: bookingResult.appointment,
      message: 'Appointment booked successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}

