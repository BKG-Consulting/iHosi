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

    const template = await db.serviceTemplate.findUnique({
      where: { id: id },
      include: {
        template_items: {
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
          },
          orderBy: { order_index: 'asc' }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: "Service template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error("Error in GET /api/service-templates/[id]:", error);
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
    const { name, description, category, department_id, services } = body;

    // Check if template exists
    const existingTemplate = await db.serviceTemplate.findUnique({
      where: { id: id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Service template not found" },
        { status: 404 }
      );
    }

    // Update template in transaction
    const result = await db.$transaction(async (tx) => {
      // Update the template
      const updatedTemplate = await tx.serviceTemplate.update({
        where: { id: id },
        data: {
          name: name || existingTemplate.name,
          description: description !== undefined ? description : existingTemplate.description,
          category: category || existingTemplate.category,
          department_id: department_id !== undefined ? department_id : existingTemplate.department_id }
      });

      // Update template items if services are provided
      if (services && Array.isArray(services)) {
        // Delete existing items
        await tx.serviceTemplateItem.deleteMany({
          where: { template_id: id }
        });

        // Create new items
        await Promise.all(
          services.map((serviceItem: any, index: number) =>
            tx.serviceTemplateItem.create({
              data: {
                template_id: id,
                service_id: serviceItem.service_id,
                quantity: serviceItem.quantity || 1,
                is_required: serviceItem.is_required !== false,
                order_index: serviceItem.order_index || index
              }
            })
          )
        );
      }

      return updatedTemplate;
    });

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'SERVICE',
      resourceId: id,
      metadata: {
        template_name: result.name,
        category: result.category,
        service_count: services ? services.length : 'unchanged'
      } });

    return NextResponse.json({
      success: true,
      template: result,
      message: 'Service template updated successfully'
    });

  } catch (error) {
    console.error("Error in PUT /api/service-templates/[id]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update service template',
        message: 'Unable to update service template at this time'
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

    // Check if template exists
    const existingTemplate = await db.serviceTemplate.findUnique({
      where: { id: id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Service template not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    await db.serviceTemplate.update({
      where: { id: id },
      data: { is_active: false }
    });

    // Log audit trail
    await logAudit({
      action: 'DELETE',
      resourceType: 'SERVICE',
      resourceId: id,
      metadata: {
        template_name: existingTemplate.name,
        category: existingTemplate.category
      } });

    return NextResponse.json({
      success: true,
      message: 'Service template deleted successfully'
    });

  } catch (error) {
    console.error("Error in DELETE /api/service-templates/[id]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete service template',
        message: 'Unable to delete service template at this time'
      },
      { status: 500 }
    );
  }
}
