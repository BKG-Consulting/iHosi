import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/hipaa-auth";
import { GranularConsentManager } from "@/lib/granular-consent-management";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params;
    
    // Get current user (doctor)
    const user = await getCurrentUser();
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Re-enable consent check later
    // const consentValidation = await GranularConsentManager.validateDataAccess({
    //   patientId,
    //   doctorId: user.id,
    //   dataCategory: 'DEMOGRAPHICS' as any, // Basic check
    //   accessReason: 'Patient profile access'
    // });

    // if (!consentValidation.hasConsent) {
    //   return NextResponse.json({ 
    //     error: 'No consent granted for this patient',
    //     consentRequired: true 
    //   }, { status: 403 });
    // }

    // Fetch real patient data from database
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          where: {
            doctor_id: user.id,
            status: {
              in: ['PENDING', 'SCHEDULED', 'COMPLETED']
            }
          },
          orderBy: {
            appointment_date: 'desc'
          },
          take: 10
        },
        medical: {
          orderBy: {
            created_at: 'desc'
          },
          take: 5
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Calculate age
    const calculateAge = (dateOfBirth: Date) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };

    // Transform patient data to match expected format
    const patientData = {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      age: calculateAge(patient.date_of_birth),
      gender: patient.gender,
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      emergencyContact: {
        name: patient.emergency_contact_name || 'Not provided',
        phone: patient.emergency_contact_number || '',
        relationship: patient.relation || 'Emergency Contact'
      },
      insurance: {
        provider: patient.insurance_provider || 'Not provided',
        policyNumber: patient.insurance_number || 'N/A',
        groupNumber: 'N/A'
      },
      vitals: {
        bloodPressure: '120/80', // This would come from vitals table
        heartRate: 72,
        temperature: 98.6,
        weight: 70, // kg
        height: 175, // cm
        bmi: 22.9,
        oxygenSaturation: 98,
        lastUpdated: new Date().toISOString()
      },
      allergies: patient.allergies ? patient.allergies.split(',').map(a => a.trim()) : [],
      medications: [], // This would come from medications table
      medicalHistory: patient.medical_conditions ? [{
        condition: patient.medical_conditions,
        diagnosisDate: new Date().toISOString(),
        status: 'active',
        notes: patient.medical_history || 'From patient registration',
        diagnosedBy: 'Unknown'
      }] : [],
      labResults: [], // This would come from lab results table
      imagingResults: [], // This would come from imaging table
      appointments: patient.appointments.map(apt => ({
        id: apt.id,
        date: apt.appointment_date.toISOString().split('T')[0],
        time: apt.time,
        type: apt.type || 'General',
        status: apt.status.toLowerCase(),
        notes: apt.note || ''
      })),
      consentStatus: {
        hasConsent: patient.privacy_consent && patient.medical_consent, // Use actual consent fields
        dataCategories: ["DEMOGRAPHICS", "MEDICAL_HISTORY", "ALLERGIES"],
        medicalActions: ["VIEW_MEDICAL_RECORDS"],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        restrictions: []
      },
      admissionStatus: {
        isAdmitted: false,
        ward: '',
        bed: '',
        admissionDate: '',
        admissionReason: ''
      }
    };

    return NextResponse.json(patientData);

  } catch (error) {
    console.error('Error fetching patient data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient data' },
      { status: 500 }
    );
  }
}
