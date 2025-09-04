import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bundle = await db.serviceBundle.findUnique({
      where: { id: id },
      include: {
        bundle_items: {
          include: {
            service: {
              select: {
                id: true,
                service_name: true,
                description: true,
                price: true,
                duration_minutes: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!bundle) {
      return NextResponse.json(
        { error: "Service bundle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bundle
    });
  } catch (error) {
    console.error("Error in GET /api/service-bundles/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, services, discount_percent } = body;

    // Check if bundle exists
    const existingBundle = await db.serviceBundle.findUnique({
      where: { id: id }
    });

    if (!existingBundle) {
      return NextResponse.json(
        { error: "Service bundle not found" },
        { status: 404 }
      );
    }

    // Calculate new total price if services are provided
    let totalPrice = existingBundle.total_price;
    if (services && Array.isArray(services)) {
      const serviceIds = services.map((s: any) => s.service_id);
      const servicePrices = await db.services.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true, price: true }
      });

      totalPrice = 0;
      services.forEach((serviceItem: any) => {
        const service = servicePrices.find(s => s.id === serviceItem.service_id);
        if (service) {
          totalPrice += service.price * (serviceItem.quantity || 1);
        }
      });

      // Apply discount if provided
      if (discount_percent && discount_percent > 0) {
        totalPrice = totalPrice * (1 - discount_percent / 100);
      }
    }

    // Update bundle in transaction
    const result = await db.$transaction(async (tx) => {
      // Update the bundle
      const updatedBundle = await tx.serviceBundle.update({
        where: { id: id },
        data: {
          name: name || existingBundle.name,
          description: description !== undefined ? description : existingBundle.description,
          total_price: totalPrice,
          discount_percent: discount_percent !== undefined ? discount_percent : existingBundle.discount_percent }
      });

      // Update bundle items if services are provided
      if (services && Array.isArray(services)) {
        // Delete existing items
        await tx.serviceBundleItem.deleteMany({
          where: { bundle_id: id }
        });

        // Create new items
        await Promise.all(
          services.map((serviceItem: any) =>
            tx.serviceBundleItem.create({
              data: {
                bundle_id: id,
                service_id: serviceItem.service_id,
                quantity: serviceItem.quantity || 1,
                is_required: serviceItem.is_required !== false
              }
            })
          )
        );
      }

      return updatedBundle;
    });

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'SERVICE',
      resourceId: id,
      metadata: {
        bundle_name: result.name,
        total_price: result.total_price,
        service_count: services ? services.length : 'unchanged'
      } });

    return NextResponse.json({
      success: true,
      bundle: result,
      message: 'Service bundle updated successfully'
    });

  } catch (error) {
    console.error("Error in PUT /api/service-bundles/[id]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update service bundle',
        message: 'Unable to update service bundle at this time'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if bundle exists
    const existingBundle = await db.serviceBundle.findUnique({
      where: { id: id }
    });

    if (!existingBundle) {
      return NextResponse.json(
        { error: "Service bundle not found" },
        { status: 404 }
      );
    }

    // Check if bundle is being used in any bills
    const bundleUsage = await db.patientBills.findFirst({
      where: { bundle_id: id }
    });

    if (bundleUsage) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot delete bundle',
          message: 'Service bundle is being used in patient bills and cannot be deleted'
        },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false
    await db.serviceBundle.update({
      where: { id: id },
      data: { is_active: false }
    });

    // Log audit trail
    await logAudit({
      action: 'DELETE',
      resourceType: 'SERVICE',
      resourceId: id,
      metadata: {
        bundle_name: existingBundle.name,
        total_price: existingBundle.total_price
      } });

    return NextResponse.json({
      success: true,
      message: 'Service bundle deleted successfully'
    });

  } catch (error) {
    console.error("Error in DELETE /api/service-bundles/[id]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete service bundle',
        message: 'Unable to delete service bundle at this time'
      },
      { status: 500 }
    );
  }
}
