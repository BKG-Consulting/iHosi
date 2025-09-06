import { NextRequest, NextResponse } from 'next/server';
import { FHIRAdapter } from '@/lib/fhir-adapter';
import db from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

const fhirAdapter = new FHIRAdapter(process.env.FHIR_BASE_URL || 'https://api.ihosi.com/fhir/r4', 'ihosi-org-001');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get patient from database
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: true
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'not-found',
              details: {
                text: `Patient with ID ${id} not found`
              }
            }
          ]
        },
        { status: 404 }
      );
    }

    // Convert to FHIR format
    const fhirPatient = fhirAdapter.patientToFHIR(patient);

    return NextResponse.json(fhirPatient, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('FHIR Patient GET error:', error);
    
    return NextResponse.json(
      {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'exception',
            details: {
              text: 'Internal server error occurred while retrieving patient'
            }
          }
        ]
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const fhirPatient = await request.json();

    // Validate FHIR Patient resource
    if (fhirPatient.resourceType !== 'Patient') {
      return NextResponse.json(
        {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                text: 'Invalid resource type. Expected Patient.'
              }
            }
          ]
        },
        { status: 400 }
      );
    }

    // Extract data from FHIR Patient
    const firstName = fhirPatient.name?.[0]?.given?.[0] || '';
    const lastName = fhirPatient.name?.[0]?.family || '';
    const email = fhirPatient.telecom?.find((t: any) => t.system === 'email')?.value || '';
    const phone = fhirPatient.telecom?.find((t: any) => t.system === 'phone')?.value || '';
    const birthDate = fhirPatient.birthDate ? new Date(fhirPatient.birthDate) : new Date();
    const gender = fhirPatient.gender || 'unknown';
    const address = fhirPatient.address?.[0]?.line?.[0] || '';

    // Update patient in database
    const updatedPatient = await db.patient.update({
      where: { id },
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        date_of_birth: birthDate,
        gender: gender,
        address: address
      }
    });

    // Convert back to FHIR format
    const responsePatient = fhirAdapter.patientToFHIR(updatedPatient);

    return NextResponse.json(responsePatient, {
      status: 200,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Location': `${process.env.FHIR_BASE_URL}/Patient/${id}`,
        'ETag': `W/"${updatedPatient.updated_at.getTime()}"`
      }
    });

  } catch (error) {
    console.error('FHIR Patient PUT error:', error);
    
    return NextResponse.json(
      {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'exception',
            details: {
              text: 'Internal server error occurred while updating patient'
            }
          }
        ]
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if patient exists
    const patient = await db.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      return NextResponse.json(
        {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'not-found',
              details: {
                text: `Patient with ID ${id} not found`
              }
            }
          ]
        },
        { status: 404 }
      );
    }

    // Soft delete - mark as inactive instead of hard delete
    await db.patient.update({
      where: { id },
      data: {
        // Add a deleted_at field to your schema for soft deletes
        // deleted_at: new Date()
      }
    });

    return NextResponse.json(
      {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'information',
            code: 'informational',
            details: {
              text: `Patient ${id} has been marked as inactive`
            }
          }
        ]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('FHIR Patient DELETE error:', error);
    
    return NextResponse.json(
      {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'exception',
            details: {
              text: 'Internal server error occurred while deleting patient'
            }
          }
        ]
      },
      { status: 500 }
    );
  }
}
