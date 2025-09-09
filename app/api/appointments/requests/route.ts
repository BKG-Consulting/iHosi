import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctor_id');
    const status = searchParams.get('status') || 'PENDING';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if user has permission to view appointment requests
    if (user.role?.toLowerCase() !== 'admin' && user.id !== doctorId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Build where clause
    const whereClause: any = {};
    
    if (doctorId) {
      whereClause.doctor_id = doctorId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    // Fetch appointment requests
    const appointmentRequests = await db.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            date_of_birth: true,
            gender: true,
            img: true,
            colorCode: true,
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await db.appointment.count({
      where: whereClause
    });

    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'APPOINTMENT',
      resourceId: 'requests',
      reason: 'Appointment requests accessed',
      success: true,
      metadata: {
        userId: user.id,
        userRole: user.role,
        doctorId,
        status,
        count: appointmentRequests.length
      }
    });

    return NextResponse.json({
      success: true,
      data: appointmentRequests,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    
    // Log audit
    await logAudit({
      action: 'READ',
      resourceType: 'APPOINTMENT',
      resourceId: 'requests',
      reason: 'Failed to fetch appointment requests',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch appointment requests'
    }, { status: 500 });
  }
}

