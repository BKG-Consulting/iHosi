import { NextRequest, NextResponse } from "next/server";
import { getEquipmentStats } from "@/utils/services/equipment";

export async function GET(request: NextRequest) {
  try {
    const stats = await getEquipmentStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching equipment stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch equipment stats',
        message: 'Unable to retrieve equipment statistics at this time'
      },
      { status: 500 }
    );
  }
}
