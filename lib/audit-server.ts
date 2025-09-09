import { cookies, headers } from "next/headers";
import { HIPAAAuthService } from "./auth/hipaa-auth";
import { logAudit, AuditLogParams } from "./audit";

export async function logAuditWithContext(params: AuditLogParams) {
  try {
    let userId = 'SYSTEM';
    let userRole = 'SYSTEM';
    let userAgent = 'Unknown';
    let ipAddress = 'Unknown';
    
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth-token')?.value;
      
      if (token) {
        const sessionResult = await HIPAAAuthService.verifySession(token);
        if (sessionResult.valid && sessionResult.user) {
          userId = sessionResult.user.id;
          userRole = sessionResult.user.role;
        }
      }
      
      const headersList = await headers();
      userAgent = headersList.get('user-agent') || 'Unknown';
      
      const forwardedFor = headersList.get('x-forwarded-for');
      const realIp = headersList.get('x-real-ip');
      ipAddress = forwardedFor?.split(',')[0] || realIp || 'Unknown';
    } catch (authError) {
      // If auth fails (e.g., outside request scope), use system defaults
      console.warn('Auth context not available for audit logging, using system defaults:', authError instanceof Error ? authError.message : String(authError));
    }

    return await logAudit(params, {
      userId,
      userRole,
      userAgent,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log audit with context:', error);
    // Fallback to basic audit logging
    return await logAudit(params);
  }
}
