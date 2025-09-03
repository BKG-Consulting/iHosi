import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const department_id = searchParams.get('department_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let whereClause: any = { is_active: true };
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (department_id) {
      whereClause.department_id = department_id;
    }

    const [templates, totalCount] = await Promise.all([
      db.serviceTemplate.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          template_items: {
            include: {
              service: {
                select: {
                  id: true,
                  service_name: true,
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
      }),
      db.serviceTemplate.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      templates,
      total: totalCount,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching service templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch service templates',
        message: 'Unable to retrieve service templates at this time'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, department_id, services } = body;

    // Validate required fields
    if (!name || !category || !services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Template name, category, and services are required'
        },
        { status: 400 }
      );
    }

    // Validate services exist
    const serviceIds = services.map((s: any) => s.service_id);
    const existingServices = await db.services.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true }
    });

    if (existingServices.length !== serviceIds.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid services',
          message: 'One or more services do not exist'
        },
        { status: 400 }
      );
    }

    // Create template with items in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the template
      const template = await tx.serviceTemplate.create({
        data: {
          name,
          description,
          category,
          department_id: department_id || null,
          created_by: userId,
        }
      });

      // Create template items
      const templateItems = await Promise.all(
        services.map((serviceItem: any, index: number) =>
          tx.serviceTemplateItem.create({
            data: {
              template_id: template.id,
              service_id: serviceItem.service_id,
              quantity: serviceItem.quantity || 1,
              is_required: serviceItem.is_required !== false,
              order_index: serviceItem.order_index || index
            }
          })
        )
      );

      return { template, templateItems };
    });

    // Log audit trail
    await logAudit({
      action: 'CREATE',
      resourceType: 'SERVICE',
      resourceId: result.template.id,
      metadata: {
        template_name: result.template.name,
        category: result.template.category,
        service_count: services.length
      },
    });

    return NextResponse.json({
      success: true,
      template: result.template,
      message: 'Service template created successfully'
    });

  } catch (error) {
    console.error('Error creating service template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create service template',
        message: 'Unable to create service template at this time'
      },
      { status: 500 }
    );
  }
}
