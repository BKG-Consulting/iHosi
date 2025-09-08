"use server";

import {
  ReviewFormValues,
  reviewSchema,
} from "@/components/dialogs/review-form";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { logAudit } from "@/lib/audit";

export async function deleteDataById(
  id: string,
  deleteType: "doctor" | "staff" | "patient" | "payment" | "bill"
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    let deletedRecord = null;

    switch (deleteType) {
      case "doctor":
        deletedRecord = await db.doctor.delete({ where: { id: id } });
        break;
      case "staff":
        deletedRecord = await db.staff.delete({ where: { id: id } });
        break;
      case "patient":
        deletedRecord = await db.patient.delete({ where: { id: id } });
        break;
      case "payment":
        deletedRecord = await db.payment.delete({ where: { id: Number(id) } });
        break;
      default:
        return {
          success: false,
          message: "Invalid delete type",
          status: 400,
        };
    }

    // Log audit trail
    await logAudit({
      action: 'DELETE',
      resourceType: deleteType.toUpperCase() as any,
      resourceId: id,
      reason: `${deleteType} deleted`,
      metadata: {
        deletedBy: user.id,
        deleteType: deleteType
      }
    });

    return {
      success: true,
      message: "Data deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Delete error:", error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createReview(values: ReviewFormValues) {
  try {
    const validatedFields = reviewSchema.parse(values);

    await db.rating.create({
      data: {
        ...validatedFields,
      },
    });

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}
