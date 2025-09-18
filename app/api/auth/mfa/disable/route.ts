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

    // Disable MFA for the user
    const disableResult = await TOTPService.disableMFA(user.id, code);
    
    if (!disableResult.success) {
      return NextResponse.json(
        { error: disableResult.error || 'Failed to disable MFA' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'MFA disabled successfully'
    });

  } catch (error) {
    console.error('MFA disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable MFA' },
      { status: 500 }
    );
  }
}


