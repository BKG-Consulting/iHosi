import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id');

    let whereClause: any = {};
    
    if (departmentId && departmentId !== 'all') {
      whereClause.department_id = departmentId;
    }

    const wards = await db.ward.findMany({
      where: whereClause,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      wards,
      total: wards.length
    });

  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch wards',
        message: 'Unable to retrieve ward information at this time'
      },
      { status: 500 }
    );
  }
}