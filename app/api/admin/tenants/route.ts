import { NextRequest, NextResponse } from "next/server";
import { TenantManager, TenantConfig } from "@/lib/tenant-config";
import { requirePermission } from "@/lib/permission-guards";

export async function GET(request: NextRequest) {
  try {
    // Check permissions - only admins can manage tenants
    await requirePermission('SYSTEM_CONFIG_VIEW', '/unauthorized');
    
    const tenants = await TenantManager.listTenants();
    
    return NextResponse.json({
      success: true,
      tenants,
      count: tenants.length
    });

  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tenants',
        message: 'Unable to retrieve tenant information'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permissions
    await requirePermission('SYSTEM_CONFIG_VIEW', '/unauthorized');
    
    const body = await request.json();
    const { name, type, databaseUrl, features, settings } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Tenant name and type are required'
        },
        { status: 400 }
      );
    }

    // Validate tenant type
    if (!['SAAS', 'ON_PREMISE', 'PRIVATE_DB'].includes(type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid tenant type',
          message: 'Tenant type must be SAAS, ON_PREMISE, or PRIVATE_DB'
        },
        { status: 400 }
      );
    }

    // Generate tenant ID
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create tenant configuration
    const tenantConfig: TenantConfig = {
      id: tenantId,
      name,
      type,
      databaseUrl: type !== 'SAAS' ? databaseUrl : undefined,
      features: features || ['basic'],
      settings: {
        allowDataExport: settings?.allowDataExport || false,
        allowCustomBranding: settings?.allowCustomBranding || false,
        maxUsers: settings?.maxUsers || 100,
        dataRetentionDays: settings?.dataRetentionDays || 2555, // 7 years
        ...settings
      }
    };

    await TenantManager.createTenant(tenantConfig);

    return NextResponse.json({
      success: true,
      tenant: tenantConfig,
      message: 'Tenant created successfully'
    });

  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create tenant',
        message: 'Unable to create tenant at this time'
      },
      { status: 500 }
    );
  }
}
