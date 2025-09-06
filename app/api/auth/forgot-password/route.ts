import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    let user = await db.patient.findUnique({
      where: { email }
    });

    if (!user) {
      // Check in other tables
      const doctor = await db.doctor.findUnique({
        where: { email }
      });
      if (doctor) {
        user = {
          id: doctor.id,
          email: doctor.email,
          first_name: doctor.name.split(' ')[0] || '',
          last_name: doctor.name.split(' ').slice(1).join(' ') || ''
        } as any;
      }
    }

    if (!user) {
      const staff = await db.staff.findUnique({
        where: { email }
      });
      if (staff) {
        user = {
          id: staff.id,
          email: staff.email,
          first_name: staff.name.split(' ')[0] || '',
          last_name: staff.name.split(' ').slice(1).join(' ') || ''
        } as any;
      }
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Send password reset email using EmailService
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const emailResult = await EmailService.sendVerificationEmail(
      email,
      'PASSWORD_RESET',
      ipAddress,
      userAgent
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
    }

    // Log audit trail
    await logAudit({
      action: 'UPDATE',
      resourceType: 'AUTH',
      resourceId: user.id,
      reason: 'Password reset requested',
      metadata: {
        email: user.email,
        emailSent: emailResult.success
      }
    });

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
