import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AISchedulingEngine } from '@/lib/ai-scheduling/ai-scheduling-engine';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { logAudit } from '@/lib/audit';

// Validation schema for no-show prediction requests
const noShowPredictionSchema = z.object({
  appointmentId: z.number().min(1, 'Appointment ID is required'),
  includeRecommendations: z.boolean().optional().default(true),
});

// POST /api/ai-scheduling/predict-noshow - AI no-show prediction
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
    const validatedData = noShowPredictionSchema.parse(body);
    
    // Use AI to predict no-show probability
    const noShowPrediction = await AISchedulingEngine.predictNoShow(validatedData.appointmentId);
    
    // Determine risk level
    const riskLevel = noShowPrediction.probability > 0.7 ? 'HIGH' : 
                     noShowPrediction.probability > 0.4 ? 'MEDIUM' : 'LOW';
    
    // Generate action recommendations based on risk level
    const actionRecommendations = generateActionRecommendations(noShowPrediction, riskLevel);
    
    // Log no-show prediction
    await logAudit({
      action: 'AI_PREDICTION',
      resourceType: 'APPOINTMENT',
      resourceId: validatedData.appointmentId.toString(),
      reason: 'AI predicted no-show probability',
      success: true,
      metadata: {
        userId: user.id,
        userRole: user.role,
        appointmentId: validatedData.appointmentId,
        noShowProbability: noShowPrediction.probability,
        riskLevel,
        factorsCount: noShowPrediction.factors.length
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...noShowPrediction,
        riskLevel,
        actionRecommendations,
        confidence: calculateConfidence(noShowPrediction.factors.length)
      },
      message: 'No-show prediction completed successfully'
    });
    
  } catch (error) {
    console.error('AI no-show prediction error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      }, { status: 400 });
    }
    
    // Log prediction failure
    await logAudit({
      action: 'AI_PREDICTION',
      resourceType: 'APPOINTMENT',
      resourceId: 'unknown',
      reason: 'AI no-show prediction failed',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json({
      success: false,
      message: 'No-show prediction failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to generate action recommendations
function generateActionRecommendations(prediction: any, riskLevel: string): string[] {
  const recommendations = [];
  
  if (riskLevel === 'HIGH') {
    recommendations.push('Send immediate reminder via phone call');
    recommendations.push('Consider offering alternative time slots');
    recommendations.push('Send SMS reminder 2 hours before appointment');
    recommendations.push('Flag for follow-up by scheduling staff');
  } else if (riskLevel === 'MEDIUM') {
    recommendations.push('Send email reminder 24 hours before');
    recommendations.push('Send SMS reminder 4 hours before');
    recommendations.push('Consider phone confirmation');
  } else {
    recommendations.push('Send standard email reminder');
    recommendations.push('Monitor for any changes');
  }
  
  // Add factor-specific recommendations
  if (prediction.factors.includes('High historical no-show rate')) {
    recommendations.push('Consider requiring deposit for future appointments');
  }
  
  if (prediction.factors.includes('Weekend appointment')) {
    recommendations.push('Offer weekday alternatives if patient prefers');
  }
  
  return recommendations;
}

// Helper function to calculate confidence based on available factors
function calculateConfidence(factorCount: number): number {
  // More factors = higher confidence (up to a point)
  return Math.min(0.5 + (factorCount * 0.1), 0.95);
}


