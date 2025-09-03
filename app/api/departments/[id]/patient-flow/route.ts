import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/permission-guards";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permissions
    await requirePermission('DEPARTMENT_READ', '/unauthorized');
    
    const departmentId = params.id;

    // Get patients in this department through bed assignments
    const patients = await db.patient.findMany({
      where: {
        beds: {
          some: {
            ward: {
              department_id: departmentId
            }
          }
        }
      },
      include: {
        beds: {
          include: {
            ward: {
              select: {
                name: true
              }
            }
          }
        },
        appointments: {
          where: {
            status: {
              in: ['SCHEDULED', 'PENDING']
            }
          },
          include: {
            doctor: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            appointment_date: 'desc'
          },
          take: 1
        }
      }
    });

    // Format patient flow data
    const patientFlow = patients.map((patient: any) => {
      const currentBed = patient.beds[0]; // Assuming one bed per patient
      const latestAppointment = patient.appointments[0];
      
      // Determine patient status based on bed and appointment status
      let status = 'ADMITTED';
      if (currentBed?.status === 'OCCUPIED') {
        status = 'ADMITTED';
      } else if (currentBed?.status === 'AVAILABLE') {
        status = 'PENDING_DISCHARGE';
      }

      // Mock priority based on appointment type or other factors
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      // Mock diagnosis (would come from medical records)
      const diagnoses = [
        'Acute Myocardial Infarction',
        'Pneumonia',
        'Trauma - Multiple Injuries',
        'Post-surgical Recovery',
        'Hypertension',
        'Diabetes Management',
        'Respiratory Infection'
      ];
      const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

      return {
        id: patient.id,
        patientName: `${patient.first_name} ${patient.last_name}`,
        patientId: patient.id,
        status,
        admissionDate: currentBed?.created_at || patient.created_at,
        expectedDischarge: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Mock
        currentLocation: currentBed ? `${currentBed.ward.name} - Bed ${currentBed.bed_number}` : 'Emergency Department',
        assignedDoctor: latestAppointment?.doctor?.name || 'Dr. Unassigned',
        priority,
        diagnosis,
        bedNumber: currentBed?.bed_number,
        wardName: currentBed?.ward?.name,
        phone: patient.phone,
        emergencyContact: patient.emergency_contact_number
      };
    });

    return NextResponse.json({
      success: true,
      patients: patientFlow
    });

  } catch (error) {
    console.error('Error fetching patient flow:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch patient flow',
        message: 'Unable to retrieve patient flow data at this time'
      },
      { status: 500 }
    );
  }
}
