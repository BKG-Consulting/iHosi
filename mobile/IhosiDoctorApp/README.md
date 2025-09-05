# iHosi Doctor App

A React Native mobile application for doctors to manage their appointments and schedule, integrated with the iHosi Healthcare Management System.

## Features

- 🔐 **Secure Authentication** - Integrated with Clerk authentication system
- 📅 **Appointment Management** - View and manage daily appointments
- 📊 **Dashboard** - Real-time overview of appointments and statistics
- 🔔 **Notifications** - Push notifications for new appointments and reminders
- 📱 **Cross-Platform** - Works on both iOS and Android
- 🎨 **Modern UI** - Clean and intuitive user interface

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the following files with your actual configuration:

#### `app.json`
```json
{
  "extra": {
    "clerkPublishableKey": "pk_test_your-actual-clerk-key"
  }
}
```

#### `src/config/constants.ts`
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-domain.com/api',
};

export const CLERK_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_your-actual-clerk-key',
};
```

### 3. Configure Clerk Authentication

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Copy your publishable key
3. Update the configuration files above
4. Ensure your Clerk app is configured for mobile authentication

### 4. Backend API Setup

Make sure your HIMS backend has the following API endpoints:

- `GET /api/doctors/{id}` - Get doctor profile
- `GET /api/doctors/{id}/appointments` - Get doctor appointments
- `GET /api/doctors/{id}/appointments?date={date}` - Get appointments for specific date
- `PATCH /api/appointments/{id}` - Update appointment status
- `POST /api/auth/verify-doctor` - Verify doctor token

### 5. Run the Application

#### For Android (using Android Studio emulator):
```bash
npm run android
```

#### For iOS (macOS only):
```bash
npm run ios
```

#### For Web (development):
```bash
npm run web
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── navigation/         # Navigation configuration
├── screens/           # App screens
├── services/          # API services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── config/            # Configuration files
```

## Authentication Flow

1. **Login**: Doctor enters credentials in the mobile app
2. **Clerk Verification**: Credentials are verified with Clerk
3. **Backend Verification**: Token is verified with HIMS backend
4. **Profile Loading**: Doctor profile and appointments are loaded
5. **Dashboard Access**: Doctor can access the main dashboard

## API Integration

The app communicates with your existing HIMS backend through REST APIs. All API calls include:

- Authentication headers
- Error handling
- Loading states
- Offline support (basic)

## Development

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add route to `src/navigation/AppNavigator.tsx`
3. Update types in `src/types/index.ts`

### Adding New API Endpoints

1. Add method to `src/services/api.ts`
2. Update types in `src/types/index.ts`
3. Use in your components

## Testing

### Android Emulator
1. Start Android Studio
2. Open AVD Manager
3. Start an emulator
4. Run `npm run android`

### Physical Device
1. Install Expo Go app
2. Run `npm start`
3. Scan QR code with Expo Go

## Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
expo build:android --type app-bundle
expo build:ios --type archive
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Android emulator not found**: Ensure Android Studio is running
3. **Authentication errors**: Check Clerk configuration
4. **API connection issues**: Verify backend URL and endpoints

### Debug Mode

Enable debug mode by adding to your environment:
```bash
export EXPO_DEBUG=true
```

## Support

For technical support, contact:
- Email: support@ihosi.com
- Documentation: [Link to docs]

## License

This project is proprietary software. All rights reserved.

