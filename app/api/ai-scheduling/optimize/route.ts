import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AISchedulingEngine } from '@/lib/ai-scheduling/ai-scheduling-engine';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { logAudit } from '@/lib/audit';

// Validation schema for AI scheduling requests
const aiSchedulingRequestSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  preferredDate: z.string().datetime().optional(),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  appointmentType: z.string().min(1, 'Appointment type is required'),
  duration: z.number().min(15).max(480).optional().default(30),
  constraints: z.object({
    maxWaitDays: z.number().min(1).max(30).optional(),
    preferredDays: z.array(z.string()).optional(),
    avoidTimes: z.array(z.string()).optional(),
    specialRequirements: z.string().optional(),
  }).optional(),
});

// POST /api/ai-scheduling/optimize - AI-powered appointment optimization
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionResult = await HIPAAAuthService.verifySession(token);
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = sessionResult.user;
    const body = await request.json();
    
    // Validate request
    const validatedData = aiSchedulingRequestSchema.parse(body);
    
    // Convert preferredDate to Date object if provided
    const aiRequest = {
      ...validatedData,
      preferredDate: validatedData.preferredDate ? new Date(validatedData.preferredDate) : undefined,
    };
    
    // Use AI scheduling engine to optimize the appointment
    const optimizedSchedule = await AISchedulingEngine.optimizeSchedule(aiRequest);
    
    // Log AI optimization
    await logAudit({
      action: 'AI_OPTIMIZATION',
      resourceType: 'SCHEDULING',
      resourceId: validatedData.patientId,
      reason: 'AI optimized appointment scheduling',
      success: true,
      metadata: {
        userId: user.id,
        userRole: user.role,
        patientId: validatedData.patientId,
        doctorId: validatedData.doctorId,
        confidence: optimizedSchedule.confidence,
        alternativesCount: optimizedSchedule.alternatives.length,
        suggestionsCount: optimizedSchedule.aiSuggestions.length
      }
    });
    
    return NextResponse.json({
      success: true,
      data: optimizedSchedule,
      message: 'AI optimization completed successfully'
    });
    
  } catch (error) {
    console.error('AI scheduling optimization error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
    }
    
    // Log AI optimization failure
    await logAudit({
      action: 'AI_OPTIMIZATION',
      resourceType: 'SCHEDULING',
      resourceId: 'unknown',
      reason: 'AI optimization failed',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json({
      success: false,
      message: 'AI optimization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


