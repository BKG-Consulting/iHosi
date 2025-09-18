import crypto from 'crypto';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export interface TOTPConfig {
  issuer: string;
  algorithm: 'sha1' | 'sha256' | 'sha512';
  digits: 6 | 8;
  period: number; // seconds
  window: number; // tolerance window
}

export interface MFAUser {
  id: string;
  email: string;
  role: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
}

const DEFAULT_TOTP_CONFIG: TOTPConfig = {
  issuer: 'iHosi Healthcare',
  algorithm: 'sha1',
  digits: 6,
  period: 30,
  window: 1
};

export class TOTPService {
  /**
   * Generate a new MFA secret for a user
   */
  static async generateMFASecret(userId: string, userEmail: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    try {
      // Generate a random secret (160 bits = 20 bytes)
      const secret = crypto.randomBytes(20).toString('base64');
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes(10);
      
      // Create QR code URL for authenticator apps
      const qrCodeUrl = this.generateQRCodeUrl(userEmail, secret);
      
      // Store MFA data in database
      await db.userMFA.upsert({
        where: { user_id: userId },
        update: {
          secret,
          backup_codes: backupCodes,
          is_enabled: false, // Will be enabled after verification
          created_at: new Date(),
          updated_at: new Date()
        },
        create: {
          user_id: userId,
          secret,
          backup_codes: backupCodes,
          is_enabled: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Log MFA setup initiation
      await logAudit({
        action: 'CREATE',
        resourceType: 'MFA',
        resourceId: userId,
        reason: 'MFA secret generated',
        metadata: {
          mfaMethod: 'TOTP',
          backupCodesGenerated: backupCodes.length
        }
      });

      return {
        secret,
        qrCodeUrl,
        backupCodes
      };
    } catch (error) {
      console.error('MFA secret generation failed:', error);
      throw new Error('Failed to generate MFA secret');
    }
  }

  /**
   * Verify a TOTP code
   */
  static async verifyTOTPCode(userId: string, code: string): Promise<{
    valid: boolean;
    isBackupCode: boolean;
    error?: string;
  }> {
    try {
      // Get user MFA data
      const mfaData = await db.userMFA.findUnique({
        where: { user_id: userId }
      });

      if (!mfaData || !mfaData.secret) {
        return {
          valid: false,
          isBackupCode: false,
          error: 'MFA not configured for user'
        };
      }

      // Check if it's a backup code first
      if (mfaData.backup_codes?.includes(code)) {
        // Remove used backup code
        const updatedBackupCodes = mfaData.backup_codes.filter(c => c !== code);
        await db.userMFA.update({
          where: { user_id: userId },
          data: { backup_codes: updatedBackupCodes }
        });

        // Log backup code usage
        await logAudit({
          action: 'READ',
          resourceType: 'MFA',
          resourceId: userId,
          reason: 'Backup code used for MFA verification',
          metadata: {
            mfaMethod: 'BACKUP_CODE',
            remainingBackupCodes: updatedBackupCodes.length
          }
        });

        return {
          valid: true,
          isBackupCode: true
        };
      }

      // Verify TOTP code
      const isValid = this.verifyTOTP(mfaData.secret, code);

      if (isValid) {
        // Log successful MFA verification
        await logAudit({
          action: 'READ',
          resourceType: 'MFA',
          resourceId: userId,
          reason: 'TOTP code verified successfully',
          metadata: {
            mfaMethod: 'TOTP'
          }
        });
      } else {
        // Log failed MFA attempt
        await logAudit({
          action: 'READ',
          resourceType: 'MFA',
          resourceId: userId,
          success: false,
          errorMessage: 'Invalid TOTP code',
          reason: 'MFA verification failed',
          metadata: {
            mfaMethod: 'TOTP'
          }
        });
      }

      return {
        valid: isValid,
        isBackupCode: false,
        error: isValid ? undefined : 'Invalid verification code'
      };
    } catch (error) {
      console.error('TOTP verification failed:', error);
      return {
        valid: false,
        isBackupCode: false,
        error: 'MFA verification failed'
      };
    }
  }

  /**
   * Enable MFA for a user after successful verification
   */
  static async enableMFA(userId: string, verificationCode: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify the code first
      const verification = await this.verifyTOTPCode(userId, verificationCode);
      
      if (!verification.valid) {
        return {
          success: false,
          error: verification.error || 'Invalid verification code'
        };
      }

      // Enable MFA
      await db.userMFA.update({
        where: { user_id: userId },
        data: {
          is_enabled: true,
          // enabled_at: new Date(), // Field doesn't exist in schema
          updated_at: new Date()
        }
      });

      // Update user's MFA status
      await this.updateUserMFAStatus(userId, true);

      // Log MFA enablement
      await logAudit({
        action: 'UPDATE',
        resourceType: 'MFA',
        resourceId: userId,
        reason: 'MFA enabled after successful verification',
        metadata: {
          mfaMethod: verification.isBackupCode ? 'BACKUP_CODE' : 'TOTP'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('MFA enablement failed:', error);
      return {
        success: false,
        error: 'Failed to enable MFA'
      };
    }
  }

  /**
   * Disable MFA for a user
   */
  static async disableMFA(userId: string, verificationCode: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify the code first
      const verification = await this.verifyTOTPCode(userId, verificationCode);
      
      if (!verification.valid) {
        return {
          success: false,
          error: verification.error || 'Invalid verification code'
        };
      }

      // Disable MFA
      await db.userMFA.update({
        where: { user_id: userId },
        data: {
          is_enabled: false,
          // disabled_at: new Date(), // Field doesn't exist in schema
          updated_at: new Date()
        }
      });

      // Update user's MFA status
      await this.updateUserMFAStatus(userId, false);

      // Log MFA disablement
      await logAudit({
        action: 'UPDATE',
        resourceType: 'MFA',
        resourceId: userId,
        reason: 'MFA disabled after successful verification',
        metadata: {
          mfaMethod: verification.isBackupCode ? 'BACKUP_CODE' : 'TOTP'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('MFA disablement failed:', error);
      return {
        success: false,
        error: 'Failed to disable MFA'
      };
    }
  }

  /**
   * Generate new backup codes
   */
  static async generateNewBackupCodes(userId: string): Promise<string[]> {
    try {
      const newBackupCodes = this.generateBackupCodes(10);
      
      await db.userMFA.update({
        where: { user_id: userId },
        data: {
          backup_codes: newBackupCodes,
          updated_at: new Date()
        }
      });

      // Log backup code regeneration
      await logAudit({
        action: 'UPDATE',
        resourceType: 'MFA',
        resourceId: userId,
        reason: 'New backup codes generated',
        metadata: {
          backupCodesGenerated: newBackupCodes.length
        }
      });

      return newBackupCodes;
    } catch (error) {
      console.error('Backup code generation failed:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  /**
   * Check if user has MFA enabled
   */
  static async isMFAEnabled(userId: string): Promise<boolean> {
    try {
      const mfaData = await db.userMFA.findUnique({
        where: { user_id: userId }
      });
      
      return mfaData?.is_enabled || false;
    } catch (error) {
      console.error('MFA status check failed:', error);
      return false;
    }
  }

  /**
   * Get user's MFA status and remaining backup codes
   */
  static async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    backupCodesRemaining: number;
    lastUsed?: Date;
  }> {
    try {
      const mfaData = await db.userMFA.findUnique({
        where: { user_id: userId }
      });

      return {
        enabled: mfaData?.is_enabled || false,
        backupCodesRemaining: mfaData?.backup_codes?.length || 0,
        lastUsed: undefined // Field doesn't exist in schema
      };
    } catch (error) {
      console.error('MFA status retrieval failed:', error);
      return {
        enabled: false,
        backupCodesRemaining: 0
      };
    }
  }

  // Private helper methods

  private static verifyTOTP(secret: string, code: string): boolean {
    const time = Math.floor(Date.now() / 1000);
    const timeWindow = DEFAULT_TOTP_CONFIG.period;
    const tolerance = DEFAULT_TOTP_CONFIG.window;

    // Check current and previous/next time windows
    for (let i = -tolerance; i <= tolerance; i++) {
      const timeStep = Math.floor((time + i * timeWindow) / timeWindow);
      const expectedCode = this.generateTOTPCode(secret, timeStep);
      
      if (crypto.timingSafeEqual(
        Buffer.from(code, 'utf8'),
        Buffer.from(expectedCode, 'utf8')
      )) {
        return true;
      }
    }

    return false;
  }

  private static generateTOTPCode(secret: string, timeStep: number): string {
    const key = Buffer.from(secret, 'base64');
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(timeStep, 4);

    const hmac = crypto.createHmac(DEFAULT_TOTP_CONFIG.algorithm, key);
    hmac.update(timeBuffer);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0xf;
    const code = ((digest[offset] & 0x7f) << 24) |
                 ((digest[offset + 1] & 0xff) << 16) |
                 ((digest[offset + 2] & 0xff) << 8) |
                 (digest[offset + 3] & 0xff);

    const otp = code % Math.pow(10, DEFAULT_TOTP_CONFIG.digits);
    return otp.toString().padStart(DEFAULT_TOTP_CONFIG.digits, '0');
  }

  private static generateQRCodeUrl(email: string, secret: string): string {
    const params = new URLSearchParams({
      secret,
      issuer: DEFAULT_TOTP_CONFIG.issuer,
      algorithm: DEFAULT_TOTP_CONFIG.algorithm,
      digits: DEFAULT_TOTP_CONFIG.digits.toString(),
      period: DEFAULT_TOTP_CONFIG.period.toString()
    });

    return `otpauth://totp/${encodeURIComponent(email)}?${params.toString()}`;
  }

  private static generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private static async updateUserMFAStatus(userId: string, enabled: boolean): Promise<void> {
    // Update MFA status in all user tables
    const updatePromises = [
      db.patient.updateMany({
        where: { id: userId },
        data: { mfa_enabled: enabled }
      }),
      db.doctor.updateMany({
        where: { id: userId },
        data: { mfa_enabled: enabled }
      }),
      db.staff.updateMany({
        where: { id: userId },
        data: { mfa_enabled: enabled }
      })
    ];

    await Promise.all(updatePromises);
  }
}


