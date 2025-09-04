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

    const service = await db.services.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service
    });
  } catch (error) {
    console.error("Error in GET /api/services/[id]:", error);
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
    const { service_name, description, price } = body;

    // Validate required fields
    if (!service_name || !description || price === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Service name, description, and price are required'
        },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await db.services.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Update service
    const updatedService = await db.services.update({
      where: { id: parseInt(id) },
      data: {
        service_name,
        description,
        price: parseFloat(price)
      }
    });

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'SERVICE',
      resourceId: id,
      metadata: {
        service_name: updatedService.service_name,
        price: updatedService.price,
        previous_price: existingService.price
      } });

    return NextResponse.json({
      success: true,
      service: updatedService,
      message: 'Service updated successfully'
    });

  } catch (error) {
    console.error("Error in PUT /api/services/[id]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update service',
        message: 'Unable to update service at this time'
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

    // Check if service exists
    const existingService = await db.services.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check if service is being used in any bills
    const serviceUsage = await db.patientBills.findFirst({
      where: { service_id: parseInt(id) }
    });

    if (serviceUsage) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot delete service',
          message: 'Service is being used in patient bills and cannot be deleted'
        },
        { status: 400 }
      );
    }

    // Delete service
    await db.services.delete({
      where: { id: parseInt(id) }
    });

    // Log audit trail
    await logAudit({
      action: 'DELETE',
      resourceType: 'SERVICE',
      resourceId: id,
      metadata: {
        service_name: existingService.service_name,
        price: existingService.price
      } });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error("Error in DELETE /api/services/[id]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete service',
        message: 'Unable to delete service at this time'
      },
      { status: 500 }
    );
  }
}
