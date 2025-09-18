import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@/lib/security/csrf-protection';
import { SecurityMiddleware } from '@/lib/security/security-middleware';

export async function GET(request: NextRequest) {
  try {
    // Generate CSRF token
    const token = await CSRFProtection.setCSRFToken();
    
    // Apply security headers
    const response = NextResponse.json({
      success: true,
      token,
      message: 'CSRF token generated successfully'
    });

    return SecurityMiddleware.applySecurityHeaders(response);

  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate CSRF token',
        success: false 
      },
      { status: 500 }
    );
  }
}




