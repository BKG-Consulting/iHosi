import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const department_id = searchParams.get('department_id');

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build where clause for date filtering
    let whereClause: any = {
      appointment_date: {
        gte: startDate
      }
    };

    // Add department filter if provided
    if (department_id) {
      whereClause.service = {
        department_id: department_id
      };
    }

    // Get service utilization statistics
    const serviceStats = await db.appointment.groupBy({
      by: ['service_id'],
      where: whereClause,
      _count: {
        service_id: true
      },
      _sum: {
        service_id: true
      },
      orderBy: {
        _count: {
          service_id: 'desc'
        }
      },
      take: 10
    });

    // Get service details for the top services
    const serviceIds = serviceStats.map(stat => stat.service_id).filter(id => id !== null);
    const services = await db.services.findMany({
      where: {
        id: { in: serviceIds }
      },
      select: {
        id: true,
        service_name: true,
        price: true,
        category: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    // Get total appointments in period
    const totalAppointments = await db.appointment.count({
      where: {
        appointment_date: {
          gte: startDate
        }
      }
    });

    // Get appointments with services
    const appointmentsWithServices = await db.appointment.count({
      where: {
        appointment_date: {
          gte: startDate
        },
        service_id: {
          not: null
        }
      }
    });

    // Get revenue by service category
    const revenueByCategory = await db.appointment.groupBy({
      by: ['service_id'],
      where: {
        appointment_date: {
          gte: startDate
        },
        service_id: {
          not: null
        }
      },
      _count: {
        service_id: true
      }
    });

    // Get service details for revenue calculation
    const revenueServiceIds = revenueByCategory.map(stat => stat.service_id).filter(id => id !== null);
    const revenueServices = await db.services.findMany({
      where: {
        id: { in: revenueServiceIds }
      },
      select: {
        id: true,
        service_name: true,
        price: true,
        category: true
      }
    });

    // Calculate revenue by category
    const categoryRevenue: Record<string, { count: number; revenue: number }> = {};
    revenueByCategory.forEach(stat => {
      if (stat.service_id) {
        const service = revenueServices.find(s => s.id === stat.service_id);
        if (service) {
          const count = stat._count.service_id;
          const revenue = service.price * count;
          
          if (!categoryRevenue[service.category || 'Uncategorized']) {
            categoryRevenue[service.category || 'Uncategorized'] = { count: 0, revenue: 0 };
          }
          categoryRevenue[service.category || 'Uncategorized'].count += count;
          categoryRevenue[service.category || 'Uncategorized'].revenue += revenue;
        }
      }
    });

    // Get daily service utilization for the last 30 days
    const dailyStats = await db.appointment.groupBy({
      by: ['appointment_date'],
      where: {
        appointment_date: {
          gte: startDate
        },
        service_id: {
          not: null
        }
      },
      _count: {
        service_id: true
      },
      orderBy: {
        appointment_date: 'asc'
      }
    });

    // Get department-wise service utilization
    const departmentStats = await db.appointment.groupBy({
      by: ['service_id'],
      where: {
        appointment_date: {
          gte: startDate
        },
        service_id: {
          not: null
        }
      },
      _count: {
        service_id: true
      }
    });

    const departmentServiceIds = departmentStats.map(stat => stat.service_id).filter(id => id !== null);
    const departmentServices = await db.services.findMany({
      where: {
        id: { in: departmentServiceIds }
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    const departmentUtilization: Record<string, { count: number; services: string[] }> = {};
    departmentStats.forEach(stat => {
      if (stat.service_id) {
        const service = departmentServices.find(s => s.id === stat.service_id);
        if (service && service.department) {
          const deptName = service.department.name;
          if (!departmentUtilization[deptName]) {
            departmentUtilization[deptName] = { count: 0, services: [] };
          }
          departmentUtilization[deptName].count += stat._count.service_id;
          if (!departmentUtilization[deptName].services.includes(service.service_name)) {
            departmentUtilization[deptName].services.push(service.service_name);
          }
        }
      }
    });

    // Calculate service utilization percentage
    const serviceUtilizationPercentage = totalAppointments > 0 
      ? (appointmentsWithServices / totalAppointments) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        period: `${days} days`,
        totalAppointments,
        appointmentsWithServices,
        serviceUtilizationPercentage: Math.round(serviceUtilizationPercentage * 100) / 100,
        topServices: serviceStats.map(stat => {
          const service = services.find(s => s.id === stat.service_id);
          return {
            service_id: stat.service_id,
            service_name: service?.service_name || 'Unknown Service',
            category: service?.category || 'Uncategorized',
            department: service?.department,
            price: service?.price || 0,
            utilization_count: stat._count.service_id,
            revenue: service ? service.price * stat._count.service_id : 0
          };
        }),
        revenueByCategory: Object.entries(categoryRevenue).map(([category, data]) => ({
          category,
          count: data.count,
          revenue: Math.round(data.revenue * 100) / 100
        })),
        dailyUtilization: dailyStats.map(stat => ({
          date: stat.appointment_date.toISOString().split('T')[0],
          count: stat._count.service_id
        })),
        departmentUtilization: Object.entries(departmentUtilization).map(([department, data]) => ({
          department,
          count: data.count,
          services: data.services
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching service analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch service analytics',
        message: 'Unable to retrieve service analytics at this time'
      },
      { status: 500 }
    );
  }
}
