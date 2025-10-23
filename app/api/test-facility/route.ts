import { NextResponse } from 'next/server';
import { getAllActiveFacilities } from '@/lib/facility-helpers';

export async function GET() {
  try {
    const facilities = await getAllActiveFacilities();
    
    return NextResponse.json({
      success: true,
      message: 'Multi-facility system is working!',
      count: facilities.length,
      facilities: facilities.map(f => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        url: `http://${f.slug}.localhost:3000`,
        branding: {
          primaryColor: f.primary_color,
          secondaryColor: f.secondary_color,
          accentColor: f.accent_color,
        },
        location: `${f.city}, ${f.state}`,
        status: f.status,
      })),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

