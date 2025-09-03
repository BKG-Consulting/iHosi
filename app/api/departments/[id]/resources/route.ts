import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/permission-guards";
import { PHIEncryption } from "@/lib/encryption";
import { decryptStaffData, decryptDoctorData } from "@/lib/data-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permissions
    await requirePermission('DEPARTMENT_READ', '/unauthorized');
    
    const departmentId = params.id;

    // Get department with all resources
    const department = await (db as any).department.findUnique({
      where: { id: departmentId },
      include: {
        wards: {
          include: {
            beds: {
              include: {
                patient: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true
                  }
                }
              }
            }
          }
        },
        equipment: true,
        doctors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            availability_status: true,
            phone: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
            status: true,
            phone: true
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Department not found',
          message: 'The requested department does not exist'
        },
        { status: 404 }
      );
    }

    // Format beds data
    const beds = department.wards.flatMap((ward: any) => 
      ward.beds.map((bed: any) => ({
        id: bed.id,
        bedNumber: bed.bed_number,
        wardName: ward.name,
        status: bed.status,
        patientName: bed.patient ? `${bed.patient.first_name} ${bed.patient.last_name}` : undefined,
        admissionDate: bed.patient ? bed.created_at : undefined,
        infectionStatus: bed.infection_status || 'CLEAN',
        lastCleaned: bed.last_cleaned
      }))
    );

    // Format equipment data
    const equipment = department.equipment.map((item: any) => ({
      id: item.id,
      name: item.name,
      model: item.model || 'N/A',
      serialNumber: item.serial_number,
      status: item.status,
      location: item.ward_id ? 
        department.wards.find((w: any) => w.id === item.ward_id)?.name || 'Unknown Ward' :
        department.name,
      lastMaintenance: item.last_maintenance,
      nextMaintenance: item.next_maintenance,
      warrantyExpiry: item.warranty_expiry
    }));

    // Format staff data with decryption
    const decryptedDoctors = decryptDoctorData(department.doctors);
    const decryptedStaff = decryptStaffData(department.staff);
    
    const staff = [
      ...decryptedDoctors.map((doctor: any) => ({
        id: doctor.id,
        name: doctor.name,
        role: doctor.specialization,
        status: doctor.availability_status,
        currentPatient: undefined, // Would need to query current appointments
        shift: 'DAY', // Would need to implement shift tracking
        phone: doctor.phone,
        location: department.name
      })),
      ...decryptedStaff.map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        status: member.status === 'ACTIVE' ? 'AVAILABLE' : 'UNAVAILABLE',
        currentPatient: undefined,
        shift: 'DAY',
        phone: member.phone,
        location: department.name
      }))
    ];

    const resources = {
      beds,
      equipment,
      staff
    };

    return NextResponse.json({
      success: true,
      resources
    });

  } catch (error) {
    console.error('Error fetching department resources:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch resources',
        message: 'Unable to retrieve department resources at this time'
      },
      { status: 500 }
    );
  }
}
