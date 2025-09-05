import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { GoogleCalendarService } from '@/lib/google-calendar-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    // Get the appointment with related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Get the doctor's Google Calendar integration
    const integration = await prisma.calendarIntegration.findFirst({
      where: {
        doctor_id: userId,
        provider: 'GOOGLE_CALENDAR',
        is_active: true
      }
    });

    if (!integration) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    // Create Google Calendar service instance
    const calendarService = new GoogleCalendarService(
      integration.access_token,
      integration.refresh_token || undefined
    );

    // Get primary calendar ID
    const calendarId = await calendarService.getPrimaryCalendarId();

    // Sync appointment to calendar
    const calendarEvent = await calendarService.syncAppointmentToCalendar(calendarId, {
      id: appointment.id,
      patient: {
        first_name: appointment.patient.first_name,
        last_name: appointment.patient.last_name,
        email: appointment.patient.email
      },
      doctor: {
        name: appointment.doctor.name,
        email: appointment.doctor.email
      },
      appointment_date: appointment.appointment_date,
      time: appointment.time,
      type: appointment.type,
      note: appointment.note || undefined
    });

    // Update appointment with calendar event ID
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        calendar_event_id: calendarEvent.id,
        calendar_synced_at: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      calendarEventId: calendarEvent.id,
      message: 'Appointment synced to Google Calendar successfully'
    });

  } catch (error) {
    console.error('Error syncing appointment to calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync appointment to calendar' },
      { status: 500 }
    );
  }
}

