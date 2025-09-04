import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  getAdmissions, 
  createAdmission, 
  getAdmissionStats,
  AdmissionData,
  AdmissionFilters 
} from "@/utils/services/admission";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const result = await getAdmissionStats();
      return NextResponse.json(result);
    }

    // Parse filters from query parameters
    const filters: AdmissionFilters = {};
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }
    if (searchParams.get('type')) {
      filters.type = searchParams.get('type')!;
    }
    if (searchParams.get('department')) {
      filters.department = searchParams.get('department')!;
    }
    if (searchParams.get('ward')) {
      filters.ward = searchParams.get('ward')!;
    }
    if (searchParams.get('priority')) {
      filters.priority = searchParams.get('priority')!;
    }
    if (searchParams.get('dateFrom')) {
      filters.dateFrom = new Date(searchParams.get('dateFrom')!);
    }
    if (searchParams.get('dateTo')) {
      filters.dateTo = new Date(searchParams.get('dateTo')!);
    }

    const result = await getAdmissions(filters);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/admissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    
    // Validate required fields
    const requiredFields = [
      'patient_id', 'doctor_id', 'department_id', 'admission_type',
      'admission_date', 'admission_time', 'admission_reason', 'chief_complaint'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const admissionData: AdmissionData = {
      ...body,
      created_by: userId,
      admission_status: body.admission_status || 'PENDING',
      priority_level: body.priority_level || 'MEDIUM',
      insurance_verified: body.insurance_verified || false };

    const result = await createAdmission(admissionData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log audit trail
    await logAudit({
      action: 'CREATE',
      resourceType: 'ADMISSION',
      resourceId: result.data?.id || '', // Assuming admin creates admissions
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

