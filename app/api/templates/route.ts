import { NextRequest, NextResponse } from 'next/server';
import { TemplateRegistry } from '@/lib/template-engine';
import { logAudit } from '@/lib/audit';

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const templateRegistry = TemplateRegistry.getInstance();
    const templates = templateRegistry.listTemplates();
    
    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const templateRegistry = TemplateRegistry.getInstance();
    
    // Validate required fields
    const requiredFields = ['id', 'name', 'description', 'type', 'channel', 'body', 'variables'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Register the new template
    templateRegistry.registerTemplate({
      id: body.id,
      name: body.name,
      description: body.description,
      version: body.version || '1.0.0',
      type: body.type,
      channel: body.channel,
      subject: body.subject,
      body: body.body,
      smsBody: body.smsBody,
      variables: body.variables,
      fallbacks: body.fallbacks || {},
      metadata: body.metadata || {}
    });
    
    // Log audit
    await logAudit({
      action: 'CREATE',
      resourceType: 'SYSTEM',
      resourceId: body.id,
      reason: 'New email template created via API',
      metadata: {
        templateName: body.name,
        templateType: body.type,
        channel: body.channel
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      data: templateRegistry.getTemplate(body.id)
    });
    
  } catch (error: any) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create template' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/templates - Update existing template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const templateRegistry = TemplateRegistry.getInstance();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    // Check if template exists
    const existingTemplate = templateRegistry.getTemplate(body.id);
    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Update the template
    templateRegistry.updateTemplate(body.id, {
      name: body.name,
      description: body.description,
      type: body.type,
      channel: body.channel,
      subject: body.subject,
      body: body.body,
      smsBody: body.smsBody,
      variables: body.variables,
      fallbacks: body.fallbacks,
      metadata: body.metadata
    });
    
    // Log audit
    await logAudit({
      action: 'UPDATE',
      resourceType: 'SYSTEM',
      resourceId: body.id,
      reason: 'Email template updated via API',
      metadata: {
        templateName: body.name,
        templateType: body.type,
        channel: body.channel,
        previousVersion: existingTemplate.version
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      data: templateRegistry.getTemplate(body.id)
    });
    
  } catch (error: any) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update template' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/templates - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    const templateRegistry = TemplateRegistry.getInstance();
    
    // Check if template exists
    const existingTemplate = templateRegistry.getTemplate(id);
    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Delete the template
    const deleted = templateRegistry.deleteTemplate(id);
    
    if (deleted) {
      // Log audit
      await logAudit({
        action: 'DELETE',
        resourceType: 'SYSTEM',
        resourceId: id,
        reason: 'Email template deleted via API',
        metadata: {
          templateName: existingTemplate.name,
          templateType: existingTemplate.type,
          channel: existingTemplate.channel
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete template' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete template' 
      },
      { status: 500 }
    );
  }
}
