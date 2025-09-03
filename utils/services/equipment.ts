import db from "@/lib/db";

export interface EquipmentStats {
  total: number;
  operational: number;
  maintenance: number;
  outOfService: number;
  retired: number;
  maintenanceDue: number;
  warrantyExpiring: number;
}

export interface EquipmentWithDetails {
  id: string;
  name: string;
  model: string | null;
  serial_number: string;
  department_id: string | null;
  ward_id: string | null;
  equipment_type: string;
  status: string;
  manufacturer: string | null;
  purchase_date: Date | null;
  warranty_expiry: Date | null;
  last_maintenance: Date | null;
  next_maintenance: Date | null;
  maintenance_cycle: number | null;
  created_at: Date;
  updated_at: Date;
  department?: {
    id: string;
    name: string;
  } | null;
  ward?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Get equipment statistics for dashboard
 */
export async function getEquipmentStats(): Promise<EquipmentStats> {
  try {
    const [
      total,
      operational,
      maintenance,
      outOfService,
      retired,
      maintenanceDue,
      warrantyExpiring
    ] = await Promise.all([
      db.equipment.count(),
      db.equipment.count({ where: { status: 'OPERATIONAL' } }),
      db.equipment.count({ where: { status: 'MAINTENANCE' } }),
      db.equipment.count({ where: { status: 'OUT_OF_SERVICE' } }),
      db.equipment.count({ where: { status: 'RETIRED' } }),
      db.equipment.count({
        where: {
          next_maintenance: {
            lte: new Date()
          },
          status: 'OPERATIONAL'
        }
      }),
      db.equipment.count({
        where: {
          warranty_expiry: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          },
          status: {
            not: 'RETIRED'
          }
        }
      })
    ]);

    return {
      total,
      operational,
      maintenance,
      outOfService,
      retired,
      maintenanceDue,
      warrantyExpiring
    };
  } catch (error) {
    console.error('Error fetching equipment stats:', error);
    throw error;
  }
}

/**
 * Get all equipment with optional filters
 */
export async function getAllEquipment({
  page = 1,
  limit = 10,
  search,
  departmentId,
  wardId,
  equipmentType,
  status
}: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  wardId?: string;
  equipmentType?: string;
  status?: string;
} = {}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;
    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { serial_number: { contains: search, mode: "insensitive" } },
        { manufacturer: { contains: search, mode: "insensitive" } }
      ];
    }

    if (departmentId && departmentId !== 'all') {
      whereClause.department_id = departmentId;
    }

    if (wardId && wardId !== 'all') {
      whereClause.ward_id = wardId;
    }

    if (equipmentType && equipmentType !== 'all') {
      whereClause.equipment_type = equipmentType;
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [equipment, totalRecords] = await Promise.all([
      db.equipment.findMany({
        where: whereClause,
        include: {
          department: {
            select: {
              id: true,
              name: true
            }
          },
          ward: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: {
          created_at: 'desc'
        }
      }),
      db.equipment.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data: equipment,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200
    };
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    };
  }
}

/**
 * Get equipment by ID with full details
 */
export async function getEquipmentById(equipmentId: string): Promise<EquipmentWithDetails | null> {
  try {
    const equipment = await db.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return equipment as EquipmentWithDetails | null;
  } catch (error) {
    console.error('Error fetching equipment by ID:', error);
    throw error;
  }
}

/**
 * Get equipment by department
 */
export async function getEquipmentByDepartment(departmentId: string) {
  try {
    const equipment = await db.equipment.findMany({
      where: { department_id: departmentId },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return {
      success: true,
      equipment
    };
  } catch (error) {
    console.error('Error fetching equipment by department:', error);
    return {
      success: false,
      error: 'Failed to fetch equipment'
    };
  }
}

/**
 * Get equipment by ward
 */
export async function getEquipmentByWard(wardId: string) {
  try {
    const equipment = await db.equipment.findMany({
      where: { ward_id: wardId },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return {
      success: true,
      equipment
    };
  } catch (error) {
    console.error('Error fetching equipment by ward:', error);
    return {
      success: false,
      error: 'Failed to fetch equipment'
    };
  }
}

/**
 * Get equipment requiring maintenance
 */
export async function getMaintenanceDueEquipment() {
  try {
    const equipment = await db.equipment.findMany({
      where: {
        next_maintenance: {
          lte: new Date()
        },
        status: {
          not: 'RETIRED'
        }
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        next_maintenance: 'asc'
      }
    });

    return {
      success: true,
      equipment
    };
  } catch (error) {
    console.error('Error fetching maintenance due equipment:', error);
    return {
      success: false,
      error: 'Failed to fetch maintenance due equipment'
    };
  }
}

/**
 * Get equipment with expiring warranties
 */
export async function getWarrantyExpiringEquipment() {
  try {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const equipment = await db.equipment.findMany({
      where: {
        warranty_expiry: {
          lte: thirtyDaysFromNow
        },
        status: {
          not: 'RETIRED'
        }
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        warranty_expiry: 'asc'
      }
    });

    return {
      success: true,
      equipment
    };
  } catch (error) {
    console.error('Error fetching warranty expiring equipment:', error);
    return {
      success: false,
      error: 'Failed to fetch warranty expiring equipment'
    };
  }
}

/**
 * Update equipment status
 */
export async function updateEquipmentStatus(equipmentId: string, status: string) {
  try {
    const updatedEquipment = await db.equipment.update({
      where: { id: equipmentId },
      data: { 
        status,
        updated_at: new Date()
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return {
      success: true,
      equipment: updatedEquipment
    };
  } catch (error) {
    console.error('Error updating equipment status:', error);
    return {
      success: false,
      error: 'Failed to update equipment status'
    };
  }
}

/**
 * Schedule maintenance for equipment
 */
export async function scheduleMaintenance(equipmentId: string, maintenanceDate: Date) {
  try {
    const updatedEquipment = await db.equipment.update({
      where: { id: equipmentId },
      data: { 
        last_maintenance: new Date(),
        next_maintenance: maintenanceDate,
        updated_at: new Date()
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        ward: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return {
      success: true,
      equipment: updatedEquipment
    };
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    return {
      success: false,
      error: 'Failed to schedule maintenance'
    };
  }
}
