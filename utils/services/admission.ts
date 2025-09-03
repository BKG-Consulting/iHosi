import { db } from "@/lib/db";

export interface AdmissionData {
  id?: string;
  admission_number: string;
  patient_id: string;
  doctor_id: string;
  department_id: string;
  ward_id?: string;
  bed_id?: string;
  admission_type: string;
  admission_status: string;
  priority_level: string;
  admission_date: Date;
  admission_time: string;
  admission_reason: string;
  chief_complaint: string;
  presenting_symptoms?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  insurance_verified: boolean;
  insurance_provider?: string;
  insurance_number?: string;
  estimated_stay_days?: number;
  estimated_cost?: number;
  initial_vital_signs?: string;
  triage_score?: number;
  risk_assessment?: string;
  created_by: string;
}

export interface AdmissionFilters {
  status?: string;
  type?: string;
  department?: string;
  ward?: string;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Generate admission number
export function generateAdmissionNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `ADM-${year}-${timestamp}`;
}

// Get all admissions with filters
export async function getAdmissions(filters: AdmissionFilters = {}) {
  try {
    const whereClause: any = {};

    if (filters.status && filters.status !== "ALL") {
      whereClause.admission_status = filters.status;
    }

    if (filters.type && filters.type !== "ALL") {
      whereClause.admission_type = filters.type;
    }

    if (filters.department) {
      whereClause.department_id = filters.department;
    }

    if (filters.ward) {
      whereClause.ward_id = filters.ward;
    }

    if (filters.priority && filters.priority !== "ALL") {
      whereClause.priority_level = filters.priority;
    }

    if (filters.dateFrom || filters.dateTo) {
      whereClause.admission_date = {};
      if (filters.dateFrom) {
        whereClause.admission_date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        whereClause.admission_date.lte = filters.dateTo;
      }
    }

    const admissions = await db.admission.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            department: true,
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        ward: {
          select: {
            id: true,
            name: true,
            ward_type: true,
          }
        },
        bed: {
          select: {
            id: true,
            bed_number: true,
            bed_type: true,
          }
        },
        follow_up_doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          }
        }
      },
      orderBy: {
        admission_date: 'desc'
      }
    });

    return {
      success: true,
      data: admissions,
      total: admissions.length
    };
  } catch (error) {
    console.error('Error fetching admissions:', error);
    return {
      success: false,
      error: 'Failed to fetch admissions',
      data: [],
      total: 0
    };
  }
}

// Get admission by ID
export async function getAdmissionById(id: string) {
  try {
    const admission = await db.admission.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        department: true,
        ward: true,
        bed: true,
        follow_up_doctor: true,
        admission_notes: {
          orderBy: {
            created_at: 'desc'
          }
        },
        discharge_summary: true,
        transfers: {
          orderBy: {
            transfer_date: 'desc'
          }
        }
      }
    });

    if (!admission) {
      return {
        success: false,
        error: 'Admission not found',
        data: null
      };
    }

    return {
      success: true,
      data: admission
    };
  } catch (error) {
    console.error('Error fetching admission:', error);
    return {
      success: false,
      error: 'Failed to fetch admission',
      data: null
    };
  }
}

// Create new admission
export async function createAdmission(admissionData: AdmissionData) {
  try {
    // Check if patient is already admitted
    const existingAdmission = await db.admission.findFirst({
      where: {
        patient_id: admissionData.patient_id,
        admission_status: {
          in: ['PENDING', 'ADMITTED']
        }
      }
    });

    if (existingAdmission) {
      return {
        success: false,
        error: 'Patient already has an active admission',
        data: null
      };
    }

    // If bed is assigned, check availability
    if (admissionData.bed_id) {
      const bed = await db.bed.findUnique({
        where: { id: admissionData.bed_id }
      });

      if (!bed || bed.status !== 'AVAILABLE') {
        return {
          success: false,
          error: 'Selected bed is not available',
          data: null
        };
      }
    }

    const admission = await db.admission.create({
      data: {
        ...admissionData,
        admission_number: generateAdmissionNumber(),
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
        ward: true,
        bed: true
      }
    });

    // Update bed status if assigned
    if (admissionData.bed_id) {
      await db.bed.update({
        where: { id: admissionData.bed_id },
        data: {
          status: 'OCCUPIED',
          current_patient_id: admissionData.patient_id
        }
      });
    }

    return {
      success: true,
      data: admission,
      message: 'Admission created successfully'
    };
  } catch (error) {
    console.error('Error creating admission:', error);
    return {
      success: false,
      error: 'Failed to create admission',
      data: null
    };
  }
}

// Update admission status
export async function updateAdmissionStatus(id: string, status: string, updatedBy: string) {
  try {
    const admission = await db.admission.findUnique({
      where: { id },
      include: { bed: true }
    });

    if (!admission) {
      return {
        success: false,
        error: 'Admission not found'
      };
    }

    const updatedAdmission = await db.admission.update({
      where: { id },
      data: {
        admission_status: status,
        updated_by: updatedBy,
        updated_at: new Date()
      }
    });

    // If discharging, free up the bed
    if (status === 'DISCHARGED' && admission.bed_id) {
      await db.bed.update({
        where: { id: admission.bed_id },
        data: {
          status: 'AVAILABLE',
          current_patient_id: null
        }
      });
    }

    return {
      success: true,
      data: updatedAdmission,
      message: 'Admission status updated successfully'
    };
  } catch (error) {
    console.error('Error updating admission status:', error);
    return {
      success: false,
      error: 'Failed to update admission status'
    };
  }
}

// Get admission statistics
export async function getAdmissionStats() {
  try {
    const totalAdmissions = await db.admission.count();
    const activeAdmissions = await db.admission.count({
      where: { admission_status: 'ADMITTED' }
    });
    const pendingAdmissions = await db.admission.count({
      where: { admission_status: 'PENDING' }
    });
    const emergencyAdmissions = await db.admission.count({
      where: { admission_type: 'EMERGENCY' }
    });

    return {
      success: true,
      data: {
        total: totalAdmissions,
        active: activeAdmissions,
        pending: pendingAdmissions,
        emergency: emergencyAdmissions
      }
    };
  } catch (error) {
    console.error('Error fetching admission stats:', error);
    return {
      success: false,
      error: 'Failed to fetch admission statistics',
      data: {
        total: 0,
        active: 0,
        pending: 0,
        emergency: 0
      }
    };
  }
}

// Get available beds for a ward
export async function getAvailableBeds(wardId: string) {
  try {
    const beds = await db.bed.findMany({
      where: {
        ward_id: wardId,
        status: 'AVAILABLE'
      },
      include: {
        ward: {
          select: {
            name: true,
            ward_type: true
          }
        }
      }
    });

    return {
      success: true,
      data: beds
    };
  } catch (error) {
    console.error('Error fetching available beds:', error);
    return {
      success: false,
      error: 'Failed to fetch available beds',
      data: []
    };
  }
}

