import { NextRequest, NextResponse } from 'next/server';
import { TemplateRegistry } from '@/lib/template-engine';

// POST /api/templates/preview - Preview template with sample data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, context } = body;
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    const templateRegistry = TemplateRegistry.getInstance();
    
    // Check if template exists
    const template = templateRegistry.getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Use provided context or default sample data
    const previewContext = context || getDefaultPreviewContext(template);
    
    // Render template
    const renderedBody = templateRegistry.renderTemplate(templateId, previewContext);
    const renderedSubject = template.subject ? 
      templateRegistry.getTemplateSubject(templateId, previewContext) : 
      undefined;
    
    // Validate template variables
    const validationResult = validateTemplateContext(template, previewContext);
    
    return NextResponse.json({
      success: true,
      data: {
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          version: template.version,
          type: template.type,
          channel: template.channel
        },
        preview: {
          subject: renderedSubject,
          body: renderedBody,
          smsBody: template.smsBody ? 
            templateRegistry.renderTemplate(templateId, previewContext) : 
            undefined
        },
        context: previewContext,
        validation: validationResult
      }
    });
    
  } catch (error: any) {
    console.error('Failed to preview template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to preview template' 
      },
      { status: 500 }
    );
  }
}

// Generate default preview context based on template type
function getDefaultPreviewContext(template: any) {
  const baseContext = {
    recipientName: 'John Doe',
    recipientEmail: 'john.doe@example.com',
    recipientPhone: '+1-555-0123',
    systemName: 'Healthcare Management System',
    supportEmail: 'support@healthcare.com',
    supportPhone: '+1-800-HEALTH',
    websiteUrl: 'https://healthcare.com',
    facilityName: 'Healthcare System',
    facilityAddress: '123 Medical Center Dr, Healthcare City, HC 12345',
    facilityPhone: '+1-555-HEALTH'
  };
  
  // Add template-specific context
  switch (template.type) {
    case 'APPOINTMENT_BOOKED':
      return {
        ...baseContext,
        appointmentId: 'APT-001',
        appointmentType: 'General Checkup',
        appointmentDate: 'Monday, January 15th, 2024',
        appointmentTime: '2:30 PM',
        appointmentDuration: '30 minutes',
        doctorName: 'Dr. Sarah Johnson',
        doctorSpecialization: 'Internal Medicine',
        doctorPhone: '+1-555-0124',
        doctorEmail: 'dr.johnson@healthcare.com'
      };
      
    case 'APPOINTMENT_REMINDER':
      return {
        ...baseContext,
        appointmentId: 'APT-001',
        appointmentType: 'Follow-up Consultation',
        appointmentDate: 'Tomorrow',
        appointmentTime: '10:00 AM',
        appointmentDuration: '45 minutes',
        doctorName: 'Dr. Michael Chen',
        doctorSpecialization: 'Cardiology',
        doctorPhone: '+1-555-0125',
        doctorEmail: 'dr.chen@healthcare.com'
      };
      
    case 'APPOINTMENT_CANCELLED':
      return {
        ...baseContext,
        appointmentId: 'APT-002',
        appointmentType: 'Annual Physical',
        appointmentDate: 'Wednesday, January 17th, 2024',
        appointmentTime: '3:00 PM',
        doctorName: 'Dr. Emily Rodriguez',
        doctorSpecialization: 'Family Medicine'
      };
      
    case 'APPOINTMENT_RESCHEDULED':
      return {
        ...baseContext,
        appointmentId: 'APT-003',
        appointmentType: 'Dental Cleaning',
        appointmentDate: 'Friday, January 19th, 2024',
        appointmentTime: '11:30 AM',
        previousDate: 'Thursday, January 18th, 2024',
        previousTime: '2:00 PM',
        doctorName: 'Dr. James Wilson',
        doctorSpecialization: 'Dentistry'
      };
      
    case 'DOCTOR_AVAILABILITY':
      return {
        ...baseContext,
        doctorName: 'Dr. Sarah Johnson',
        doctorSpecialization: 'Internal Medicine',
        patientName: 'Jane Smith',
        patientAge: '35 years',
        patientPhone: '+1-555-0126',
        patientEmail: 'jane.smith@example.com',
        appointmentDate: 'Monday, January 15th, 2024',
        appointmentTime: '2:30 PM',
        appointmentType: 'General Checkup',
        notes: 'Patient requested morning appointment if possible'
      };
      
    default:
      return baseContext;
  }
}

// Validate that all required template variables are provided
function validateTemplateContext(template: any, context: any) {
  const missingVariables = [];
  const providedVariables = [];
  
  for (const variable of template.variables) {
    if (context[variable] !== undefined && context[variable] !== null && context[variable] !== '') {
      providedVariables.push(variable);
    } else {
      missingVariables.push(variable);
    }
  }
  
  return {
    isValid: missingVariables.length === 0,
    missingVariables,
    providedVariables,
    totalRequired: template.variables.length,
    providedCount: providedVariables.length,
    missingCount: missingVariables.length
  };
}
