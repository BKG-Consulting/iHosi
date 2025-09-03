import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get all staff records
    const staff = await db.staff.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get staff count
    const staffCount = await db.staff.count();

    return NextResponse.json({
      success: true,
      staff,
      count: staffCount,
      message: `Found ${staffCount} staff members in database`
    });

  } catch (error) {
    console.error('Error fetching staff debug info:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch staff debug info',
        message: 'Unable to retrieve staff information from database'
      },
      { status: 500 }
    );
  }
}
