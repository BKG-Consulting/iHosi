# Google Calendar Integration Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `ihosi-healthcare-calendar`
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Ihosi Healthcare Management System`
     - User support email: your email
     - Developer contact: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Add test users (your email for testing)

4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: `Ihosi Healthcare Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)

5. Click "Create" and copy the Client ID and Client Secret

## Step 4: Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# For production, update the redirect URI to your domain
# GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Go to the doctor dashboard
3. Navigate to the Schedule tab
4. Click "Connect" on the Google Calendar integration
5. Complete the OAuth flow
6. Test creating an appointment to see it sync to Google Calendar

## Production Deployment

When deploying to production:

1. Update the OAuth consent screen to "Production"
2. Add your production domain to authorized origins and redirect URIs
3. Update environment variables with production URLs
4. Ensure your domain is verified in Google Search Console (recommended)

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch"**: Check that your redirect URI exactly matches what's configured in Google Console
2. **"access_denied"**: Ensure the OAuth consent screen is properly configured
3. **"invalid_client"**: Verify your Client ID and Secret are correct
4. **API not enabled**: Make sure Google Calendar API is enabled in your project

### Testing OAuth Flow:

You can test the OAuth URL generation by visiting:
`http://localhost:3000/api/auth/google` (once the API route is created)

## Security Notes

- Never commit your Client Secret to version control
- Use environment variables for all sensitive data
- Regularly rotate your OAuth credentials
- Monitor API usage in Google Cloud Console
- Implement proper error handling for OAuth failures


