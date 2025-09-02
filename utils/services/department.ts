import db from "@/lib/db";

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
        head_doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
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

    return {
      success: true,
      department: department as DepartmentWithDetails,
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
