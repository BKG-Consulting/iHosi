import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';

const slotsQuerySchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().min(1, 'Date is required'),
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    console.log('🔍 AVAILABILITY SLOTS API CALLED');
    console.log('📋 Query params:', { doctorId, date });

    // Validate query parameters
    const validationResult = slotsQuerySchema.safeParse({ doctorId, date });
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { success: false, message: 'Invalid query parameters', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { doctorId: validatedDoctorId, date: validatedDate } = validationResult.data;
    console.log('✅ Validated params:', { validatedDoctorId, validatedDate });

    // Check if doctor exists
    const doctor = await db.doctor.findUnique({
      where: { id: validatedDoctorId }
    });

    console.log('👨‍⚕️ Doctor lookup:', doctor ? { id: doctor.id, name: doctor.name, availability_status: doctor.availability_status } : 'NOT FOUND');

    if (!doctor) {
      console.log('❌ Doctor not found');
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Get doctor's working schedule
    const workingDays = await db.workingDays.findMany({
      where: {
        doctor_id: validatedDoctorId,
        is_working: true
      }
    });

    console.log('📅 Working days found:', workingDays.length);
    console.log('📋 Working days details:', workingDays.map(day => ({
      day: day.day_of_week,
      isWorking: day.is_working,
      startTime: day.start_time,
      endTime: day.end_time,
      breakStart: day.break_start_time,
      breakEnd: day.break_end_time,
      appointmentDuration: day.appointment_duration,
      bufferTime: day.buffer_time
    })));

    if (workingDays.length === 0) {
      console.log('❌ No working schedule found');
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No working schedule found for this doctor'
      });
    }

    // Get the day of week for the requested date
    const appointmentDate = new Date(validatedDate);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    console.log('📅 Requested date analysis:', {
      date: validatedDate,
      dayOfWeek,
      appointmentDate: appointmentDate.toISOString()
    });
    
    // Find working day for the requested date
    const workingDay = workingDays.find(day => 
      day.day_of_week.toLowerCase() === dayOfWeek.toLowerCase()
    );

    console.log('🔍 Working day lookup:', {
      searchingFor: dayOfWeek,
      found: workingDay ? 'YES' : 'NO',
      workingDay: workingDay ? {
        day: workingDay.day_of_week,
        startTime: workingDay.start_time,
        endTime: workingDay.end_time,
        breakStart: workingDay.break_start_time,
        breakEnd: workingDay.break_end_time
      } : null
    });

    if (!workingDay) {
      console.log('❌ Doctor not available on', dayOfWeek);
      return NextResponse.json({
        success: true,
        data: [],
        message: `Doctor is not available on ${dayOfWeek}`
      });
    }

    // Get existing appointments for the date
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await db.appointment.findMany({
      where: {
        doctor_id: validatedDoctorId,
        appointment_date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['PENDING', 'SCHEDULED']
        }
      },
      select: {
        time: true,
        status: true
      }
    });

    console.log('📅 Existing appointments for this date:', {
      count: existingAppointments.length,
      appointments: existingAppointments.map(apt => ({
        time: apt.time,
        status: apt.status
      }))
    });

    // Generate available time slots
    console.log('⏰ Generating time slots...');
    const slots = generateTimeSlots(workingDay, existingAppointments);
    console.log('📊 Generated slots:', slots.length);
    console.log('🕐 Sample slots:', slots.slice(0, 5));

    return NextResponse.json({
      success: true,
      data: slots,
      message: `Found ${slots.length} available time slots for ${dayOfWeek}`
    });

  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch available time slots' },
      { status: 500 }
    );
  }
}

function generateTimeSlots(workingDay: any, existingAppointments: any[]) {
  console.log('🔧 GENERATE TIME SLOTS DEBUG');
  console.log('📋 Working day params:', {
    startTime: workingDay.start_time,
    endTime: workingDay.end_time,
    breakStartTime: workingDay.break_start_time,
    breakEndTime: workingDay.break_end_time,
    appointmentDuration: workingDay.appointment_duration,
    bufferTime: workingDay.buffer_time
  });
  console.log('📅 Existing appointments:', existingAppointments);

  const slots: Array<{ time: string; available: boolean; reason?: string }> = [];
  
  const [startHour, startMinute] = workingDay.start_time.split(':').map(Number);
  const [endHour, endMinute] = workingDay.end_time.split(':').map(Number);
  const [breakStartHour, breakStartMinute] = workingDay.break_start_time?.split(':').map(Number) || [0, 0];
  const [breakEndHour, breakEndMinute] = workingDay.break_end_time?.split(':').map(Number) || [0, 0];
  
  const slotDuration = (workingDay.appointment_duration || 30) + (workingDay.buffer_time || 5);
  
  let currentTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  const breakStartTime = workingDay.break_start_time ? breakStartHour * 60 + breakStartMinute : 0;
  const breakEndTime = workingDay.break_end_time ? breakEndHour * 60 + breakEndMinute : 0;

  console.log('⏰ Time calculations:', {
    startTimeMinutes: currentTime,
    endTimeMinutes: endTime,
    breakStartTimeMinutes: breakStartTime,
    breakEndTimeMinutes: breakEndTime,
    slotDurationMinutes: slotDuration
  });

  let slotCount = 0;
  while (currentTime + slotDuration <= endTime) {
    const slotHour = Math.floor(currentTime / 60);
    const slotMinute = currentTime % 60;
    const timeString = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
    
    // Check if slot conflicts with break time
    const isDuringBreak = workingDay.break_start_time && workingDay.break_end_time && 
      currentTime >= breakStartTime && currentTime < breakEndTime;
    
    // Check if slot is already booked
    const isBooked = existingAppointments.some(apt => apt.time === timeString);
    
    const isAvailable = !isDuringBreak && !isBooked;
    
    if (slotCount < 5) { // Log first 5 slots for debugging
      console.log(`🕐 Slot ${slotCount + 1}:`, {
        time: timeString,
        currentTimeMinutes: currentTime,
        isDuringBreak,
        isBooked,
        isAvailable,
        reason: isDuringBreak ? "Break time" : isBooked ? "Already booked" : undefined
      });
    }
    
    slots.push({
      time: timeString,
      available: isAvailable,
      reason: isDuringBreak ? "Break time" : isBooked ? "Already booked" : undefined
    });
    
    currentTime += slotDuration;
    slotCount++;
  }

  console.log(`📊 Generated ${slots.length} total slots, ${slots.filter(s => s.available).length} available`);
  return slots;
}