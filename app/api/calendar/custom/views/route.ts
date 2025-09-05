import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CustomCalendarService } from '@/lib/custom-calendar-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';

    const calendarService = new CustomCalendarService(userId, calendarId);
    const views = await calendarService.getCalendarViews();

    return NextResponse.json({ views });
  } catch (error) {
    console.error('Error fetching calendar views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar views' },
      { status: 500 }
    );
  }
}

