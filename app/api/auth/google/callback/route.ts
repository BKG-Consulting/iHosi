import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/doctor?error=oauth_denied', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/doctor?error=no_code', request.url));
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Store the tokens in the database
    await prisma.calendarIntegration.upsert({
      where: {
        doctor_id: userId,
        provider: 'GOOGLE_CALENDAR'
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        is_active: true,
        last_sync_at: new Date(),
      },
      create: {
        doctor_id: userId,
        provider: 'GOOGLE_CALENDAR',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        is_active: true,
        last_sync_at: new Date(),
      }
    });

    // Redirect back to doctor dashboard with success message
    return NextResponse.redirect(new URL('/doctor?success=calendar_connected', request.url));

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(new URL('/doctor?error=oauth_failed', request.url));
  }
}