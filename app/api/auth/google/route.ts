import { NextRequest, NextResponse } from 'next/server';
import { generateGoogleOAuthURL } from '@/lib/google-calendar-service';

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return NextResponse.json(
        { error: 'Google OAuth configuration is missing. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // Generate the OAuth URL
    const authUrl = generateGoogleOAuthURL();
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}