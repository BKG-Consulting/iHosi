import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '@/lib/db';
import { PHIEncryption } from '@/lib/encryption';
import { logAudit } from '@/lib/audit';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password, role = 'PATIENT' } = await request.json();

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 12) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters long' },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.patient.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user based on role
    let user;
    if (role === 'PATIENT') {
      user = await db.patient.create({
        data: {
          id: crypto.randomUUID(),
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          password: hashedPassword,
          date_of_birth: new Date('1990-01-01'), // Default date, will be updated during registration
          gender: 'MALE', // Default gender, will be updated during registration
          marital_status: 'SINGLE', // Default marital status
          address: '', // Will be filled during registration
          emergency_contact_name: '',
          emergency_contact_number: '',
          relation: '',
          privacy_consent: true,
          service_consent: true,
          medical_consent: true,
          img: null,
          colorCode: `#${Math.floor(Math.random()*16777215).toString(16)}`
        }
      });
    } else {
      // For other roles, create in appropriate table
      return NextResponse.json(
        { error: 'Only patient registration is allowed through this endpoint' },
        { status: 400 }
      );
    }

    // Send verification email
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const emailResult = await EmailService.sendVerificationEmail(
      email,
      'REGISTRATION',
      ipAddress,
      userAgent
    );

    if (!emailResult.success) {
      // If email fails, still create user but mark as unverified
      console.error('Failed to send verification email:', emailResult.error);
    }

    // Log audit trail
    await logAudit({
      action: 'CREATE',
      resourceType: 'PATIENT',
      resourceId: user.id,
      reason: 'User registration',
      metadata: {
        email: user.email,
        role: role,
        registrationMethod: 'self_registration',
        emailSent: emailResult.success
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: role
      },
      message: emailResult.success 
        ? 'Account created successfully. Please check your email to verify your account.'
        : 'Account created successfully, but verification email could not be sent. Please contact support.',
      emailSent: emailResult.success
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
