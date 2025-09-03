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

    const [bundles, totalCount] = await Promise.all([
      db.serviceBundle.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          bundle_items: {
            include: {
              service: {
                select: {
                  id: true,
                  service_name: true,
                  price: true,
                  duration_minutes: true
                }
              }
            }
          }
        }
      }),
      db.serviceBundle.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      bundles,
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
    console.error('Error fetching service bundles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch service bundles',
        message: 'Unable to retrieve service bundles at this time'
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
    const { name, description, services, discount_percent } = body;

    // Validate required fields
    if (!name || !services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Bundle name and services are required'
        },
        { status: 400 }
      );
    }

    // Calculate total price
    const serviceIds = services.map((s: any) => s.service_id);
    const servicePrices = await db.services.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, price: true }
    });

    let totalPrice = 0;
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

    // Create bundle with items in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the bundle
      const bundle = await tx.serviceBundle.create({
        data: {
          name,
          description,
          total_price: totalPrice,
          discount_percent: discount_percent || null,
        }
      });

      // Create bundle items
      const bundleItems = await Promise.all(
        services.map((serviceItem: any) =>
          tx.serviceBundleItem.create({
            data: {
              bundle_id: bundle.id,
              service_id: serviceItem.service_id,
              quantity: serviceItem.quantity || 1,
              is_required: serviceItem.is_required !== false
            }
          })
        )
      );

      return { bundle, bundleItems };
    });

    // Log audit trail
    await logAudit({
      action: 'CREATE',
      resourceType: 'SERVICE',
      resourceId: result.bundle.id,
      metadata: {
        bundle_name: result.bundle.name,
        total_price: result.bundle.total_price,
        service_count: services.length
      },
    });

    return NextResponse.json({
      success: true,
      bundle: result.bundle,
      message: 'Service bundle created successfully'
    });

  } catch (error) {
    console.error('Error creating service bundle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create service bundle',
        message: 'Unable to create service bundle at this time'
      },
      { status: 500 }
    );
  }
}
