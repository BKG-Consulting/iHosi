import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth-helper';
import { getCurrentFacility } from '@/lib/facility-helpers';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';

// Helper function to get facility from context or admin record
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

// Validation schema for assigning doctor to facility
const assignDoctorSchema = z.object({
  doctor_id: z.string().optional(), // For existing doctor
  // For new doctor
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  specialization: z.string().min(2).optional(),
  license_number: z.string().min(3).optional(),
  qualifications: z.string().min(5).optional(),
  experience_years: z.number().int().min(0).optional(),
  languages: z.array(z.string()).default(['English']),
  consultation_fee: z.number().min(0).default(100),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  // Facility-specific
  employment_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING', 'LOCUM_TENENS']).default('FULL_TIME'),
  department_id: z.string().optional(),
  office_number: z.string().optional(),
  accepts_new_patients: z.boolean().default(true),
  online_booking_enabled: z.boolean().default(true),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']).default('ACTIVE'),
  is_primary_facility: z.boolean().default(false),
});

// GET - List all doctors at the current facility
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;
    const facility = await getFacilityContext(user.id);
    
    if (!facility) {
      return NextResponse.json(
        { error: 'Facility context required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get('specialization');
    const status = searchParams.get('status');
    const department_id = searchParams.get('department_id');
    const search = searchParams.get('search');

    // Build query for doctors at this facility
    const where: any = {
      facility_id: facility.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (department_id) {
      where.department_id = department_id;
    }

    const doctorFacilities = await db.doctorFacility.findMany({
      where,
      include: {
        doctor: {
          include: {
            department_ref: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            _count: {
              select: {
                appointments: true,
                ratings: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    let doctors = doctorFacilities.map(df => ({
      ...df.doctor,
      doctor_facility_id: df.id,
      employment_type: df.employment_type,
      facility_status: df.status,
      office_number: df.office_number,
      is_primary_facility: df.is_primary_facility,
      accepts_new_patients: df.accepts_new_patients,
      online_booking_enabled: df.online_booking_enabled,
      start_date: df.start_date,
      end_date: df.end_date,
    }));

    // Apply additional filters
    if (specialization && specialization !== 'all') {
      doctors = doctors.filter(d => d.specialization === specialization);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter(d => 
        d.name.toLowerCase().includes(searchLower) ||
        d.email.toLowerCase().includes(searchLower) ||
        d.specialization.toLowerCase().includes(searchLower) ||
        d.license_number.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      doctors,
      total: doctors.length,
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

// POST - Assign doctor to facility (or create new doctor)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user;
    const { id } = await params;

    // Check permissions
    const adminRoles = ['facility_admin', 'facility_manager', 'super_admin'];
    if (!adminRoles.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const facility = await getFacilityContext(user.id);
    if (!facility) {
      return NextResponse.json(
        { error: 'Facility context required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = assignDoctorSchema.parse(body);

    // CASE 1: Assigning existing doctor
    if (validatedData.doctor_id) {
      // Check if doctor exists
      const existingDoctor = await db.doctor.findUnique({
        where: { id: validatedData.doctor_id },
      });

      if (!existingDoctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }

      // Check if already at this facility
      const existingAtFacility = await db.doctorFacility.findFirst({
        where: {
          doctor_id: validatedData.doctor_id,
          facility_id: facility.id,
        },
      });

      if (existingAtFacility) {
        return NextResponse.json(
          { error: 'Doctor already assigned to this facility' },
          { status: 400 }
        );
      }

      // Assign to facility
      const doctorFacility = await db.doctorFacility.create({
        data: {
          doctor_id: validatedData.doctor_id,
          facility_id: facility.id,
          employment_type: validatedData.employment_type,
          department_id: validatedData.department_id,
          office_number: validatedData.office_number,
          accepts_new_patients: validatedData.accepts_new_patients,
          online_booking_enabled: validatedData.online_booking_enabled,
          status: validatedData.status,
          is_primary_facility: validatedData.is_primary_facility,
        },
      });

      return NextResponse.json({
        success: true,
        doctor: existingDoctor,
        doctor_facility: doctorFacility,
        message: 'Doctor assigned to facility successfully',
      }, { status: 201 });
    }

    // CASE 2: Creating new doctor
    if (!validatedData.name || !validatedData.email || !validatedData.phone || 
        !validatedData.specialization || !validatedData.license_number || 
        !validatedData.qualifications || !validatedData.emergency_contact || 
        !validatedData.emergency_phone) {
      return NextResponse.json(
        { error: 'Missing required fields for new doctor creation' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingDoctor = await db.doctor.findUnique({
      where: { email: validatedData.email },
    });

    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor with this email already exists. Use doctor_id to assign them to this facility.' },
        { status: 400 }
      );
    }

    // Create new doctor
    const defaultPassword = 'Doctor123!';
    const hashedPassword = await bcryptjs.hash(defaultPassword, 10);

    const doctor = await db.doctor.create({
      data: {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address || '',
        specialization: validatedData.specialization,
        license_number: validatedData.license_number,
        qualifications: validatedData.qualifications,
        experience_years: validatedData.experience_years || 0,
        languages: validatedData.languages,
        consultation_fee: validatedData.consultation_fee,
        emergency_contact: validatedData.emergency_contact,
        emergency_phone: validatedData.emergency_phone,
        max_patients_per_day: 20,
        preferred_appointment_duration: 30,
        password: hashedPassword,
        availability_status: 'AVAILABLE',
        department_id: validatedData.department_id,
      },
    });

    // Link to facility
    const doctorFacility = await db.doctorFacility.create({
      data: {
        doctor_id: doctor.id,
        facility_id: facility.id,
        employment_type: validatedData.employment_type,
        department_id: validatedData.department_id,
        office_number: validatedData.office_number,
        accepts_new_patients: validatedData.accepts_new_patients,
        online_booking_enabled: validatedData.online_booking_enabled,
        status: validatedData.status,
        is_primary_facility: validatedData.is_primary_facility,
      },
    });

    return NextResponse.json({
      success: true,
      doctor,
      doctor_facility: doctorFacility,
      message: 'Doctor created and assigned to facility successfully',
      default_password: defaultPassword,
    }, { status: 201 });
  } catch (error) {
    console.error('Error assigning/creating doctor:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assign/create doctor' },
      { status: 500 }
    );
  }
}










