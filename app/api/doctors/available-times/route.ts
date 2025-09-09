import { NextRequest, NextResponse } from 'next/server';
import { generateTimes } from '@/utils';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const doctorId = searchParams.get('doctorId');

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Date is required' },
        { status: 400 }
      );
    }

    // Get all possible time slots
    const allTimes = generateTimes(8, 17, 30);
    
    if (!doctorId) {
      // If no specific doctor, return all times
      return NextResponse.json({
        success: true,
        data: allTimes,
        message: 'All time slots available'
      });
    }

    // Get doctor's working hours for the selected date
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
      include: {
        working_days: {
          where: {
            day_of_week: {
              equals: dayOfWeek,
              mode: 'insensitive'
            },
            is_working: true
          }
        }
      }
    });

    if (!doctor || !doctor.working_days.length) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Doctor not available on this day'
      });
    }

    const workingDay = doctor.working_days[0];
    const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
    const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);

    // Filter times to only include working hours
    const availableTimes = allTimes.filter(timeSlot => {
      const [timeHours, timeMinutes] = timeSlot.value.split(':').map(Number);
      const timeInMinutes = timeHours * 60 + timeMinutes;
      const workStartInMinutes = workStartHours * 60 + workStartMinutes;
      const workEndInMinutes = workEndHours * 60 + workEndMinutes;

      return timeInMinutes >= workStartInMinutes && timeInMinutes < workEndInMinutes;
    });

    // Check for existing appointments to filter out booked times
    const existingAppointments = await db.appointment.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: {
          gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate()),
          lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1),
        },
        status: { in: ['PENDING', 'SCHEDULED'] }
      },
      select: {
        time: true
      }
    });

    const bookedTimes = existingAppointments.map((apt: { time: string }) => apt.time);
    const finalAvailableTimes = availableTimes.filter(timeSlot => 
      !bookedTimes.includes(timeSlot.value)
    );

    return NextResponse.json({
      success: true,
      data: finalAvailableTimes,
      message: `Found ${finalAvailableTimes.length} available time slots`
    });

  } catch (error) {
    console.error('Error fetching available times:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
