import { NextRequest, NextResponse } from 'next/server';
import { FHIRAdapter } from '@/lib/fhir-adapter';
import db from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

const fhirAdapter = new FHIRAdapter(process.env.FHIR_BASE_URL || 'https://api.ihosi.com/fhir/r4', 'ihosi-org-001');

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse search parameters
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const birthdate = searchParams.get('birthdate');
    const gender = searchParams.get('gender');
    const _count = parseInt(searchParams.get('_count') || '10');
    const _offset = parseInt(searchParams.get('_offset') || '0');

    // Build where clause
    const whereClause: any = {};

    if (name) {
      whereClause.OR = [
        { first_name: { contains: name, mode: 'insensitive' } },
        { last_name: { contains: name, mode: 'insensitive' } }
      ];
    }

    if (birthdate) {
      whereClause.date_of_birth = new Date(birthdate);
    }

    if (gender) {
      whereClause.gender = gender;
    }

    // Get patients from database
    const [patients, total] = await Promise.all([
      db.patient.findMany({
        where: whereClause,
        skip: _offset,
        take: _count,
        orderBy: { first_name: 'asc' }
      }),
      db.patient.count({ where: whereClause })
    ]);

    // Convert to FHIR format
    const fhirPatients = patients.map(patient => fhirAdapter.patientToFHIR(patient));

    // Create FHIR Bundle
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: total,
      link: [
        {
          relation: 'self',
          url: request.url
        }
      ],
      entry: fhirPatients.map(patient => ({
        resource: patient,
        fullUrl: `${process.env.FHIR_BASE_URL}/Patient/${patient.id}`
      }))
    };

    return NextResponse.json(bundle, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('FHIR Patient search error:', error);
    
    return NextResponse.json(
      {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'exception',
            details: {
              text: 'Internal server error occurred while searching patients'
            }
          }
        ]
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Create patient in database
    const newPatient = await db.patient.create({
      data: {
        id: crypto.randomUUID(),
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        date_of_birth: birthDate,
        gender: gender,
        marital_status: 'SINGLE', // Default value
        address: address,
        emergency_contact_name: '',
        emergency_contact_number: '',
        relation: '',
        privacy_consent: true,
        service_consent: true,
        medical_consent: true,
        img: null,
        colorCode: `#${Math.floor(Math.random()*16777215).toString(16)}` // Generate random color
      }
    });

    // Convert back to FHIR format
    const responsePatient = fhirAdapter.patientToFHIR(newPatient);

    return NextResponse.json(responsePatient, {
      status: 201,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Location': `${process.env.FHIR_BASE_URL}/Patient/${newPatient.id}`,
        'ETag': `W/"${newPatient.created_at.getTime()}"`
      }
    });

  } catch (error) {
    console.error('FHIR Patient POST error:', error);
    
    return NextResponse.json(
      {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'exception',
            details: {
              text: 'Internal server error occurred while creating patient'
            }
          }
        ]
      },
      { status: 500 }
    );
  }
}
