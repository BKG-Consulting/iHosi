import db from "@/lib/db";
import { PHIEncryption } from "@/lib/encryption";

export interface DepartmentWithDetails {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  contact_number?: string;
  email?: string;
  head_doctor_id?: string;
  status: string;
  capacity: number;
  current_load: number;
  created_at: Date;
  updated_at: Date;
  head_doctor?: {
    id: string;
    name: string;
    specialization: string;
  };
  wards: Array<{
    id: string;
    name: string;
    capacity: number;
    current_occupancy: number;
    status: string;
  }>;
  staff: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  doctors: Array<{
    id: string;
    name: string;
    specialization: string;
    email: string;
    phone: string;
  }>;
  equipment: Array<{
    id: string;
    name: string;
    status: string;
    equipment_type: string;
  }>;
}

export async function getDepartmentWithDetails(departmentId: string) {
  try {
    const department = await (db as any).department.findUnique({
      where: { id: departmentId },
      include: {
        wards: {
          select: {
            id: true,
            name: true,
            capacity: true,
            current_occupancy: true,
            status: true,
          },
          orderBy: { name: 'asc' },
        },
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            phone: true,
          },
          orderBy: { name: 'asc' },
        },
        doctors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            email: true,
            phone: true,
          },
          orderBy: { name: 'asc' },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            status: true,
            equipment_type: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!department) {
      return {
        success: false,
        message: 'Department not found',
        department: null,
      };
    }

    // Fetch head doctor separately if head_doctor_id exists
    let headDoctor = null;
    if (department.head_doctor_id) {
      try {
        headDoctor = await (db as any).doctor.findUnique({
          where: { id: department.head_doctor_id },
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        });
      } catch (error) {
        console.error('Error fetching head doctor:', error);
        // Continue without head doctor if there's an error
      }
    }

    // Decrypt staff data
    const decryptedStaff = department.staff.map((member: any) => {
      const decryptedData = PHIEncryption.decryptDoctorData(member);
      return {
        id: member.id,
        name: decryptedData.name,
        role: member.role,
        email: decryptedData.email,
        phone: decryptedData.phone,
      };
    });

    // Decrypt doctor data
    const decryptedDoctors = department.doctors.map((doctor: any) => {
      const decryptedData = PHIEncryption.decryptDoctorData(doctor);
      return {
        id: doctor.id,
        name: decryptedData.name,
        specialization: decryptedData.specialization,
        email: decryptedData.email,
        phone: decryptedData.phone,
      };
    });

    // Decrypt head doctor data if exists
    let decryptedHeadDoctor = null;
    if (headDoctor) {
      const decryptedHeadDoctorData = PHIEncryption.decryptDoctorData(headDoctor);
      decryptedHeadDoctor = {
        id: headDoctor.id,
        name: decryptedHeadDoctorData.name,
        specialization: decryptedHeadDoctorData.specialization,
      };
    }

    // Add head doctor and decrypted data to department object
    const departmentWithHeadDoctor = {
      ...department,
      head_doctor: decryptedHeadDoctor,
      staff: decryptedStaff,
      doctors: decryptedDoctors,
    };

    return {
      success: true,
      department: departmentWithHeadDoctor as DepartmentWithDetails,
    };
  } catch (error) {
    console.error('Error fetching department details:', error);
    return {
      success: false,
      message: 'Failed to fetch department details',
      department: null,
    };
  }
}

export async function getDepartmentsList() {
  try {
    const departments = await (db as any).department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        capacity: true,
        current_load: true,
        created_at: true,
        _count: {
          select: {
            doctors: true,
            staff: true,
            wards: true,
            equipment: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      departments,
    };
  } catch (error) {
    console.error('Error fetching departments list:', error);
    return {
      success: false,
      message: 'Failed to fetch departments',
      departments: [],
    };
  }
}

export async function getDepartmentAnalytics(departmentId: string) {
  try {
    const response = await fetch(`/api/departments/${departmentId}/analytics`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    return {
      success: false,
      error: 'Failed to fetch department analytics'
    };
  }
}

export async function getDepartmentResources(departmentId: string) {
  try {
    const response = await fetch(`/api/departments/${departmentId}/resources`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching department resources:', error);
    return {
      success: false,
      error: 'Failed to fetch department resources'
    };
  }
}

export async function getDepartmentPatientFlow(departmentId: string) {
  try {
    const response = await fetch(`/api/departments/${departmentId}/patient-flow`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching patient flow:', error);
    return {
      success: false,
      error: 'Failed to fetch patient flow'
    };
  }
}

export async function assignBedToPatient(bedId: string, patientId: string) {
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

    return {
      success: true,
      data: bed
    };
  } catch (error) {
    console.error('Error assigning bed to patient:', error);
    return {
      success: false,
      error: 'Failed to assign bed to patient'
    };
  }
}

export async function dischargePatient(patientId: string, bedId: string) {
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

    return {
      success: true,
      data: bed
    };
  } catch (error) {
    console.error('Error discharging patient:', error);
    return {
      success: false,
      error: 'Failed to discharge patient'
    };
  }
}

export async function updateEquipmentStatus(equipmentId: string, status: string) {
  try {
    const equipment = await (db as any).equipment.update({
      where: { id: equipmentId },
      data: {
        status,
        last_maintenance: status === 'MAINTENANCE' ? new Date() : undefined
      }
    });

    return {
      success: true,
      data: equipment
    };
  } catch (error) {
    console.error('Error updating equipment status:', error);
    return {
      success: false,
      error: 'Failed to update equipment status'
    };
  }
}
