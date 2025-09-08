"use server";

import db from "@/lib/db";
import { DepartmentSchema, WardSchema, BedSchema, EquipmentSchema } from "@/lib/schema";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth-helpers";

// Department Management
export async function createDepartment(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: true, msg: "Unauthorized" };
    }
    const userId = user.id;

    const validatedData = DepartmentSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: true,
        msg: "Validation failed: " + validatedData.error.issues.map(i => i.message).join(", "),
      };
    }

    const departmentData = validatedData.data;

    const department = await db.department.create({
      data: {
        ...departmentData,
        created_by: userId,
        updated_by: userId,
      },
    });

    await logAudit({
      action: 'CREATE',
      resourceType: 'DEPARTMENT',
      resourceId: department.id,
      reason: 'Department creation',
      metadata: {
        departmentName: department.name,
        departmentCode: department.code,
        createdBy: userId
      }
    });

    return {
      success: true,
      error: false,
      msg: "Department created successfully",
      data: department,
    };
  } catch (error: any) {
    console.error("createDepartment error:", error);
    return {
      success: false,
      error: true,
      msg: error?.message || "Failed to create department",
    };
  }
}

export async function updateDepartment(id: string, data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: true, msg: "Unauthorized" };
    }
    const userId = user.id;

    const validatedData = DepartmentSchema.partial().safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: true,
        msg: "Validation failed: " + validatedData.error.issues.map(i => i.message).join(", "),
      };
    }

    const department = await db.department.update({
      where: { id },
      data: {
        ...validatedData.data,
        updated_by: userId,
      },
    });

    await logAudit({
      action: 'UPDATE',
      resourceType: 'DEPARTMENT',
      resourceId: id,
      reason: 'Department update',
      metadata: {
        departmentName: department.name,
        updatedBy: userId
      }
    });

    return {
      success: true,
      error: false,
      msg: "Department updated successfully",
      data: department,
    };
  } catch (error: any) {
    console.error("updateDepartment error:", error);
    return {
      success: false,
      error: true,
      msg: error?.message || "Failed to update department",
    };
  }
}

export async function deleteDepartment(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: true, msg: "Unauthorized" };
    }
    const userId = user.id;

    // Check if department has any related records
    const relatedRecords = await db.department.findFirst({
      where: { id },
      include: {
        doctors: { take: 1 },
        staff: { take: 1 },
        wards: { take: 1 },
        equipment: { take: 1 },
      },
    });

    if (relatedRecords?.doctors.length || relatedRecords?.staff.length || 
        relatedRecords?.wards.length || relatedRecords?.equipment.length) {
      return {
        success: false,
        error: true,
        msg: "Cannot delete department with existing doctors, staff, wards, or equipment",
      };
    }

    await db.department.delete({
      where: { id },
    });

    await logAudit({
      action: 'DELETE',
      resourceType: 'DEPARTMENT',
      resourceId: id,
      reason: 'Department deletion',
      metadata: {
        deletedBy: userId
      }
    });

    return {
      success: true,
      error: false,
      msg: "Department deleted successfully",
    };
  } catch (error: any) {
    console.error("deleteDepartment error:", error);
    return {
      success: false,
      error: true,
      msg: error?.message || "Failed to delete department",
    };
  }
}

export async function getDepartments() {
  try {
    const departments = await db.department.findMany({
      include: {
        _count: {
          select: {
            doctors: true,
            staff: true,
            wards: true,
            equipment: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      error: false,
      data: departments,
    };
  } catch (error: any) {
    console.error("getDepartments error:", error);
    return {
      success: false,
      error: true,
      msg: error?.message || "Failed to fetch departments",
    };
  }
}

export async function getDepartmentById(id: string) {
  try {
    const department = await db.department.findUnique({
      where: { id },
      include: {
        doctors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            email: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
        wards: {
          include: {
            beds: {
              select: {
                id: true,
                bed_number: true,
                status: true,
                current_patient_id: true,
              },
            },
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            model: true,
            status: true,
            equipment_type: true,
          },
        },
      },
    });

    if (!department) {
      return {
        success: false,
        error: true,
        msg: "Department not found",
      };
    }

    return {
      success: true,
      error: false,
      data: department,
    };
  } catch (error: any) {
    console.error("getDepartmentById error:", error);
    return {
      success: false,
      error: true,
      msg: error?.message || "Failed to fetch department",
    };
  }
}

// Ward Management
export async function createWard(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: true, msg: "Unauthorized" };
    }
    const userId = user.id;

    const validatedData = WardSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: true,
        msg: "Validation failed: " + validatedData.error.issues.map(i => i.message).join(", "),
      };
    }

    const ward = await db.ward.create({
      data: validatedData.data,
    });

    await logAudit({
      action: 'CREATE',
      resourceType: 'WARD',
      resourceId: ward.id,
      reason: 'Ward creation',
      metadata: {
        wardName: ward.name,
        departmentId: ward.department_id,
        createdBy: userId
      }
    });

    return {
      success: true,
      error: false,
      msg: "Ward created successfully",
      data: ward,
    };
  } catch (error: any) {
    console.error("createWard error:", error);
    return {
      success: false,
      error: true,
      msg: error?.message || "Failed to create ward",
    };
  }
}

// Bed Management
export async function createBed(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: true, msg: "Unauthorized" };
    }
    const userId = user.id;

    const validatedData = BedSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: true,
        msg: "Validation failed: " + validatedData.error.issues.map(i => i.message).join(", "),
      };
    }

    const bed = await db.bed.create({
      data: validatedData.data,
    });

    await logAudit({
      action: 'CREATE',
      resourceType: 'BED',
      resourceId: bed.id,
      reason: 'Bed creation',
      metadata: {
        bedNumber: bed.bed_number,
        wardId: bed.ward_id,
        createdBy: userId
      }
    });

    return {
      success: true,
      error: false,
      msg: "Bed created successfully",
      data: bed,
    };
  } catch (error: any) {
    console.error("createBed error:", error);
    return {
      success: false,
      error: true,
      msg: error?.message || "Failed to create bed",
    };
  }
}

// Equipment Management
export async function createEquipment(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: true, msg: "Unauthorized" };
    }
    const userId = user.id;

    const validatedData = EquipmentSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: true,
        msg: "Validation failed: " + validatedData.error.issues.map(i => i.message).join(", "),
      };
    }

    const equipment = await db.equipment.create({
      data: validatedData.data,
    });

    await logAudit({
      action: 'CREATE',
      resourceType: 'EQUIPMENT',
      resourceId: equipment.id,
      reason: 'Equipment creation',
      metadata: {
        equipmentName: equipment.name,
        serialNumber: equipment.serial_number,
        createdBy: userId
      }
    });

    return {
      success: true,
      error: false,
      msg: "Equipment created successfully",
      data: equipment,
    };
  } catch (error: any) {
    console.error("createEquipment error:", error);
    return {
      success: false,
      error: true,
      msg: error?.message || "Failed to create equipment",
    };
  }
}
