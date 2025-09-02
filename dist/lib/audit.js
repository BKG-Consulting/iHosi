"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
exports.generateAuditReport = generateAuditReport;
exports.detectSuspiciousActivity = detectSuspiciousActivity;
exports.createAuditMiddleware = createAuditMiddleware;
const server_1 = require("@clerk/nextjs/server");
const headers_1 = require("next/headers");
const db_1 = __importDefault(require("./db"));
async function logAudit(params) {
    try {
        const { userId, sessionClaims } = await (0, server_1.auth)();
        const headersList = await (0, headers_1.headers)();
        // Get request details
        const userAgent = headersList.get('user-agent') || 'Unknown';
        const forwardedFor = headersList.get('x-forwarded-for');
        const realIp = headersList.get('x-real-ip');
        const ipAddress = forwardedFor?.split(',')[0] || realIp || 'Unknown';
        // Get user role
        const userRole = sessionClaims?.metadata?.role || 'UNKNOWN';
        // Create audit log entry
        await db_1.default.auditLog.create({
            data: {
                user_id: userId || 'ANONYMOUS',
                record_id: params.resourceId,
                action: `${params.action}_${params.resourceType}`,
                details: JSON.stringify({
                    resourceType: params.resourceType,
                    patientId: params.patientId,
                    phiAccessed: params.phiAccessed,
                    reason: params.reason,
                    userRole: userRole,
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    success: params.success ?? true,
                    errorMessage: params.errorMessage,
                    timestamp: new Date().toISOString(),
                    ...params.metadata
                }),
                model: params.resourceType,
            }
        });
        // High-risk actions: immediate security team notification
        const highRiskActions = ['EXPORT', 'DELETE', 'PRINT'];
        if (highRiskActions.includes(params.action)) {
            await notifySecurityTeam({
                action: params.action,
                userId: userId || 'ANONYMOUS',
                userRole,
                resourceType: params.resourceType,
                patientId: params.patientId,
                ipAddress,
                timestamp: new Date()
            });
        }
        // Patient data access: special logging
        if (params.patientId && params.action === 'READ') {
            await logPatientDataAccess({
                patientId: params.patientId,
                accessedBy: userId || 'ANONYMOUS',
                userRole,
                dataType: params.resourceType,
                reason: params.reason,
                ipAddress
            });
        }
    }
    catch (error) {
        // Even audit logging failures should be logged
        console.error('CRITICAL: Audit logging failed', {
            error: error instanceof Error ? error.message : String(error),
            params,
            timestamp: new Date().toISOString()
        });
        // Try to log to a backup system or file
        await logToBackupSystem('AUDIT_FAILURE', { error: error instanceof Error ? error.message : String(error), params });
    }
}
async function logPatientDataAccess(params) {
    // Check if this is the patient accessing their own data
    const isOwnData = params.accessedBy === params.patientId;
    // Check if access is appropriate (minimum necessary principle)
    if (!isOwnData && !params.reason) {
        await notifySecurityTeam({
            action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
            userId: params.accessedBy,
            userRole: params.userRole,
            patientId: params.patientId,
            reason: 'No business justification provided',
            ipAddress: params.ipAddress,
            timestamp: new Date()
        });
    }
    // Log to specialized patient access log
    await db_1.default.auditLog.create({
        data: {
            user_id: params.accessedBy,
            record_id: params.patientId,
            action: 'PATIENT_DATA_ACCESS',
            details: JSON.stringify({
                dataType: params.dataType,
                isOwnData,
                reason: params.reason,
                userRole: params.userRole,
                ipAddress: params.ipAddress,
                riskLevel: isOwnData ? 'LOW' : 'MEDIUM'
            }),
            model: 'PATIENT_ACCESS_LOG'
        }
    });
}
async function notifySecurityTeam(params) {
    // In production, this would send to:
    // - Security team email/Slack
    // - SIEM system
    // - Compliance dashboard
    console.warn('🚨 SECURITY ALERT', {
        alert: 'High-risk healthcare data action',
        ...params
    });
    // Store security alert
    await db_1.default.auditLog.create({
        data: {
            user_id: 'SYSTEM',
            record_id: `SECURITY_ALERT_${Date.now()}`,
            action: 'SECURITY_ALERT',
            details: JSON.stringify({
                alertType: 'HIGH_RISK_ACTION',
                ...params
            }),
            model: 'SECURITY_LOG'
        }
    });
}
async function logToBackupSystem(type, data) {
    // Backup logging to file system or external service
    // This ensures audit trail even if database fails
    console.error(`BACKUP_LOG_${type}:`, JSON.stringify({
        timestamp: new Date().toISOString(),
        data
    }));
}
// Compliance helper functions
async function generateAuditReport(params) {
    const auditLogs = await db_1.default.auditLog.findMany({
        where: {
            created_at: {
                gte: params.startDate,
                lte: params.endDate
            },
            ...(params.userId && { user_id: params.userId }),
            ...(params.actions && { action: { in: params.actions } })
        },
        orderBy: { created_at: 'desc' }
    });
    return {
        totalActions: auditLogs.length,
        uniqueUsers: new Set(auditLogs.map(log => log.user_id)).size,
        actionBreakdown: auditLogs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {}),
        logs: auditLogs
    };
}
async function detectSuspiciousActivity() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // Multiple patient records accessed by same user
    const suspiciousAccess = await db_1.default.auditLog.groupBy({
        by: ['user_id'],
        where: {
            created_at: { gte: twentyFourHoursAgo },
            action: { contains: 'READ_PATIENT' }
        },
        _count: true
    });
    // Filter for high volume access (more than 20 records)
    const highVolumeAccess = suspiciousAccess.filter(group => group._count > 20);
    // Failed access attempts
    const failedAttempts = await db_1.default.auditLog.findMany({
        where: {
            created_at: { gte: twentyFourHoursAgo },
            details: { contains: '"success":false' }
        }
    });
    return {
        suspiciousHighVolumeAccess: highVolumeAccess,
        failedAccessAttempts: failedAttempts
    };
}
// Middleware integration
function createAuditMiddleware() {
    return async (req, event) => {
        const url = new URL(req.url);
        // Extract patient ID from URL if present
        const patientIdMatch = url.pathname.match(/\/patient\/([^\/]+)/);
        const patientId = patientIdMatch?.[1];
        // Log page access for protected routes
        if (url.pathname.startsWith('/patient') ||
            url.pathname.startsWith('/doctor') ||
            url.pathname.startsWith('/admin')) {
            await logAudit({
                action: 'PAGE_ACCESS',
                resourceType: 'PAGE',
                resourceId: url.pathname,
                patientId: patientId !== 'registration' ? patientId : undefined,
                reason: 'User navigation',
                metadata: {
                    fullUrl: url.toString(),
                    method: req.method
                }
            });
        }
    };
}
