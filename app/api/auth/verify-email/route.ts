import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const { token, type } = await request.json();

    if (!token || !type) {
      return NextResponse.json(
        { error: 'Token and type are required' },
        { status: 400 }
      );
    }

    // Verify the token
    const result = await EmailService.verifyToken(token, type as 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE' | 'MFA_SETUP');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log successful verification
    await logAudit({
      action: 'UPDATE',
      resourceType: 'AUTH',
      resourceId: result.email!,
      reason: `Email verified for ${type.toLowerCase()}`,
      metadata: {
        email: result.email,
        type,
        verified: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: result.email
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token || !type) {
      return NextResponse.json(
        { error: 'Token and type are required' },
        { status: 400 }
      );
    }

    // Verify the token
    const result = await EmailService.verifyToken(token, type as 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE' | 'MFA_SETUP');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log successful verification
    await logAudit({
      action: 'UPDATE',
      resourceType: 'AUTH',
      resourceId: result.email!,
      reason: `Email verified for ${type.toLowerCase()}`,
      metadata: {
        email: result.email,
        type,
        verified: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: result.email
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
