// Jest setup file
import '@testing-library/jest-dom'

// Mock environment variables
process.env.PHI_ENCRYPTION_KEY = '39d653047162e71ce614d357feffe818e6a2630602c29c0c85edb00401a56d67'
process.env.PHI_ENCRYPTION_SALT = 'healthcare-system-salt'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    sessionClaims: {
      metadata: {
        role: 'patient',
      },
    },
  }),
}))

// Mock Clerk server-side
jest.mock('@clerk/nextjs/server', () => ({
  clerkClient: jest.fn(() => ({
    users: {
      createUser: jest.fn(),
      updateUser: jest.fn(),
    },
  })),
  auth: jest.fn(() => ({
    userId: 'test-user-id',
    sessionClaims: {
      metadata: {
        role: 'patient',
      },
    },
  })),
}))

// Mock database
jest.mock('@/lib/db', () => ({
  patient: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}))

// Mock encryption module
jest.mock('@/lib/encryption', () => ({
  PHIEncryption: {
    encryptPatientData: jest.fn((data) => ({
      ...data,
      phone: 'encrypted-phone',
      email: 'encrypted-email',
      address: 'encrypted-address',
      emergency_contact_number: 'encrypted-ecn',
      insurance_number: 'encrypted-insurance',
      medical_history: 'encrypted-history',
      allergies: 'encrypted-allergies',
      medical_conditions: 'encrypted-conditions',
    })),
    decryptPatientData: jest.fn((data) => ({
      ...data,
      phone: '1234567890',
      email: 'john.doe@example.com',
      address: '123 Main St',
      emergency_contact_number: '0987654321',
      insurance_number: 'BC123456',
      medical_history: 'None',
      allergies: 'Penicillin',
      medical_conditions: 'Hypertension',
    })),
  },
}))

// Mock Next.js headers function
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn(() => 'test-user-agent'),
  })),
}))

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}
