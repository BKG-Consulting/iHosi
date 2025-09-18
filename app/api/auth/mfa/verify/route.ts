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

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Verify the MFA code
    const verification = await TOTPService.verifyTOTPCode(user.id, code);
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable MFA for the user
    const enableResult = await TOTPService.enableMFA(user.id, code);
    
    if (!enableResult.success) {
      return NextResponse.json(
        { error: enableResult.error || 'Failed to enable MFA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'MFA enabled successfully',
      isBackupCode: verification.isBackupCode
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify MFA' },
      { status: 500 }
    );
  }
}


