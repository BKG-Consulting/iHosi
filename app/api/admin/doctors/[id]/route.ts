import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-helper';
import { getCurrentFacility } from '@/lib/facility-helpers';
import { z } from 'zod';

async function getFacilityContext(userId: string) {
  let facility = await getCurrentFacility();
  if (!facility) {
    const admin = await db.admin.findUnique({
      where: { id: userId },
      include: { facility: true },
    });
    facility = admin?.facility;
  }
  return facility;
}

const updateDoctorSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  specialization: z.string().min(2).optional(),
  consultation_fee: z.number().min(0).optional(),
  department_id: z.string().optional().nullable(),
  office_number: z.string().optional().nullable(),
  employment_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING', 'LOCUM_TENENS']).optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']).optional(),
  accepts_new_patients: z.boolean().optional(),
  online_booking_enabled: z.boolean().optional(),
  is_primary_facility: z.boolean().optional(),
});

// GET - Fetch single doctor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;
    const facility = await getFacilityContext(user.id);
    
    if (!facility) {
      return NextResponse.json({ error: 'Facility context required' }, { status: 400 });
    }

    const doctorFacility = await db.doctorFacility.findFirst({
      where: {
        doctor_id: id,
        facility_id: facility.id,
      },
      include: {
        doctor: {
          include: {
            department_ref: true,
            working_days: {
              take: 7,
            },
            _count: {
              select: {
                appointments: true,
                ratings: true,
              },
            },
          },
        },
        working_days: true,
      },
    });

    if (!doctorFacility) {
      return NextResponse.json({ error: 'Doctor not found at this facility' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      doctor: {
        ...doctorFacility.doctor,
        employment_type: doctorFacility.employment_type,
        facility_status: doctorFacility.status,
        office_number: doctorFacility.office_number,
        is_primary_facility: doctorFacility.is_primary_facility,
        accepts_new_patients: doctorFacility.accepts_new_patients,
        online_booking_enabled: doctorFacility.online_booking_enabled,
        start_date: doctorFacility.start_date,
        end_date: doctorFacility.end_date,
        facility_working_days: doctorFacility.working_days,
      },
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor' }, { status: 500 });
  }
}

// PATCH - Update doctor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;
    const adminRoles = ['facility_admin', 'facility_manager', 'super_admin'];
    if (!adminRoles.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json({ error: 'Facility context required' }, { status: 400 });
    }

    const doctorFacility = await db.doctorFacility.findFirst({
      where: {
        doctor_id: id,
        facility_id: facility.id,
      },
    });

    if (!doctorFacility) {
      return NextResponse.json({ error: 'Doctor not found at this facility' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateDoctorSchema.parse(body);

    // Update doctor record
    const { employment_type, status, department_id, office_number, accepts_new_patients, online_booking_enabled, is_primary_facility, ...doctorUpdates } = validatedData;

    if (Object.keys(doctorUpdates).length > 0) {
      await db.doctor.update({
        where: { id: id },
        data: doctorUpdates,
      });
    }

    // Update facility-doctor relationship
    const facilityUpdates: any = {};
    if (employment_type) facilityUpdates.employment_type = employment_type;
    if (status) facilityUpdates.status = status;
    if (department_id !== undefined) facilityUpdates.department_id = department_id;
    if (office_number !== undefined) facilityUpdates.office_number = office_number;
    if (accepts_new_patients !== undefined) facilityUpdates.accepts_new_patients = accepts_new_patients;
    if (online_booking_enabled !== undefined) facilityUpdates.online_booking_enabled = online_booking_enabled;
    if (is_primary_facility !== undefined) facilityUpdates.is_primary_facility = is_primary_facility;

    if (Object.keys(facilityUpdates).length > 0) {
      await db.doctorFacility.update({
        where: { id: doctorFacility.id },
        data: facilityUpdates,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor updated successfully',
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}

// DELETE - Remove doctor from facility
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;
    const adminRoles = ['facility_admin', 'super_admin'];
    if (!adminRoles.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions - only facility admins can remove doctors' },
        { status: 403 }
      );
    }

    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json({ error: 'Facility context required' }, { status: 400 });
    }

    const doctorFacility = await db.doctorFacility.findFirst({
      where: {
        doctor_id: id,
        facility_id: facility.id,
      },
    });

    if (!doctorFacility) {
      return NextResponse.json({ error: 'Doctor not found at this facility' }, { status: 404 });
    }

    // Check for active appointments
    const activeAppointments = await db.appointment.count({
      where: {
        doctor_id: id,
        facility_id: facility.id,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        appointment_date: {
          gte: new Date(),
        },
      },
    });

    if (activeAppointments > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot remove doctor with active future appointments',
          details: { active_appointments: activeAppointments }
        },
        { status: 400 }
      );
    }

    // Remove from facility
    await db.doctorFacility.delete({
      where: { id: doctorFacility.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Doctor removed from facility',
    });
  } catch (error) {
    console.error('Error removing doctor:', error);
    return NextResponse.json({ error: 'Failed to remove doctor' }, { status: 500 });
  }
}


