import { NextRequest, NextResponse } from 'next/server';
import { TOTPService } from '@/lib/mfa/totp-service';
import { getCurrentUser } from '@/lib/auth/hipaa-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get MFA status
    const mfaStatus = await TOTPService.getMFAStatus(user.id);

    return NextResponse.json({
      success: true,
      mfa: mfaStatus
    });

  } catch (error) {
    console.error('MFA status error:', error);
    return NextResponse.json(
      { error: 'Failed to get MFA status' },
      { status: 500 }
    );
  }
}


