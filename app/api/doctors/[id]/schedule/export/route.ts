import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { logAudit } from '@/lib/audit';
import db from '@/lib/db';
import { z } from 'zod';

// Export format validation
const ExportRequestSchema = z.object({
  format: z.enum(['pdf', 'csv', 'excel', 'ical', 'json']),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  includeAppointments: z.boolean().default(true),
  includeWorkingHours: z.boolean().default(true),
  includeLeaveRequests: z.boolean().default(false),
  includeTemplates: z.boolean().default(false),
  emailDelivery: z.boolean().default(false),
  emailAddress: z.string().email().optional(),
});

// GET: Export doctor's schedule in specified format
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const doctorId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role?.toLowerCase() !== 'admin' && user.id !== doctorId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const exportData = {
      format: searchParams.get('format') || 'pdf',
      dateRange: {
        startDate: searchParams.get('startDate') || new Date().toISOString(),
        endDate: searchParams.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      includeAppointments: searchParams.get('includeAppointments') === 'true',
      includeWorkingHours: searchParams.get('includeWorkingHours') === 'true',
      includeLeaveRequests: searchParams.get('includeLeaveRequests') === 'false',
      includeTemplates: searchParams.get('includeTemplates') === 'false',
      emailDelivery: searchParams.get('emailDelivery') === 'false',
      emailAddress: searchParams.get('emailAddress') || undefined,
    };

    const validatedData = ExportRequestSchema.parse(exportData);

    // Fetch doctor and schedule data
    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
      include: {
        working_days: true,
        leave_requests: validatedData.includeLeaveRequests ? {
          where: {
            start_date: { gte: new Date(validatedData.dateRange.startDate) },
            end_date: { lte: new Date(validatedData.dateRange.endDate) },
          },
          orderBy: { start_date: 'desc' },
        } : false,
        appointments: validatedData.includeAppointments ? {
          where: {
            appointment_date: {
              gte: new Date(validatedData.dateRange.startDate),
              lte: new Date(validatedData.dateRange.endDate),
            },
          },
          include: {
            patient: {
              select: {
                first_name: true,
                last_name: true,
                phone: true,
                email: true,
              },
            },
          },
          orderBy: { appointment_date: 'asc' },
        } : false,
      },
    });

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    // Log export action for audit
    await logAudit({
      action: 'EXPORT',
      resourceType: 'DOCTOR',
      resourceId: doctorId,
      reason: `Schedule export in ${validatedData.format.toUpperCase()} format`,
      metadata: {
        exportFormat: validatedData.format,
        dateRange: validatedData.dateRange,
        includeAppointments: validatedData.includeAppointments,
        includeWorkingHours: validatedData.includeWorkingHours,
        includeLeaveRequests: validatedData.includeLeaveRequests,
        emailDelivery: validatedData.emailDelivery,
      },
    });

    // Generate export based on format
    let exportResult;
    switch (validatedData.format) {
      case 'pdf':
        exportResult = await generatePDFExport(doctor, validatedData);
        break;
      case 'csv':
        exportResult = await generateCSVExport(doctor, validatedData);
        break;
      case 'excel':
        exportResult = await generateExcelExport(doctor, validatedData);
        break;
      case 'ical':
        exportResult = await generateICalExport(doctor, validatedData);
        break;
      case 'json':
        exportResult = await generateJSONExport(doctor, validatedData);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Unsupported export format' }, { status: 400 });
    }

    // Handle email delivery if requested
    if (validatedData.emailDelivery && validatedData.emailAddress) {
      await sendExportViaEmail(exportResult, validatedData.emailAddress, doctor.name);
    }

    // Return appropriate response based on format
    if (validatedData.format === 'json') {
      return NextResponse.json({ 
        success: true, 
        data: exportResult,
        message: 'Schedule exported successfully' 
      });
    } else {
      return new NextResponse(exportResult.content, {
        headers: {
          'Content-Type': exportResult.contentType,
          'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
        },
      });
    }

  } catch (error) {
    console.error('Error exporting schedule:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Schedule export for later delivery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const doctorId = resolvedParams.id;
    const body = await request.json();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role?.toLowerCase() !== 'admin' && user.id !== doctorId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const validatedData = ExportRequestSchema.parse(body);

    // Create scheduled export job
    const exportJob = await db.exportJob.create({
      data: {
        doctor_id: doctorId,
        format: validatedData.format,
        date_range_start: new Date(validatedData.dateRange.startDate),
        date_range_end: new Date(validatedData.dateRange.endDate),
        include_appointments: validatedData.includeAppointments,
        include_working_hours: validatedData.includeWorkingHours,
        include_leave_requests: validatedData.includeLeaveRequests,
        include_templates: validatedData.includeTemplates,
        email_delivery: validatedData.emailDelivery,
        email_address: validatedData.emailAddress,
        status: 'PENDING',
        created_by: user.id,
      },
    });

    // Log scheduled export
    await logAudit({
      action: 'EXPORT',
      resourceType: 'DOCTOR',
      resourceId: doctorId,
      reason: `Scheduled schedule export in ${validatedData.format.toUpperCase()} format`,
      metadata: {
        exportJobId: exportJob.id,
        scheduledFor: new Date().toISOString(),
        emailDelivery: validatedData.emailDelivery,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Export job scheduled successfully',
      jobId: exportJob.id 
    });

  } catch (error) {
    console.error('Error scheduling export:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions for different export formats
async function generatePDFExport(doctor: any, options: any) {
  const { ExportService } = await import('@/services/export-service');
  
  const exportData = {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
    },
    exportDate: new Date().toISOString(),
    dateRange: options.dateRange,
    workingHours: options.includeWorkingHours ? doctor.working_days?.map((day: any) => ({
      day: day.day_of_week,
      isWorking: day.is_working,
      startTime: day.start_time,
      endTime: day.end_time,
      breakStart: day.break_start_time,
      breakEnd: day.break_end_time,
      maxAppointments: day.max_appointments,
    })) : undefined,
    appointments: options.includeAppointments ? doctor.appointments : undefined,
    leaveRequests: options.includeLeaveRequests ? doctor.leave_requests : undefined,
  };

  return await ExportService.generatePDF(exportData);
}

async function generateCSVExport(doctor: any, options: any) {
  const { ExportService } = await import('@/services/export-service');
  
  const exportData = {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
    },
    exportDate: new Date().toISOString(),
    dateRange: options.dateRange,
    workingHours: options.includeWorkingHours ? doctor.working_days?.map((day: any) => ({
      day: day.day_of_week,
      isWorking: day.is_working,
      startTime: day.start_time,
      endTime: day.end_time,
      breakStart: day.break_start_time,
      breakEnd: day.break_end_time,
      maxAppointments: day.max_appointments,
    })) : undefined,
    appointments: options.includeAppointments ? doctor.appointments : undefined,
    leaveRequests: options.includeLeaveRequests ? doctor.leave_requests : undefined,
  };

  return await ExportService.generateCSV(exportData);
}

async function generateExcelExport(doctor: any, options: any) {
  const { ExportService } = await import('@/services/export-service');
  
  const exportData = {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
    },
    exportDate: new Date().toISOString(),
    dateRange: options.dateRange,
    workingHours: options.includeWorkingHours ? doctor.working_days?.map((day: any) => ({
      day: day.day_of_week,
      isWorking: day.is_working,
      startTime: day.start_time,
      endTime: day.end_time,
      breakStart: day.break_start_time,
      breakEnd: day.break_end_time,
      maxAppointments: day.max_appointments,
    })) : undefined,
    appointments: options.includeAppointments ? doctor.appointments : undefined,
    leaveRequests: options.includeLeaveRequests ? doctor.leave_requests : undefined,
  };

  return await ExportService.generateExcel(exportData);
}

async function generateICalExport(doctor: any, options: any) {
  const { ExportService } = await import('@/services/export-service');
  
  const exportData = {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
    },
    exportDate: new Date().toISOString(),
    dateRange: options.dateRange,
    workingHours: options.includeWorkingHours ? doctor.working_days?.map((day: any) => ({
      day: day.day_of_week,
      isWorking: day.is_working,
      startTime: day.start_time,
      endTime: day.end_time,
      breakStart: day.break_start_time,
      breakEnd: day.break_end_time,
      maxAppointments: day.max_appointments,
    })) : undefined,
    appointments: options.includeAppointments ? doctor.appointments : undefined,
    leaveRequests: options.includeLeaveRequests ? doctor.leave_requests : undefined,
  };

  return await ExportService.generateICal(exportData);
}

async function generateJSONExport(doctor: any, options: any) {
  const { ExportService } = await import('@/services/export-service');
  
  const exportData = {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
    },
    exportDate: new Date().toISOString(),
    dateRange: options.dateRange,
    workingHours: options.includeWorkingHours ? doctor.working_days?.map((day: any) => ({
      day: day.day_of_week,
      isWorking: day.is_working,
      startTime: day.start_time,
      endTime: day.end_time,
      breakStart: day.break_start_time,
      breakEnd: day.break_end_time,
      maxAppointments: day.max_appointments,
    })) : undefined,
    appointments: options.includeAppointments ? doctor.appointments : undefined,
    leaveRequests: options.includeLeaveRequests ? doctor.leave_requests : undefined,
  };

  return await ExportService.generateJSON(exportData);
}

async function sendExportViaEmail(exportResult: any, emailAddress: string, doctorName: string) {
  // TODO: Implement email sending using the existing email service
  console.log(`Sending export to ${emailAddress} for doctor ${doctorName}`);
}
