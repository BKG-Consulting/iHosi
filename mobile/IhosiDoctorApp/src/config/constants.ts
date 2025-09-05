// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://ihosi.com/api',
  TIMEOUT: 10000, // 10 seconds
};

// Clerk Configuration
export const CLERK_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_your-clerk-publishable-key-here', // Replace with your actual key
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'iHosi Doctor App',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@ihosi.com',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  CALENDAR_SYNC: 'calendar_sync_enabled',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_APPOINTMENT: 'NEW_APPOINTMENT',
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED: 'APPOINTMENT_RESCHEDULED',
};

// Appointment Status Colors
export const STATUS_COLORS = {
  PENDING: '#f59e0b',
  SCHEDULED: '#3b82f6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

// Time Formats
export const TIME_FORMATS = {
  DISPLAY: 'h:mm A',
  API: 'HH:mm',
  DATE_DISPLAY: 'MMM DD, YYYY',
  DATE_API: 'YYYY-MM-DD',
};
