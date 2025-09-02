import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let whereClause = {};
    
    if (status && status !== 'all') {
      whereClause = { status };
    }

    const departments = await db.department.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        location: true,
        status: true,
        capacity: true,
        current_load: true,
        created_at: true
      }
    });

    return NextResponse.json({
      success: true,
      departments,
      total: departments.length
    });

  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch departments',
        message: 'Unable to retrieve department information at this time'
      },
      { status: 500 }
    );
  }
}
