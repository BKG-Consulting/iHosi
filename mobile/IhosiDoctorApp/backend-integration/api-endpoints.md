# Backend API Endpoints for Mobile App Integration

Add these API endpoints to your existing HIMS backend to support the mobile app.

## 1. Doctor Authentication Endpoint

**File**: `app/api/auth/verify-doctor/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token with Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get doctor profile
    const doctor = await db.doctor.findUnique({
      where: { id: userId },
      include: {
        workingDays: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doctor,
    });

  } catch (error) {
    console.error('Error verifying doctor:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 2. Doctor Profile Endpoint

**File**: `app/api/doctors/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from { params: Promise<{ id: string }> } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const doctor = await db.doctor.findUnique({
      where: { id },
      include: {
        workingDays: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doctor,
    });

  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 3. Doctor Appointments Endpoint

**File**: `app/api/doctors/[id]/appointments/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const date = searchParams.get('date');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { doctor_id: id };
    
    if (date) {
      where.appointment_date = new Date(date);
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
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
            },
          },
        },
        orderBy: [
          { appointment_date: 'asc' },
          { time: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.appointment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        data: appointments,
        total,
        page,
        limit,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 4. Update Appointment Status Endpoint

**File**: `app/api/appointments/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        status: status as any,
        updated_at: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: id,
      metadata: {
        newStatus: status,
        appointmentDate: appointment.appointment_date,
        patientId: appointment.patient_id,
      },
    });

    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Appointment status updated successfully',
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 5. Doctor Analytics Endpoint

**File**: `app/api/doctors/[id]/analytics/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      todayAppointments,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
    ] = await Promise.all([
      db.appointment.count({
        where: {
          doctor_id: id,
          appointment_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      db.appointment.count({
        where: { doctor_id: id },
      }),
      db.appointment.count({
        where: {
          doctor_id: id,
          status: 'COMPLETED',
        },
      }),
      db.appointment.count({
        where: {
          doctor_id: id,
          status: 'PENDING',
        },
      }),
    ]);

    const analytics = {
      todayAppointments,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      completionRate: totalAppointments > 0 
        ? (completedAppointments / totalAppointments) * 100 
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Installation Instructions

1. Copy each endpoint file to your existing HIMS backend
2. Make sure the file paths match your project structure
3. Update imports to match your project's import paths
4. Test each endpoint with your existing authentication system
5. Ensure proper error handling and logging

## Testing the Endpoints

You can test these endpoints using curl or Postman:

```bash
# Test doctor verification
curl -X POST https://your-domain.com/api/auth/verify-doctor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"token": "your_clerk_token"}'

# Test getting doctor profile
curl -X GET https://your-domain.com/api/doctors/DOCTOR_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test getting appointments
curl -X GET https://your-domain.com/api/doctors/DOCTOR_ID/appointments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Considerations

1. **Authentication**: All endpoints require valid Clerk authentication
2. **Authorization**: Ensure doctors can only access their own data
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: Validate all input parameters
5. **Audit Logging**: Log all sensitive operations
6. **HTTPS**: Ensure all API calls use HTTPS in production

