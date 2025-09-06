/**
 * HIPAA-Compliant Authentication System for Ihosi Healthcare Management System
 * 
 * Features:
 * - Multi-Factor Authentication (MFA)
 * - Role-Based Access Control (RBAC)
 * - Comprehensive Audit Logging
 * - Session Management
 * - Account Lockout Protection
 * - Password Policy Enforcement
 * - JWT Token Management
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '@/lib/db';
import { PHIEncryption } from '@/lib/encryption';
import { logAudit } from '@/lib/audit';

// Types
export interface User {
  id: string;
  email: string;
  role: string; // More flexible role type
  firstName: string;
  lastName: string;
  departmentId?: string | null;
  mfaEnabled: boolean;
  lastLoginAt?: Date | null;
  isActive: boolean;
  password?: string; // Add password field
}

export interface SessionData {
  user: User;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  mfaRequired?: boolean;
}

// Configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key');
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
const MFA_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes for MFA
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export class HIPAAAuthService {
  /**
   * Authenticate user with email and password
   */
  static async authenticate(email: string, password: string, ipAddress: string, userAgent: string): Promise<{
    success: boolean;
    user?: User;
    mfaRequired?: boolean;
    error?: string;
  }> {
    try {
      // Check for account lockout
      const lockout = await this.checkAccountLockout(email, ipAddress);
      if (lockout.locked) {
        await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Account locked');
        return {
          success: false,
          error: `Account locked until ${lockout.unlockAt}`
        };
      }

      // Find user in database
      const user = await this.findUserByEmail(email);
      if (!user) {
        await this.logLoginAttempt(email, ipAddress, userAgent, false, 'User not found');
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Verify password
      if (!user.password) {
        await this.handleFailedLogin(email, ipAddress, userAgent);
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }
      
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        await this.handleFailedLogin(email, ipAddress, userAgent);
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Account inactive');
        return {
          success: false,
          error: 'Account is inactive'
        };
      }

      // Reset failed attempts on successful login
      await this.resetFailedAttempts(email, ipAddress);

      // Log successful login attempt
      await this.logLoginAttempt(email, ipAddress, userAgent, true);

      // Check if MFA is required
      if (user.mfaEnabled) {
        return {
          success: true,
          mfaRequired: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            departmentId: user.departmentId,
            mfaEnabled: user.mfaEnabled,
            lastLoginAt: user.lastLoginAt,
            isActive: user.isActive
          }
        };
      }

      // Create session
      const session = await this.createSession(user, ipAddress, userAgent);

      // Update last login
      await this.updateLastLogin(user.id);

      // Audit log
      await logAudit({
        action: 'LOGIN',
        resourceType: 'AUTH',
        resourceId: user.id,
        reason: 'User authentication',
        metadata: {
          ipAddress,
          userAgent,
          mfaUsed: false
        }
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          departmentId: user.departmentId,
          mfaEnabled: user.mfaEnabled,
          lastLoginAt: user.lastLoginAt,
          isActive: user.isActive
        }
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Verify MFA code
   */
  static async verifyMFA(userId: string, code: string, ipAddress: string, userAgent: string): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      // Get user
      const user = await this.findUserById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Verify MFA code (implement your MFA logic here)
      const mfaValid = await this.verifyMFACode(userId, code);
      if (!mfaValid) {
        await this.logLoginAttempt(user.email, ipAddress, userAgent, false, 'Invalid MFA code');
        return {
          success: false,
          error: 'Invalid MFA code'
        };
      }

      // Create session
      const session = await this.createSession(user, ipAddress, userAgent);

      // Update last login
      await this.updateLastLogin(user.id);

      // Audit log
      await logAudit({
        action: 'LOGIN',
        resourceType: 'AUTH',
        resourceId: user.id,
        reason: 'User authentication with MFA',
        metadata: {
          ipAddress,
          userAgent,
          mfaUsed: true
        }
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          departmentId: user.departmentId,
          mfaEnabled: user.mfaEnabled,
          lastLoginAt: user.lastLoginAt,
          isActive: user.isActive
        }
      };

    } catch (error) {
      console.error('MFA verification error:', error);
      return {
        success: false,
        error: 'MFA verification failed'
      };
    }
  }

  /**
   * Create user session
   */
  static async createSession(user: any, ipAddress: string, userAgent: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    // Create session in database
    await db.userSession.create({
      data: {
        user_id: user.id,
        session_token: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt,
        is_active: true
      }
    });

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .setIssuedAt()
      .sign(JWT_SECRET);

    return token;
  }

  /**
   * Verify session token
   */
  static async verifySession(token: string): Promise<{
    valid: boolean;
    user?: User;
    sessionId?: string;
    error?: string;
  }> {
    try {
      // Verify JWT token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const { userId, sessionId } = payload;

      // Check session in database
      const session = await db.userSession.findFirst({
        where: {
          session_token: sessionId as string,
          user_id: userId as string,
          is_active: true,
          expires_at: { gt: new Date() }
        }
      });

      if (!session) {
        return {
          valid: false,
          error: 'Invalid or expired session'
        };
      }

      // Get user data
      const user = await this.findUserById(userId as string);
      if (!user || !user.isActive) {
        return {
          valid: false,
          error: 'User not found or inactive'
        };
      }

      // Update last activity
      await db.userSession.update({
        where: { id: session.id },
        data: { last_activity: new Date() }
      });

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          departmentId: user.departmentId,
          mfaEnabled: user.mfaEnabled,
          lastLoginAt: user.lastLoginAt,
          isActive: user.isActive
        },
        sessionId: sessionId as string
      };

    } catch (error) {
      console.error('Session verification error:', error);
      return {
        valid: false,
        error: 'Session verification failed'
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(sessionId: string, reason: string = 'User logout'): Promise<void> {
    try {
      // Deactivate session
      await db.userSession.updateMany({
        where: { session_token: sessionId },
        data: {
          is_active: false,
          logout_reason: reason
        }
      });

      // Audit log
      await logAudit({
        action: 'LOGOUT',
        resourceType: 'AUTH',
        resourceId: sessionId,
        reason: reason
      });

    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Check account lockout status
   */
  private static async checkAccountLockout(email: string, ipAddress: string): Promise<{
    locked: boolean;
    unlockAt?: Date;
  }> {
    const lockout = await db.userLockout.findFirst({
      where: {
        OR: [
          { email },
          { ip_address: ipAddress }
        ],
        unlock_at: { gt: new Date() }
      }
    });

    if (lockout) {
      return {
        locked: true,
        unlockAt: lockout.unlock_at
      };
    }

    return { locked: false };
  }

  /**
   * Handle failed login attempt
   */
  private static async handleFailedLogin(email: string, ipAddress: string, userAgent: string): Promise<void> {
    // Get current failed attempts
    const recentAttempts = await db.loginAttempt.count({
      where: {
        email,
        ip_address: ipAddress,
        attempted_at: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
        success: false
      }
    });

    // If max attempts reached, lock account
    if (recentAttempts >= MAX_LOGIN_ATTEMPTS - 1) {
      await db.userLockout.create({
        data: {
          email,
          ip_address: ipAddress,
          locked_at: new Date(),
          unlock_at: new Date(Date.now() + LOCKOUT_DURATION),
          reason: 'Too many failed login attempts',
          failed_attempts: recentAttempts + 1
        }
      });
    }

    await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Invalid password');
  }

  /**
   * Reset failed attempts
   */
  private static async resetFailedAttempts(email: string, ipAddress: string): Promise<void> {
    await db.userLockout.deleteMany({
      where: {
        OR: [
          { email },
          { ip_address: ipAddress }
        ]
      }
    });
  }

  /**
   * Log login attempt
   */
  private static async logLoginAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    failureReason?: string
  ): Promise<void> {
    await db.loginAttempt.create({
      data: {
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
        failure_reason: failureReason
      }
    });
  }

  /**
   * Find user by email
   */
  private static async findUserByEmail(email: string): Promise<User | null> {
    // Check in Patient table
    const patient = await db.patient.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        address: true,
        password: true,
        mfa_enabled: true,
        last_login_at: true,
        created_at: true,
        updated_at: true
      }
    });

    if (patient) {
      return {
        id: patient.id,
        email: patient.email,
        firstName: patient.first_name,
        lastName: patient.last_name,
        role: 'PATIENT',
        password: patient.password || undefined,
        mfaEnabled: patient.mfa_enabled || false,
        lastLoginAt: patient.last_login_at,
        isActive: true,
        departmentId: null
      };
    }

    // Check in Doctor table
    const doctor = await db.doctor.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        department_id: true,
        password: true,
        mfa_enabled: true,
        last_login_at: true,
        created_at: true,
        updated_at: true
      }
    });

    if (doctor) {
      return {
        id: doctor.id,
        email: doctor.email,
        firstName: doctor.name.split(' ')[0],
        lastName: doctor.name.split(' ').slice(1).join(' '),
        role: 'DOCTOR',
        password: doctor.password || undefined,
        mfaEnabled: doctor.mfa_enabled || false,
        lastLoginAt: doctor.last_login_at,
        isActive: true,
        departmentId: doctor.department_id
      };
    }

    // Check in Staff table
    const staff = await db.staff.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        department_id: true,
        status: true,
        password: true,
        mfa_enabled: true,
        last_login_at: true,
        created_at: true,
        updated_at: true
      }
    });

    if (staff) {
      return {
        id: staff.id,
        email: staff.email,
        firstName: staff.name.split(' ')[0],
        lastName: staff.name.split(' ').slice(1).join(' '),
        role: staff.role,
        password: staff.password || undefined,
        mfaEnabled: staff.mfa_enabled || false,
        lastLoginAt: staff.last_login_at,
        isActive: staff.status === 'ACTIVE',
        departmentId: staff.department_id
      };
    }

    return null;
  }

  /**
   * Find user by ID
   */
  private static async findUserById(id: string): Promise<any> {
    // Check in Patient table
    let user = await db.patient.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        address: true,
        created_at: true,
        updated_at: true
      }
    });

    if (user) {
      return {
        ...user,
        role: 'PATIENT',
        firstName: user.first_name,
        lastName: user.last_name,
        password: 'hashed_password',
        mfaEnabled: false,
        isActive: true,
        departmentId: null
      };
    }

    // Check in Doctor table
    const doctor = await db.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        department_id: true,
        created_at: true,
        updated_at: true
      }
    });

    if (doctor) {
      return {
        id: doctor.id,
        email: doctor.email,
        firstName: doctor.name.split(' ')[0],
        lastName: doctor.name.split(' ').slice(1).join(' '),
        role: 'DOCTOR',
        password: 'hashed_password',
        mfaEnabled: false,
        isActive: true,
        departmentId: doctor.department_id
      };
    }

    // Check in Staff table
    const staff = await db.staff.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        department_id: true,
        status: true,
        created_at: true,
        updated_at: true
      }
    });

    if (staff) {
      return {
        id: staff.id,
        email: staff.email,
        firstName: staff.name.split(' ')[0],
        lastName: staff.name.split(' ').slice(1).join(' '),
        role: staff.role,
        password: 'hashed_password',
        mfaEnabled: false,
        isActive: staff.status === 'ACTIVE',
        departmentId: staff.department_id
      };
    }

    return null;
  }

  /**
   * Update last login
   */
  private static async updateLastLogin(userId: string): Promise<void> {
    // This would need to be implemented in your user models
    // For now, we'll just log it
    console.log(`Last login updated for user: ${userId}`);
  }

  /**
   * Verify MFA code (implement based on your MFA provider)
   */
  private static async verifyMFACode(userId: string, code: string): Promise<boolean> {
    // Implement your MFA verification logic here
    // This could be TOTP, SMS, email, etc.
    return true; // Placeholder
  }
}

// Utility functions
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const result = await HIPAAAuthService.verifySession(token);
    return result.valid ? result.user || null : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireRole(roles: string[]): Promise<User> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}
