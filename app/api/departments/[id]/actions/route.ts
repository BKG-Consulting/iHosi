import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/permission-guards";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permissions
    await requirePermission('DEPARTMENT_WRITE', '/unauthorized');
    
    const departmentId = params.id;
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'assign_bed':
        return await assignBedToPatient(data.bedId, data.patientId);
      
      case 'discharge_patient':
        return await dischargePatient(data.patientId, data.bedId);
      
      case 'update_equipment_status':
        return await updateEquipmentStatus(data.equipmentId, data.status);
      
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action',
            message: 'The requested action is not supported'
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing department action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process action',
        message: 'Unable to process the requested action at this time'
      },
      { status: 500 }
    );
  }
}

async function assignBedToPatient(bedId: string, patientId: string) {
  try {
    // Update bed status and assign patient
    const bed = await (db as any).bed.update({
      where: { id: bedId },
      data: {
        status: 'OCCUPIED',
        current_patient_id: patientId
      }
    });

    // Update ward occupancy
    const ward = await (db as any).ward.findUnique({
      where: { id: bed.ward_id }
    });

    if (ward) {
      await (db as any).ward.update({
        where: { id: ward.id },
        data: {
          current_occupancy: { increment: 1 }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: bed,
      message: 'Bed assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning bed to patient:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to assign bed',
        message: 'Unable to assign bed to patient'
      },
      { status: 500 }
    );
  }
}

async function dischargePatient(patientId: string, bedId: string) {
  try {
    // Update bed status
    const bed = await (db as any).bed.update({
      where: { id: bedId },
      data: {
        status: 'CLEANING',
        current_patient_id: null,
        last_cleaned: new Date()
      }
    });

    // Update ward occupancy
    const ward = await (db as any).ward.findUnique({
      where: { id: bed.ward_id }
    });

    if (ward) {
      await (db as any).ward.update({
        where: { id: ward.id },
        data: {
          current_occupancy: { decrement: 1 }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: bed,
      message: 'Patient discharged successfully'
    });
  } catch (error) {
    console.error('Error discharging patient:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to discharge patient',
        message: 'Unable to discharge patient'
      },
      { status: 500 }
    );
  }
}

async function updateEquipmentStatus(equipmentId: string, status: string) {
  try {
    const equipment = await (db as any).equipment.update({
      where: { id: equipmentId },
      data: {
        status,
        last_maintenance: status === 'MAINTENANCE' ? new Date() : undefined
      }
    });

    return NextResponse.json({
      success: true,
      data: equipment,
      message: 'Equipment status updated successfully'
    });
  } catch (error) {
    console.error('Error updating equipment status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update equipment status',
        message: 'Unable to update equipment status'
      },
      { status: 500 }
    );
  }
}
