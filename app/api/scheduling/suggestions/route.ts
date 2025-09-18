import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const suggestionsQuerySchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  days: z.string().optional().default('7'), // Number of days to look ahead
});

interface TimeSuggestion {
  date: string;
  time: string;
  available: boolean;
  reason?: string;
  priority: 'high' | 'medium' | 'low';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const days = searchParams.get('days');

    const validationResult = suggestionsQuerySchema.safeParse({ 
      doctorId, 
      date, 
      time, 
      days 
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid query parameters', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { doctorId: validatedDoctorId, date: validatedDate, time: validatedTime, days: validatedDays } = validationResult.data;

    // Get doctor's working schedule
    const workingDays = await db.workingDays.findMany({
      where: {
        doctor_id: validatedDoctorId,
        is_working: true
      }
    });

    if (workingDays.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No working schedule found for this doctor'
      });
    }

    // Generate suggestions
    const suggestions = await generateTimeSuggestions(
      validatedDoctorId,
      validatedDate,
      validatedTime,
      parseInt(validatedDays),
      workingDays
    );

    return NextResponse.json({
      success: true,
      data: suggestions,
      message: `Found ${suggestions.length} alternative time suggestions`
    });

  } catch (error) {
    console.error('Error generating time suggestions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

async function generateTimeSuggestions(
  doctorId: string,
  requestedDate: string,
  requestedTime: string,
  daysToCheck: number,
  workingDays: any[]
): Promise<TimeSuggestion[]> {
  const suggestions: TimeSuggestion[] = [];
  const startDate = new Date(requestedDate);
  
  // Parse requested time
  const [requestedHours, requestedMinutes] = requestedTime.split(':').map(Number);
  const requestedTimeMinutes = requestedHours * 60 + requestedMinutes;

  // Check the same day first (highest priority)
  const sameDaySuggestions = await getSuggestionsForDate(
    doctorId,
    requestedDate,
    requestedTimeMinutes,
    workingDays,
    'high'
  );
  suggestions.push(...sameDaySuggestions);

  // Check next few days
  for (let i = 1; i <= daysToCheck; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dateString = checkDate.toISOString().split('T')[0];
    
    const daySuggestions = await getSuggestionsForDate(
      doctorId,
      dateString,
      requestedTimeMinutes,
      workingDays,
      i <= 2 ? 'high' : i <= 5 ? 'medium' : 'low'
    );
    suggestions.push(...daySuggestions);
  }

  // Sort by priority and time proximity
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

async function getSuggestionsForDate(
  doctorId: string,
  date: string,
  requestedTimeMinutes: number,
  workingDays: any[],
  priority: 'high' | 'medium' | 'low'
): Promise<TimeSuggestion[]> {
  const suggestions: TimeSuggestion[] = [];
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Find working day for this date
  const workingDay = workingDays.find(day => 
    day.day_of_week.toLowerCase() === dayOfWeek.toLowerCase()
  );

  if (!workingDay) {
    return suggestions; // Doctor doesn't work this day
  }

  // Get existing appointments for this date
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await db.appointment.findMany({
    where: {
      doctor_id: doctorId,
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

  // Generate time slots around the requested time
  const [workStartHours, workStartMinutes] = workingDay.start_time.split(':').map(Number);
  const [workEndHours, workEndMinutes] = workingDay.end_time.split(':').map(Number);
  const [breakStartHours, breakStartMinutes] = workingDay.break_start_time?.split(':').map(Number) || [0, 0];
  const [breakEndHours, breakEndMinutes] = workingDay.break_end_time?.split(':').map(Number) || [0, 0];
  
  const workStartTime = workStartHours * 60 + workStartMinutes;
  const workEndTime = workEndHours * 60 + workEndMinutes;
  const breakStartTime = workingDay.break_start_time ? breakStartHours * 60 + breakStartMinutes : 0;
  const breakEndTime = workingDay.break_end_time ? breakEndHours * 60 + breakEndMinutes : 0;
  
  const slotDuration = (workingDay.appointment_duration || 30) + (workingDay.buffer_time || 5);

  // Generate slots around the requested time (±2 hours)
  const timeRange = 120; // 2 hours in minutes
  const startTime = Math.max(workStartTime, requestedTimeMinutes - timeRange);
  const endTime = Math.min(workEndTime, requestedTimeMinutes + timeRange);

  for (let currentTime = startTime; currentTime + slotDuration <= endTime; currentTime += 15) { // 15-minute intervals
    const slotHour = Math.floor(currentTime / 60);
    const slotMinute = currentTime % 60;
    const timeString = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
    
    // Check if slot is during break time
    const isDuringBreak = workingDay.break_start_time && workingDay.break_end_time && 
      currentTime >= breakStartTime && currentTime < breakEndTime;
    
    // Check if slot is already booked
    const isBooked = existingAppointments.some(apt => apt.time === timeString);
    
    // Check if slot allows for complete appointment duration
    const hasEnoughTime = currentTime + slotDuration <= workEndTime;
    
    if (!isDuringBreak && !isBooked && hasEnoughTime) {
      const timeDiff = Math.abs(currentTime - requestedTimeMinutes);
      const reason = timeDiff === 0 ? 'Exact time requested' :
                   timeDiff <= 15 ? 'Very close to requested time' :
                   timeDiff <= 30 ? 'Close to requested time' :
                   'Alternative time slot';
      
      suggestions.push({
        date,
        time: timeString,
        available: true,
        reason,
        priority
      });
    }
  }

  return suggestions.slice(0, 10); // Limit to 10 suggestions per day
}
