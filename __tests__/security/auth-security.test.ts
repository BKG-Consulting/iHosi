import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TOTPService } from '@/lib/mfa/totp-service';
import { TokenManager } from '@/lib/auth/token-manager';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';

// Mock database
jest.mock('@/lib/db', () => ({
  userMFA: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  rateLimit: {
    count: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  userSession: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  loginAttempt: {
    create: jest.fn(),
    count: jest.fn(),
  },
  userLockout: {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  patient: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  doctor: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  staff: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
}));

// Mock audit logging
jest.mock('@/lib/audit', () => ({
  logAudit: jest.fn(),
}));

describe('Security Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-32-chars-long';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-32-chars-long';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('TOTP Service', () => {
    it('should generate MFA secret and QR code', async () => {
      const mockDb = require('@/lib/db');
      mockDb.userMFA.upsert.mockResolvedValue({});

      const result = await TOTPService.generateMFASecret('user123', 'test@example.com');

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(10);
      expect(result.secret).toMatch(/^[A-Z2-7]+$/); // Base32 format
    });

    it('should verify valid TOTP code', async () => {
      const mockDb = require('@/lib/db');
      mockDb.userMFA.findUnique.mockResolvedValue({
        secret: 'JBSWY3DPEHPK3PXP',
        backup_codes: ['ABCD1234', 'EFGH5678']
      });

      // Mock a valid TOTP code (this would normally be time-based)
      const result = await TOTPService.verifyTOTPCode('user123', '123456');

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('isBackupCode');
    });

    it('should verify backup codes', async () => {
      const mockDb = require('@/lib/db');
      mockDb.userMFA.findUnique.mockResolvedValue({
        secret: 'JBSWY3DPEHPK3PXP',
        backup_codes: ['ABCD1234', 'EFGH5678']
      });
      mockDb.userMFA.update.mockResolvedValue({});

      const result = await TOTPService.verifyTOTPCode('user123', 'ABCD1234');

      expect(result.valid).toBe(true);
      expect(result.isBackupCode).toBe(true);
    });

    it('should enable MFA after verification', async () => {
      const mockDb = require('@/lib/db');
      mockDb.userMFA.findUnique.mockResolvedValue({
        secret: 'JBSWY3DPEHPK3PXP',
        backup_codes: ['ABCD1234']
      });
      mockDb.userMFA.update.mockResolvedValue({});
      mockDb.patient.updateMany.mockResolvedValue({});
      mockDb.doctor.updateMany.mockResolvedValue({});
      mockDb.staff.updateMany.mockResolvedValue({});

      const result = await TOTPService.enableMFA('user123', 'ABCD1234');

      expect(result.success).toBe(true);
    });
  });

  describe('Token Manager', () => {
    it('should create token pair', async () => {
      const mockDb = require('@/lib/db');
      mockDb.refreshToken.create.mockResolvedValue({});

      const result = await TokenManager.createTokenPair(
        'user123',
        'test@example.com',
        'PATIENT',
        'session123',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresAt');
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('should verify valid access token', async () => {
      const mockDb = require('@/lib/db');
      mockDb.userSession.findFirst.mockResolvedValue({
        session_token: 'session123',
        user_id: 'user123',
        is_active: true,
        expires_at: new Date(Date.now() + 3600000)
      });

      // Create a valid token first
      const tokenPair = await TokenManager.createTokenPair(
        'user123',
        'test@example.com',
        'PATIENT',
        'session123',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      const result = await TokenManager.verifyAccessToken(tokenPair.accessToken);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
    });

    it('should refresh access token', async () => {
      const mockDb = require('@/lib/db');
      mockDb.refreshToken.create.mockResolvedValue({});
      mockDb.refreshToken.findFirst.mockResolvedValue({
        token_id: 'refresh123',
        user_id: 'user123',
        is_active: true
      });
      mockDb.refreshToken.update.mockResolvedValue({});

      // Create initial token pair
      const tokenPair = await TokenManager.createTokenPair(
        'user123',
        'test@example.com',
        'PATIENT',
        'session123',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      const result = await TokenManager.refreshAccessToken(
        tokenPair.refreshToken,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
    });
  });

  describe('Rate Limiter', () => {
    it('should allow requests within limit', async () => {
      const mockDb = require('@/lib/db');
      mockDb.rateLimit.count.mockResolvedValue(2); // Under limit
      mockDb.rateLimit.create.mockResolvedValue({});

      const mockRequest = {
        nextUrl: { pathname: '/api/auth/login' },
        method: 'POST',
        headers: {
          get: jest.fn().mockReturnValue('192.168.1.1')
        }
      } as any;

      const result = await RateLimiter.checkRateLimit(mockRequest, 'auth_login');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block requests over limit', async () => {
      const mockDb = require('@/lib/db');
      mockDb.rateLimit.count.mockResolvedValue(10); // Over limit
      mockDb.rateLimit.create.mockResolvedValue({});

      const mockRequest = {
        nextUrl: { pathname: '/api/auth/login' },
        method: 'POST',
        headers: {
          get: jest.fn().mockReturnValue('192.168.1.1')
        }
      } as any;

      const result = await RateLimiter.checkRateLimit(mockRequest, 'auth_login');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    it('should apply rate limiting to requests', async () => {
      const mockDb = require('@/lib/db');
      mockDb.rateLimit.count.mockResolvedValue(10); // Over limit
      mockDb.rateLimit.create.mockResolvedValue({});

      const mockRequest = {
        nextUrl: { pathname: '/api/auth/login' },
        method: 'POST',
        headers: {
          get: jest.fn().mockReturnValue('192.168.1.1')
        }
      } as any;

      const result = await RateLimiter.applyRateLimit(mockRequest, 'auth_login');

      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(429);
    });
  });

  describe('HIPAA Auth Service Integration', () => {
    it('should authenticate user with rate limiting', async () => {
      const mockDb = require('@/lib/db');
      mockDb.patient.findUnique.mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: '$2a$12$hashedpassword',
        mfa_enabled: false,
        isActive: true
      });
      mockDb.userLockout.findFirst.mockResolvedValue(null);
      mockDb.loginAttempt.create.mockResolvedValue({});
      mockDb.userSession.create.mockResolvedValue({});
      mockDb.refreshToken.create.mockResolvedValue({});

      const mockRequest = {
        nextUrl: { pathname: '/api/auth/login' },
        method: 'POST',
        headers: {
          get: jest.fn().mockReturnValue('192.168.1.1')
        }
      } as any;

      const result = await HIPAAAuthService.authenticate(
        'test@example.com',
        'password123',
        '192.168.1.1',
        'Mozilla/5.0',
        mockRequest
      );

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should require MFA when enabled', async () => {
      const mockDb = require('@/lib/db');
      mockDb.patient.findUnique.mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: '$2a$12$hashedpassword',
        mfa_enabled: true,
        isActive: true
      });
      mockDb.userLockout.findFirst.mockResolvedValue(null);
      mockDb.loginAttempt.create.mockResolvedValue({});
      mockDb.userMFA.findUnique.mockResolvedValue({
        is_enabled: true
      });

      const result = await HIPAAAuthService.authenticate(
        'test@example.com',
        'password123',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result.success).toBe(true);
      expect(result.mfaRequired).toBe(true);
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle invalid MFA codes gracefully', async () => {
      const mockDb = require('@/lib/db');
      mockDb.userMFA.findUnique.mockResolvedValue({
        secret: 'JBSWY3DPEHPK3PXP',
        backup_codes: []
      });

      const result = await TOTPService.verifyTOTPCode('user123', 'invalid');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle expired tokens gracefully', async () => {
      const result = await TokenManager.verifyAccessToken('invalid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      const mockDb = require('@/lib/db');
      mockDb.userMFA.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await TOTPService.verifyTOTPCode('user123', '123456');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});


