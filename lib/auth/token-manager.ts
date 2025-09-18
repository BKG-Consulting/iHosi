import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  refreshFamilyId?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
  shouldRefresh?: boolean;
}

const ACCESS_TOKEN_DURATION = 60 * 60 * 1000; // 1 hour
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_TOKEN_FAMILY_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export class TokenManager {
  private static getAccessTokenSecret(): Uint8Array {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is required');
    }
    return new TextEncoder().encode(secret);
  }

  private static getRefreshTokenSecret(): Uint8Array {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a new token pair (access + refresh)
   */
  static async createTokenPair(
    userId: string,
    email: string,
    role: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<TokenPair> {
    try {
      const currentTime = Date.now();
      const now = Math.floor(currentTime / 1000);
      const accessExpiresAt = Math.floor((currentTime + ACCESS_TOKEN_DURATION) / 1000);
      const refreshExpiresAt = Math.floor((currentTime + REFRESH_TOKEN_DURATION) / 1000);

      console.log('Token creation debug:', {
        now,
        accessExpiresAt,
        refreshExpiresAt,
        ACCESS_TOKEN_DURATION,
        ACCESS_TOKEN_DURATION_SECONDS: ACCESS_TOKEN_DURATION / 1000,
        expiresInSeconds: accessExpiresAt - now,
        currentTime: new Date().toISOString(),
        expiresAtTime: new Date(accessExpiresAt * 1000).toISOString(),
        timeDifference: accessExpiresAt - now,
        expectedExpiry: now + (ACCESS_TOKEN_DURATION / 1000),
        currentTimestamp: Date.now(),
        currentTimestampSeconds: Math.floor(Date.now() / 1000),
        isExpiredImmediately: accessExpiresAt <= now
      });

      // Generate refresh token family ID for rotation tracking
      const refreshFamilyId = crypto.randomUUID();

      // Create access token
      const accessToken = await new SignJWT({
        userId,
        email,
        role,
        sessionId,
        type: 'access',
        iat: now,
        exp: accessExpiresAt
      })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(this.getAccessTokenSecret());

      // Decode the token immediately to verify expiration
      const decodedToken = decodeJwt(accessToken);
      const currentTimeForCheck = Math.floor(Date.now() / 1000);
      console.log('Created access token:', {
        accessExpiresAt,
        now,
        expiresIn: accessExpiresAt - now,
        token: accessToken.substring(0, 50) + '...',
        decodedExp: decodedToken.exp,
        decodedIat: decodedToken.iat,
        actualExpiryTime: new Date(decodedToken.exp! * 1000).toISOString(),
        currentTime: new Date().toISOString(),
        isTokenExpired: decodedToken.exp! <= currentTimeForCheck,
        timeDifference: decodedToken.exp! - currentTimeForCheck,
        manualCalculation: {
          currentTime: currentTimeForCheck,
          tokenExp: decodedToken.exp,
          difference: decodedToken.exp! - currentTimeForCheck,
          shouldBeValid: decodedToken.exp! > currentTimeForCheck
        }
      });

      // Create refresh token
      const refreshToken = await new SignJWT({
        userId,
        email,
        role,
        sessionId,
        type: 'refresh',
        refreshFamilyId,
        iat: now,
        exp: refreshExpiresAt
      })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(this.getRefreshTokenSecret());

      // Store refresh token in database for rotation tracking
      await db.refreshToken.create({
        data: {
          token: refreshToken,
          user_id: userId,
          session_id: sessionId,
          token_family_id: refreshFamilyId,
          ip_address: ipAddress,
          user_agent: userAgent,
          expires_at: new Date(refreshExpiresAt * 1000), // Convert Unix timestamp to Date
          is_revoked: false
        }
      });

      // Log token creation
      await logAudit({
        action: 'CREATE',
        resourceType: 'AUTH',
        resourceId: sessionId,
        reason: 'Token pair created',
        metadata: {
          userId,
          role,
          ipAddress,
          tokenType: 'ACCESS_AND_REFRESH',
          accessTokenExpiry: accessExpiresAt,
          refreshTokenExpiry: refreshExpiresAt
        }
      });

      return {
        accessToken,
        refreshToken,
        expiresAt: new Date(accessExpiresAt * 1000)
      };
    } catch (error) {
      console.error('Token creation failed:', error);
      throw new Error('Failed to create authentication tokens');
    }
  }

  /**
   * Verify and decode an access token
   */
  static async verifyAccessToken(token: string): Promise<TokenValidationResult> {
    try {
      // First decode without verification to check expiration
      const decoded = decodeJwt(token);
      
      // Check if token is expired before verification
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        console.log('Token expired:', { 
          exp: decoded.exp, 
          now, 
          diff: now - decoded.exp,
          token: token.substring(0, 50) + '...'
        });
        return {
          valid: false,
          error: 'Token expired',
          shouldRefresh: true
        };
      }

      // If not expired, verify the signature
      const { payload } = await jwtVerify(token, this.getAccessTokenSecret());
      
      // Validate token structure
      if (payload.type !== 'access') {
        return {
          valid: false,
          error: 'Invalid token type'
        };
      }

      // Verify session is still active
      const session = await db.userSession.findFirst({
        where: {
          session_token: payload.sessionId as string,
          user_id: payload.userId as string,
          is_active: true,
          expires_at: { gt: new Date() }
        }
      });

      if (!session) {
        return {
          valid: false,
          error: 'Session not found or expired'
        };
      }

      return {
        valid: true,
        payload: payload as unknown as TokenPayload
      };
    } catch (error) {
      console.error('Access token verification failed:', error);
      
      // If we get here, it's likely a signature verification error
      return {
        valid: false,
        error: 'Invalid access token'
      };
    }
  }

  /**
   * Verify and decode a refresh token
   */
  static async verifyRefreshToken(token: string): Promise<TokenValidationResult> {
    try {
      const { payload } = await jwtVerify(token, this.getRefreshTokenSecret());
      
      // Validate token structure
      if (payload.type !== 'refresh') {
        return {
          valid: false,
          error: 'Invalid token type'
        };
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return {
          valid: false,
          error: 'Refresh token expired'
        };
      }

      // Verify refresh token exists in database and is active
      const refreshTokenRecord = await db.refreshToken.findFirst({
        where: {
          token_family_id: payload.refreshFamilyId as string,
          user_id: payload.userId as string,
          is_revoked: false,
          expires_at: { gt: new Date() }
        }
      });

      if (!refreshTokenRecord) {
        return {
          valid: false,
          error: 'Refresh token not found or revoked'
        };
      }

      return {
        valid: true,
        payload: payload as unknown as TokenPayload
      };
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return {
        valid: false,
        error: 'Invalid refresh token'
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    refreshToken: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{
    success: boolean;
    accessToken?: string;
    newRefreshToken?: string;
    expiresAt?: Date;
    error?: string;
  }> {
    try {
      // Verify refresh token
      const refreshValidation = await this.verifyRefreshToken(refreshToken);
      
      if (!refreshValidation.valid || !refreshValidation.payload) {
        return {
          success: false,
          error: refreshValidation.error || 'Invalid refresh token'
        };
      }

      const { userId, email, role, sessionId, refreshFamilyId } = refreshValidation.payload;

      // Check for token family rotation (security measure)
      const refreshTokenRecord = await db.refreshToken.findFirst({
        where: {
          token_family_id: refreshFamilyId as string,
          user_id: userId,
          is_revoked: false
        }
      });

      if (!refreshTokenRecord) {
        return {
          success: false,
          error: 'Refresh token not found'
        };
      }

      // Create new access token
      const currentTime = Date.now();
      const now = Math.floor(currentTime / 1000);
      const accessExpiresAt = Math.floor((currentTime + ACCESS_TOKEN_DURATION) / 1000);

      const newAccessToken = await new SignJWT({
        userId,
        email,
        role,
        sessionId,
        type: 'access',
        iat: now,
        exp: accessExpiresAt
      })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(this.getAccessTokenSecret());

      // Rotate refresh token (create new one, invalidate old one)
      const newRefreshFamilyId = crypto.randomUUID();
      const refreshExpiresAt = Math.floor((currentTime + REFRESH_TOKEN_DURATION) / 1000);

      const newRefreshToken = await new SignJWT({
        userId,
        email,
        role,
        sessionId,
        type: 'refresh',
        refreshFamilyId: newRefreshFamilyId,
        iat: now,
        exp: refreshExpiresAt
      })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(this.getRefreshTokenSecret());

      // Invalidate old refresh token
      await db.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: {
          is_revoked: true,
          revoked_at: new Date(),
          revoke_reason: 'Token rotation'
        }
      });

      // Store new refresh token
      await db.refreshToken.create({
        data: {
          token: newRefreshToken,
          user_id: userId,
          session_id: sessionId,
          token_family_id: newRefreshFamilyId,
          ip_address: ipAddress,
          user_agent: userAgent,
          expires_at: new Date(refreshExpiresAt * 1000), // Convert Unix timestamp to Date
          is_revoked: false
        }
      });

      // Log token refresh
      await logAudit({
        action: 'UPDATE',
        resourceType: 'AUTH',
        resourceId: sessionId,
        reason: 'Access token refreshed',
        metadata: {
          userId,
          role,
          ipAddress,
          oldRefreshTokenId: refreshTokenRecord.id,
          newRefreshTokenId: newRefreshFamilyId
        }
      });

      return {
        success: true,
        accessToken: newAccessToken,
        newRefreshToken,
        expiresAt: new Date(accessExpiresAt * 1000)
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return {
        success: false,
        error: 'Failed to refresh token'
      };
    }
  }

  /**
   * Revoke all tokens for a user (logout)
   */
  static async revokeAllUserTokens(
    userId: string,
    sessionId?: string,
    reason: string = 'User logout'
  ): Promise<void> {
    try {
      // Revoke all active refresh tokens for the user
      await db.refreshToken.updateMany({
        where: {
          user_id: userId,
          is_revoked: false,
          ...(sessionId && { session_id: sessionId })
        },
        data: {
          is_revoked: true,
          revoked_at: new Date(),
          revoke_reason: reason
        }
      });

      // Deactivate user session
      if (sessionId) {
        await db.userSession.updateMany({
          where: {
            session_token: sessionId,
            user_id: userId
          },
          data: {
            is_active: false,
            logout_reason: reason
          }
        });
      }

      // Log token revocation
      await logAudit({
        action: 'DELETE',
        resourceType: 'AUTH',
        resourceId: userId,
        reason: `All tokens revoked: ${reason}`,
        metadata: {
          userId,
          sessionId,
          reason
        }
      });
    } catch (error) {
      console.error('Token revocation failed:', error);
      throw new Error('Failed to revoke tokens');
    }
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  static async cleanupExpiredTokens(): Promise<{
    refreshTokensDeleted: number;
    sessionsDeactivated: number;
  }> {
    try {
      const now = new Date();

      // Delete expired refresh tokens
      const expiredRefreshTokens = await db.refreshToken.deleteMany({
        where: {
          expires_at: { lt: now }
        }
      });

      // Deactivate expired sessions
      const expiredSessions = await db.userSession.updateMany({
        where: {
          expires_at: { lt: now },
          is_active: true
        },
        data: {
          is_active: false,
          logout_reason: 'Session expired'
        }
      });

      // Log cleanup
      await logAudit({
        action: 'DELETE',
        resourceType: 'SYSTEM',
        resourceId: 'TOKEN_CLEANUP',
        reason: 'Expired tokens and sessions cleaned up',
        metadata: {
          refreshTokensDeleted: expiredRefreshTokens.count,
          sessionsDeactivated: expiredSessions.count
        }
      });

      return {
        refreshTokensDeleted: expiredRefreshTokens.count,
        sessionsDeactivated: expiredSessions.count
      };
    } catch (error) {
      console.error('Token cleanup failed:', error);
      throw new Error('Failed to cleanup expired tokens');
    }
  }

  /**
   * Get active sessions for a user
   */
  static async getUserActiveSessions(userId: string): Promise<Array<{
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
  }>> {
    try {
      const sessions = await db.userSession.findMany({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: { gt: new Date() }
        },
        select: {
          session_token: true,
          ip_address: true,
          user_agent: true,
          created_at: true,
          last_activity: true,
          expires_at: true
        },
        orderBy: { last_activity: 'desc' }
      });

      return sessions.map(session => ({
        sessionId: session.session_token,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        createdAt: session.created_at,
        lastActivity: session.last_activity,
        expiresAt: session.expires_at
      }));
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

}
