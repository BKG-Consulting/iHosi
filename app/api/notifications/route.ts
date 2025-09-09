import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import db from '@/lib/db';

// Simple polling-based notification system
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lastCheck = searchParams.get('lastCheck');
    // For the first check or if lastCheck is invalid, look back 1 hour to catch any missed notifications
    const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 3600000); // Default to 1 hour ago

    let notifications: any[] = [];

    if (user.role === 'DOCTOR') {
      console.log(`🔍 Checking for new appointments for doctor ${user.id} since ${lastCheckDate.toISOString()}`);
      
      // First, let's check all appointments for this doctor to debug
      const allAppointments = await db.appointment.findMany({
        where: {
          doctor_id: user.id
        },
        select: {
          id: true,
          status: true,
          created_at: true,
          appointment_date: true,
          time: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      });
      
      console.log(`🔍 All recent appointments for doctor ${user.id}:`, allAppointments);
      console.log(`🔍 Time comparison - lastCheckDate: ${lastCheckDate.toISOString()}, Current time: ${new Date().toISOString()}`);
      
      // Get new appointment requests for this doctor
      const newAppointments = await db.appointment.findMany({
        where: {
          doctor_id: user.id,
          status: 'PENDING',
          created_at: {
            gte: lastCheckDate
          }
        },
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log(`🔍 Found ${newAppointments.length} new appointments for doctor ${user.id}`);

      notifications = newAppointments.map(apt => ({
        id: `appointment_request_${apt.id}`,
        type: 'appointment_request',
        title: 'New Appointment Request',
        message: `${apt.patient.first_name} ${apt.patient.last_name} has requested an appointment for ${apt.appointment_date.toISOString().split('T')[0]} at ${apt.time}`,
        timestamp: apt.created_at,
        data: {
          appointmentId: apt.id,
          patientId: apt.patient_id,
          patientName: `${apt.patient.first_name} ${apt.patient.last_name}`,
          appointmentDate: apt.appointment_date.toISOString().split('T')[0],
          appointmentTime: apt.time,
          appointmentType: apt.type,
          reason: apt.reason,
          note: apt.note
        }
      }));
    } else if (user.role === 'PATIENT') {
      // Get new appointment confirmations for this patient
      const newConfirmations = await db.appointment.findMany({
        where: {
          patient_id: user.id,
          status: 'SCHEDULED',
          updated_at: {
            gte: lastCheckDate
          }
        },
        include: {
          doctor: {
            select: {
              name: true,
              specialization: true
            }
          }
        },
        orderBy: {
          updated_at: 'desc'
        }
      });

      notifications = newConfirmations.map(apt => ({
        id: `appointment_scheduled_${apt.id}`,
        type: 'appointment_scheduled',
        title: 'Appointment Scheduled',
        message: `Your appointment with Dr. ${apt.doctor.name} has been scheduled for ${apt.appointment_date.toISOString().split('T')[0]} at ${apt.time}`,
        timestamp: apt.updated_at,
        data: {
          appointmentId: apt.id,
          doctorId: apt.doctor_id,
          doctorName: apt.doctor.name,
          appointmentDate: apt.appointment_date.toISOString().split('T')[0],
          appointmentTime: apt.time,
          appointmentType: apt.type
        }
      }));
    }

    console.log(`🔔 Returning ${notifications.length} notifications for ${user.role} ${user.id}`);
    
    return NextResponse.json({
      notifications,
      isConnected: true,
      lastCheck: new Date().toISOString(),
      message: 'Polling-based notifications active'
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
