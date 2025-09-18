import { NextRequest, NextResponse } from 'next/server';
import { TOTPService } from '@/lib/mfa/totp-service';
import { getCurrentUser } from '@/lib/auth/hipaa-auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate MFA secret and QR code
    const mfaData = await TOTPService.generateMFASecret(user.id, email);

    return NextResponse.json({
      success: true,
      secret: mfaData.secret,
      qrCodeUrl: mfaData.qrCodeUrl,
      backupCodes: mfaData.backupCodes,
      message: 'MFA setup initiated. Please verify with your authenticator app.'
    });

  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup MFA' },
      { status: 500 }
    );
  }
}


