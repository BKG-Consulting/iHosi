export interface AuditLogParams {
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PAGE_ACCESS' | 'EXPORT' | 'PRINT';
    resourceType: 'PATIENT' | 'MEDICAL_RECORD' | 'APPOINTMENT' | 'PAYMENT' | 'PAGE' | 'SYSTEM' | 'AUTH';
    resourceId: string;
    patientId?: string;
    phiAccessed?: string[];
    reason?: string;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
}
export declare function logAudit(params: AuditLogParams): Promise<void>;
export declare function generateAuditReport(params: {
    startDate: Date;
    endDate: Date;
    patientId?: string;
    userId?: string;
    actions?: string[];
}): Promise<{
    totalActions: number;
    uniqueUsers: number;
    actionBreakdown: Record<string, number>;
    logs: {
        id: number;
        user_id: string;
        record_id: string;
        action: string;
        details: string | null;
        model: string;
        created_at: Date;
        updated_at: Date;
    }[];
}>;
export declare function detectSuspiciousActivity(): Promise<{
    suspiciousHighVolumeAccess: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.AuditLogGroupByOutputType, "user_id"[]> & {
        _count: number;
    })[];
    failedAccessAttempts: {
        id: number;
        user_id: string;
        record_id: string;
        action: string;
        details: string | null;
        model: string;
        created_at: Date;
        updated_at: Date;
    }[];
}>;
export declare function createAuditMiddleware(): (req: Request, event: any) => Promise<void>;
