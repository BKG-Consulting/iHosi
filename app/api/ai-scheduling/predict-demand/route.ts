import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AISchedulingEngine } from '@/lib/ai-scheduling/ai-scheduling-engine';
import { HIPAAAuthService } from '@/lib/auth/hipaa-auth';
import { logAudit } from '@/lib/audit';

// Validation schema for demand prediction requests
const demandPredictionSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  includeFactors: z.boolean().optional().default(true),
});

// Helper function to generate demand recommendations
function generateDemandRecommendations(forecasts: any[]) {
  const highDemandDays = forecasts.filter(f => f.predictedDemand > 5);
  const lowDemandDays = forecasts.filter(f => f.predictedDemand < 2);
  
  const recommendations = [];
  
  if (highDemandDays.length > 0) {
    recommendations.push({
      type: 'HIGH_DEMAND',
      message: `Consider adding extra time slots on ${highDemandDays.length} high-demand days`,
      priority: 'HIGH'
    });
  }
  
  if (lowDemandDays.length > 0) {
    recommendations.push({
      type: 'LOW_DEMAND',
      message: `Consider reducing availability on ${lowDemandDays.length} low-demand days`,
      priority: 'MEDIUM'
    });
  }
  
  return recommendations;
}

// POST /api/ai-scheduling/predict-demand - AI demand forecasting
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
    const validatedData = demandPredictionSchema.parse(body);
    
    // Convert dates
    const dateRange = {
      start: new Date(validatedData.startDate),
      end: new Date(validatedData.endDate)
    };
    
    // Use AI to forecast demand
    const demandForecast = await AISchedulingEngine.forecastDemand(
      validatedData.doctorId,
      dateRange
    );
    
    // Calculate summary statistics
    const totalPredictedDemand = demandForecast.reduce((sum, forecast) => sum + forecast.predictedDemand, 0);
    const averageConfidence = demandForecast.reduce((sum, forecast) => sum + forecast.confidence, 0) / demandForecast.length;
    const peakDemandDay = demandForecast.reduce((peak, forecast) => 
      forecast.predictedDemand > peak.predictedDemand ? forecast : peak
    );
    
    // Log demand prediction
    await logAudit({
      action: 'AI_PREDICTION',
      resourceType: 'SCHEDULING',
      resourceId: validatedData.doctorId,
      reason: 'AI predicted appointment demand',
      success: true,
      metadata: {
        userId: user.id,
        userRole: user.role,
        doctorId: validatedData.doctorId,
        dateRange,
        totalPredictedDemand,
        averageConfidence,
        peakDemandDay: peakDemandDay.date
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        forecasts: demandForecast,
        summary: {
          totalPredictedDemand,
          averageConfidence: Math.round(averageConfidence * 100) / 100,
          peakDemandDay: {
            date: peakDemandDay.date,
            demand: peakDemandDay.predictedDemand,
            confidence: peakDemandDay.confidence
          },
          recommendations: generateDemandRecommendations(demandForecast)
        }
      },
      message: 'Demand prediction completed successfully'
    });
    
  } catch (error) {
    console.error('AI demand prediction error:', error);
    
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
      resourceType: 'SCHEDULING',
      resourceId: 'unknown',
      reason: 'AI demand prediction failed',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json({
      success: false,
      message: 'Demand prediction failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


