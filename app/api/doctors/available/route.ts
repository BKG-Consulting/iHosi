import { NextRequest, NextResponse } from 'next/server';
import { getAvailableDoctorsForBooking } from '@/utils/services/doctor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    const result = await getAvailableDoctorsForBooking(date || undefined, time || undefined);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Found ${result.data?.length || 0} available doctors`
    });

  } catch (error) {
    console.error('Error fetching available doctors:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

