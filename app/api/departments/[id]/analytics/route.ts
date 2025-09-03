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

    // Get department with all related data
    const department = await (db as any).department.findUnique({
      where: { id: departmentId },
      include: {
        doctors: {
          select: {
            id: true,
            availability_status: true
          }
        },
        staff: {
          select: {
            id: true,
            status: true
          }
        },
        wards: {
          include: {
            beds: {
              select: {
                id: true,
                status: true,
                current_patient_id: true
              }
            }
          }
        },
        equipment: {
          select: {
            id: true,
            status: true
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

    // Calculate analytics
    const currentLoad = department.wards.reduce((acc: number, ward: any) => 
      acc + ward.beds.filter((bed: any) => bed.status === 'OCCUPIED').length, 0
    );
    
    const totalBeds = department.wards.reduce((acc: number, ward: any) => 
      acc + ward.beds.length, 0
    );
    
    const utilization = department.capacity > 0 ? Math.round((currentLoad / department.capacity) * 100) : 0;
    
    const availableStaff = department.doctors.filter((doctor: any) => 
      doctor.availability_status === 'AVAILABLE'
    ).length + department.staff.filter((staff: any) => 
      staff.status === 'ACTIVE'
    ).length;
    
    const totalStaff = department.doctors.length + department.staff.length;
    
    const operationalEquipment = department.equipment.filter((eq: any) => 
      eq.status === 'OPERATIONAL'
    ).length;
    
    const totalEquipment = department.equipment.length;

    // Get today's appointments for this department
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await db.appointment.count({
      where: {
        doctor: {
          department_id: departmentId
        },
        appointment_date: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['SCHEDULED', 'PENDING']
        }
      }
    });

    // Get emergency cases (patients with high priority)
    const emergencyCases = await db.patient.count({
      where: {
        beds: {
          some: {
            ward: {
              department_id: departmentId
            }
          }
        }
      }
    });

    // Calculate bed occupancy
    const bedOccupancy = totalBeds > 0 ? Math.round((currentLoad / totalBeds) * 100) : 0;

    // Mock financial data (would come from payment/billing system)
    const todayRevenue = Math.floor(Math.random() * 200000) + 50000; // Mock revenue
    const avgWaitTime = Math.floor(Math.random() * 60) + 15; // Mock wait time
    const patientSatisfaction = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // Mock satisfaction

    const analytics = {
      id: department.id,
      name: department.name,
      currentLoad,
      capacity: department.capacity,
      utilization,
      activeAppointments: todayAppointments,
      emergencyCases,
      availableStaff,
      totalStaff,
      operationalEquipment,
      totalEquipment,
      todayRevenue,
      avgWaitTime,
      patientSatisfaction,
      bedOccupancy,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching department analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        message: 'Unable to retrieve department analytics at this time'
      },
      { status: 500 }
    );
  }
}
