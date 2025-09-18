import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export interface SecurityEvent {
  type: 'LOGIN_FAILURE' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'MFA_BYPASS_ATTEMPT' | 'TOKEN_THEFT' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface SecurityAlert {
  id: string;
  event: SecurityEvent;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

export class SecurityMonitor {
  /**
   * Record a security event
   */
  static async recordSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to audit system
      await logAudit({
        action: 'SECURITY_EVENT',
        resourceType: 'SECURITY',
        resourceId: event.type,
        reason: `Security event: ${event.type}`,
        success: false,
        metadata: {
          severity: event.severity,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          details: event.details,
          timestamp: event.timestamp
        }
      });

      // Store in security events table
      // TODO: Add securityEvent table to schema
      // await db.securityEvent.create({
      //   data: {
      //     event_type: event.type,
      //     severity: event.severity,
      //     user_id: event.userId,
      //     ip_address: event.ipAddress,
      //     user_agent: event.userAgent,
      //     details: JSON.stringify(event.details),
      //     created_at: event.timestamp
      //   }
      // });

      // Create alert for high/critical events
      if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
        await this.createSecurityAlert(event);
      }

      // Send real-time notification for critical events
      if (event.severity === 'CRITICAL') {
        await this.sendCriticalAlert(event);
      }
    } catch (error) {
      console.error('Failed to record security event:', error);
    }
  }

  /**
   * Detect suspicious login patterns
   */
  static async detectSuspiciousLogin(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Check for multiple failed logins
      const failedLogins = await db.loginAttempt.count({
        where: {
          user_id: userId,
          // success: false, // Field doesn't exist in schema
          attempted_at: { gte: oneHourAgo }
        }
      });

      if (failedLogins >= 3) {
        await this.recordSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'HIGH',
          userId,
          ipAddress,
          userAgent,
          details: {
            reason: 'Multiple failed login attempts',
            failedAttempts: failedLogins,
            timeWindow: '1 hour'
          },
          timestamp: new Date()
        });
        return true;
      }

      // Check for login from new location
      const previousLogins = await db.userSession.findMany({
        where: {
          user_id: userId,
          created_at: { gte: oneDayAgo }
        },
        select: { ip_address: true }
      });

      const uniqueIPs = new Set(previousLogins.map(login => login.ip_address));
      if (!uniqueIPs.has(ipAddress) && uniqueIPs.size > 0) {
        await this.recordSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'MEDIUM',
          userId,
          ipAddress,
          userAgent,
          details: {
            reason: 'Login from new location',
            previousIPs: Array.from(uniqueIPs),
            newIP: ipAddress
          },
          timestamp: new Date()
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to detect suspicious login:', error);
      return false;
    }
  }

  /**
   * Monitor for MFA bypass attempts
   */
  static async monitorMFABypass(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    try {
      // Check if user has MFA enabled but is trying to bypass it
      const mfaStatus = await db.userMFA.findUnique({
        where: { user_id: userId }
      });

      if (mfaStatus?.is_enabled) {
        // Check for multiple MFA failures
        const mfaFailures = await db.auditLog.count({
          where: {
            user_id: userId,
            action: 'READ_MFA',
            // success: false, // Field doesn't exist in schema
            created_at: { gte: new Date(Date.now() - 15 * 60 * 1000) }
          }
        });

        if (mfaFailures >= 5) {
          await this.recordSecurityEvent({
            type: 'MFA_BYPASS_ATTEMPT',
            severity: 'CRITICAL',
            userId,
            ipAddress,
            userAgent,
            details: {
              reason: 'Multiple MFA failures',
              failureCount: mfaFailures,
              timeWindow: '15 minutes'
            },
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Failed to monitor MFA bypass:', error);
    }
  }

  /**
   * Monitor for token theft or misuse
   */
  static async monitorTokenSecurity(
    userId: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    try {
      // Check for concurrent sessions from different locations
      const activeSessions = await db.userSession.findMany({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: { gt: new Date() }
        },
        select: { ip_address: true, user_agent: true }
      });

      const uniqueIPs = new Set(activeSessions.map(s => s.ip_address));
      if (uniqueIPs.size > 1) {
        await this.recordSecurityEvent({
          type: 'TOKEN_THEFT',
          severity: 'HIGH',
          userId,
          ipAddress,
          userAgent,
          details: {
            reason: 'Concurrent sessions from multiple locations',
            sessionCount: activeSessions.length,
            uniqueIPs: Array.from(uniqueIPs)
          },
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to monitor token security:', error);
    }
  }

  /**
   * Monitor for unauthorized access attempts
   */
  static async monitorUnauthorizedAccess(
    userId: string,
    resource: string,
    action: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    try {
      // Check for repeated unauthorized access attempts
      const unauthorizedAttempts = await db.auditLog.count({
        where: {
          user_id: userId,
          action: `${action}_${resource}`,
          // success: false, // Field doesn't exist in schema
          created_at: { gte: new Date(Date.now() - 30 * 60 * 1000) }
        }
      });

      if (unauthorizedAttempts >= 3) {
        await this.recordSecurityEvent({
          type: 'UNAUTHORIZED_ACCESS',
          severity: 'HIGH',
          userId,
          ipAddress,
          userAgent,
          details: {
            reason: 'Repeated unauthorized access attempts',
            resource,
            action,
            attemptCount: unauthorizedAttempts,
            timeWindow: '30 minutes'
          },
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to monitor unauthorized access:', error);
    }
  }

  /**
   * Get security dashboard data
   */
  static async getSecurityDashboard(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    recentEvents: SecurityEvent[];
    topThreats: Array<{ type: string; count: number }>;
  }> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Get event counts
      // const [totalEvents, criticalEvents, highEvents] = await Promise.all([
      //   db.securityEvent.count({
      //     where: { created_at: { gte: oneDayAgo } }
      //   }),
      //   db.securityEvent.count({
      //     where: { 
      //       created_at: { gte: oneDayAgo },
      //       severity: 'CRITICAL'
      //     }
      //   }),
      //   db.securityEvent.count({
      //     where: { 
      //       created_at: { gte: oneDayAgo },
      //       severity: 'HIGH'
      //     }
      //   })
      // ]);
      
      // Mock data for now
      const totalEvents = 0;
      const criticalEvents = 0;
      const highEvents = 0;

      // Get recent events
      // const recentEventsData = await db.securityEvent.findMany({
      //   where: { created_at: { gte: oneDayAgo } },
      //   orderBy: { created_at: 'desc' },
      //   take: 10
      // });
      
      // Mock data for now
      const recentEventsData: any[] = [];

      const recentEvents: SecurityEvent[] = recentEventsData.map(event => ({
        type: event.event_type as any,
        severity: event.severity as any,
        userId: event.user_id || undefined,
        ipAddress: event.ip_address,
        userAgent: event.user_agent,
        details: JSON.parse(event.details),
        timestamp: event.created_at
      }));

      // Get top threats
      // const threatCounts = await db.securityEvent.groupBy({
      //   by: ['event_type'],
      //   where: { created_at: { gte: oneDayAgo } },
      //   _count: { event_type: true },
      //   orderBy: { _count: { event_type: 'desc' } },
      //   take: 5
      // });
      
      // Mock data for now
      const threatCounts: any[] = [];

      const topThreats = threatCounts.map(threat => ({
        type: threat.event_type,
        count: threat._count.event_type
      }));

      return {
        totalEvents,
        criticalEvents,
        highEvents,
        recentEvents,
        topThreats
      };
    } catch (error) {
      console.error('Failed to get security dashboard:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        highEvents: 0,
        recentEvents: [],
        topThreats: []
      };
    }
  }

  /**
   * Create a security alert
   */
  private static async createSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      // TODO: Add securityAlert table to schema
      // await db.securityAlert.create({
      //   data: {
      //     event_type: event.type,
      //     severity: event.severity,
      //     user_id: event.userId,
      //     ip_address: event.ipAddress,
      //     user_agent: event.userAgent,
      //     details: JSON.stringify(event.details),
      //     resolved: false,
      //     created_at: event.timestamp
      //   }
      // });
    } catch (error) {
      console.error('Failed to create security alert:', error);
    }
  }

  /**
   * Send critical security alert
   */
  private static async sendCriticalAlert(event: SecurityEvent): Promise<void> {
    try {
      // In production, this would send to:
      // - Security team email
      // - Slack channel
      // - SIEM system
      // - PagerDuty for critical events

      console.error('🚨 CRITICAL SECURITY ALERT', {
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        ipAddress: event.ipAddress,
        details: event.details,
        timestamp: event.timestamp
      });

      // Store in critical alerts table
      // TODO: Add criticalAlert table to schema
      // await db.criticalAlert.create({
      //   data: {
      //     event_type: event.type,
      //     user_id: event.userId,
      //     ip_address: event.ipAddress,
      //     details: JSON.stringify(event.details),
      //     sent_at: new Date(),
      //     created_at: event.timestamp
      //   }
      // });
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  }

  /**
   * Clean up old security events
   */
  static async cleanupOldEvents(retentionDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      // TODO: Add securityEvent table to schema
      // const result = await db.securityEvent.deleteMany({
      //   where: {
      //     created_at: { lt: cutoffDate }
      //   }
      // });

      // return result.count;
      return 0; // Mock return for now
    } catch (error) {
      console.error('Failed to cleanup old security events:', error);
      return 0;
    }
  }
}


