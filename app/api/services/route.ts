import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereClause = {};
    
    // Filter by category if provided
    if (category && category !== 'all') {
      whereClause = {
        service_name: {
          contains: category,
          mode: 'insensitive'
        }
      };
    }

    const services = await db.services.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        service_name: true,
        description: true,
        price: true,
        created_at: true
      }
    });

    // Group services by category for better organization
    const categorizedServices = services.reduce((acc, service) => {
      // Extract category from service name (e.g., "Cardiology Consultation" -> "Cardiology")
      const category = service.service_name.split(' ')[0];
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push({
        id: service.id,
        name: service.service_name,
        description: service.description,
        price: service.price,
        formattedPrice: `$${service.price.toFixed(2)}`,
        created_at: service.created_at
      });
      
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      services: categorizedServices,
      total: services.length,
      categories: Object.keys(categorizedServices)
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
