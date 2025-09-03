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
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    
    // Filter by category if provided
    if (category && category !== 'all') {
      whereClause.service_name = {
        contains: category,
        mode: 'insensitive'
      };
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { service_name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [services, totalCount] = await Promise.all([
      db.services.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          service_name: 'asc'
        },
        select: {
          id: true,
          service_name: true,
          description: true,
          price: true,
          created_at: true,
          updated_at: true
        }
      }),
      db.services.count({ where: whereClause })
    ]);

    // Group services by category for better organization
    const categorizedServices = services.reduce((acc, service) => {
      // Extract category from service name (e.g., "Cardiology Consultation" -> "Cardiology")
      const category = service.service_name.split(' ')[0];
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push({
        id: service.id,
        service_name: service.service_name,
        description: service.description,
        price: service.price,
        formattedPrice: `$${service.price.toFixed(2)}`,
        created_at: service.created_at,
        updated_at: service.updated_at
      });
      
      return acc;
    }, {} as Record<string, any[]>);

    // Get all unique categories for filtering
    const allServices = await db.services.findMany({
      select: { service_name: true }
    });
    
    const allCategories = [...new Set(
      allServices.map(service => service.service_name.split(' ')[0])
    )].sort();

    return NextResponse.json({
      success: true,
      services: categorizedServices,
      allServices: services, // For flat list view
      total: totalCount,
      categories: allCategories,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch services',
        message: 'Unable to retrieve hospital services at this time'
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

    // Create new service
    const newService = await db.services.create({
      data: {
        service_name,
        description,
        price: parseFloat(price)
      }
    });

    // Log audit trail
    await logAudit({
      action: 'CREATE',
      resourceType: 'SERVICE',
      resourceId: newService.id.toString(),
      metadata: {
        service_name: newService.service_name,
        price: newService.price
      },
    });

    return NextResponse.json({
      success: true,
      service: newService,
      message: 'Service created successfully'
    });

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create service',
        message: 'Unable to create service at this time'
      },
      { status: 500 }
    );
  }
}

