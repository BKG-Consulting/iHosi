/**
 * AI Scheduling Integration Service
 * 
 * This service integrates AI capabilities with the existing scheduling system
 * and provides backward compatibility while adding intelligent features.
 */

import { db } from '@/lib/db';
import { AISchedulingEngine } from './ai-scheduling-engine';
import { logAudit } from '@/lib/audit';

export interface EnhancedAppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  time: string;
  type: string;
  reason?: string;
  note?: string;
  serviceId?: number;
  duration?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  enableAI?: boolean; // Flag to enable AI optimization
}

export interface EnhancedAppointmentResponse {
  success: boolean;
  data?: any;
  message: string;
  aiInsights?: {
    confidence: number;
    suggestions: string[];
    alternatives: any[];
    optimizationApplied: boolean;
  };
  conflicts?: any[];
}

export class AISchedulingIntegrationService {
  /**
   * Enhanced appointment creation with AI optimization
   */
  static async createAppointmentWithAI(request: EnhancedAppointmentRequest): Promise<EnhancedAppointmentResponse> {
    try {
      // If AI is enabled, optimize the schedule first
      if (request.enableAI) {
        const aiOptimization = await AISchedulingEngine.optimizeSchedule({
          patientId: request.patientId,
          doctorId: request.doctorId,
          preferredDate: new Date(request.appointmentDate),
          preferredTime: request.time,
          urgency: request.priority || 'MEDIUM',
          appointmentType: request.type,
          duration: request.duration || 30
        });

        // Use AI-optimized time if confidence is high enough
        if (aiOptimization.confidence > 0.7) {
          request.appointmentDate = aiOptimization.scheduledTime.toISOString();
          request.time = aiOptimization.scheduledTime.toTimeString().slice(0, 5);
        }

        // Create appointment with enhanced data
        const appointment = await db.appointment.create({
          data: {
            patient_id: request.patientId,
            doctor_id: request.doctorId,
            appointment_date: new Date(request.appointmentDate),
            time: request.time,
            type: request.type,
            note: request.note,
            reason: request.reason,
            service_id: request.serviceId,
            status: 'PENDING',
            ai_confidence_score: aiOptimization.confidence,
            priority_score: this.calculatePriorityScore(request.priority),
            auto_scheduled: aiOptimization.confidence > 0.8,
            ai_suggestions: aiOptimization.aiSuggestions as any
          },
          include: {
            patient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                img: true,
                colorCode: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                img: true,
                colorCode: true,
              },
            },
          },
        });

        // Log AI-enhanced appointment creation
        await logAudit({
          action: 'CREATE',
          resourceType: 'APPOINTMENT',
          resourceId: appointment.id.toString(),
          reason: 'AI-enhanced appointment creation',
          metadata: {
            patientId: request.patientId,
            doctorId: request.doctorId,
            aiConfidence: aiOptimization.confidence,
            optimizationApplied: aiOptimization.confidence > 0.7,
            suggestionsCount: aiOptimization.aiSuggestions.length
          }
        });

        return {
          success: true,
          data: appointment,
          message: 'Appointment created successfully with AI optimization',
          aiInsights: {
            confidence: aiOptimization.confidence,
            suggestions: aiOptimization.aiSuggestions.map(s => s.message),
            alternatives: aiOptimization.alternatives,
            optimizationApplied: aiOptimization.confidence > 0.7
          }
        };
      } else {
        // Fallback to standard appointment creation
        const appointment = await db.appointment.create({
          data: {
            patient_id: request.patientId,
            doctor_id: request.doctorId,
            appointment_date: new Date(request.appointmentDate),
            time: request.time,
            type: request.type,
            note: request.note,
            reason: request.reason,
            service_id: request.serviceId,
            status: 'PENDING',
            priority_score: this.calculatePriorityScore(request.priority)
          },
          include: {
            patient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                img: true,
                colorCode: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                img: true,
                colorCode: true,
              },
            },
          },
        });

        return {
          success: true,
          data: appointment,
          message: 'Appointment created successfully'
        };
      }
    } catch (error) {
      console.error('Error creating AI-enhanced appointment:', error);
      return {
        success: false,
        message: 'Failed to create appointment',
        aiInsights: undefined
      };
    }
  }

  /**
   * Enhanced appointment update with AI suggestions
   */
  static async updateAppointmentWithAI(
    appointmentId: number,
    updates: Partial<EnhancedAppointmentRequest>
  ): Promise<EnhancedAppointmentResponse> {
    try {
      const existingAppointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, doctor: true }
      });

      if (!existingAppointment) {
        return {
          success: false,
          message: 'Appointment not found'
        };
      }

      // If time is being changed, use AI to suggest optimal alternatives
      if (updates.appointmentDate || updates.time) {
        const aiOptimization = await AISchedulingEngine.optimizeSchedule({
          patientId: existingAppointment.patient_id,
          doctorId: existingAppointment.doctor_id,
          preferredDate: updates.appointmentDate ? new Date(updates.appointmentDate) : existingAppointment.appointment_date,
          preferredTime: updates.time || existingAppointment.time,
          urgency: updates.priority || 'MEDIUM',
          appointmentType: updates.type || existingAppointment.type,
          duration: updates.duration || 30
        });

        // Update with AI suggestions
        const updateData: any = {
          ...updates,
          ai_confidence_score: aiOptimization.confidence,
          ai_suggestions: aiOptimization.aiSuggestions
        };

        if (updates.appointmentDate) updateData.appointment_date = new Date(updates.appointmentDate);

        const updatedAppointment = await db.appointment.update({
          where: { id: appointmentId },
          data: updateData,
          include: {
            patient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                img: true,
                colorCode: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                img: true,
                colorCode: true,
              },
            },
          },
        });

        return {
          success: true,
          data: updatedAppointment,
          message: 'Appointment updated with AI insights',
          aiInsights: {
            confidence: aiOptimization.confidence,
            suggestions: aiOptimization.aiSuggestions.map(s => s.message),
            alternatives: aiOptimization.alternatives,
            optimizationApplied: false
          }
        };
      } else {
        // Standard update without AI
        const updatedAppointment = await db.appointment.update({
          where: { id: appointmentId },
          data: updates,
          include: {
            patient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                img: true,
                colorCode: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                img: true,
                colorCode: true,
              },
            },
          },
        });

        return {
          success: true,
          data: updatedAppointment,
          message: 'Appointment updated successfully'
        };
      }
    } catch (error) {
      console.error('Error updating appointment with AI:', error);
      return {
        success: false,
        message: 'Failed to update appointment'
      };
    }
  }

  /**
   * Get AI-enhanced appointment recommendations
   */
  static async getAIRecommendations(doctorId: string, dateRange: { start: Date; end: Date }) {
    try {
      // Get demand forecast
      const demandForecast = await AISchedulingEngine.forecastDemand(doctorId, dateRange);
      
      // Get upcoming appointments with no-show predictions
      const upcomingAppointments = await db.appointment.findMany({
        where: {
          doctor_id: doctorId,
          appointment_date: {
            gte: dateRange.start,
            lte: dateRange.end
          },
          status: { in: ['PENDING', 'SCHEDULED'] }
        },
        include: { patient: true }
      });

      const noShowPredictions = await Promise.all(
        upcomingAppointments.map(apt => AISchedulingEngine.predictNoShow(apt.id))
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(demandForecast, noShowPredictions);

      return {
        success: true,
        data: {
          demandForecast,
          noShowPredictions,
          recommendations
        }
      };
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return {
        success: false,
        message: 'Failed to get AI recommendations'
      };
    }
  }

  /**
   * Auto-reschedule appointments using AI
   */
  static async autoRescheduleWithAI(appointmentId: number, reason: string) {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, doctor: true }
      });

      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found'
        };
      }

      // Use AI to find optimal reschedule time
      const aiOptimization = await AISchedulingEngine.optimizeSchedule({
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        urgency: 'HIGH', // Rescheduling is usually urgent
        appointmentType: appointment.type,
        duration: 30
      });

      // Update appointment with new time
      const rescheduledAppointment = await db.appointment.update({
        where: { id: appointmentId },
        data: {
          appointment_date: aiOptimization.scheduledTime,
          time: aiOptimization.scheduledTime.toTimeString().slice(0, 5),
          ai_confidence_score: aiOptimization.confidence,
          ai_suggestions: aiOptimization.aiSuggestions as any,
          note: `${appointment.note || ''}\n[AI Rescheduled: ${reason}]`
        }
      });

      // Log auto-rescheduling
      await logAudit({
        action: 'UPDATE',
        resourceType: 'APPOINTMENT',
        resourceId: appointmentId.toString(),
        reason: 'AI auto-rescheduling',
        metadata: {
          originalDate: appointment.appointment_date,
          newDate: aiOptimization.scheduledTime,
          reason,
          aiConfidence: aiOptimization.confidence
        }
      });

      return {
        success: true,
        data: rescheduledAppointment,
        message: 'Appointment auto-rescheduled with AI',
        aiInsights: {
          confidence: aiOptimization.confidence,
          suggestions: aiOptimization.aiSuggestions.map(s => s.message),
          alternatives: aiOptimization.alternatives,
          optimizationApplied: true
        }
      };
    } catch (error) {
      console.error('Error auto-rescheduling with AI:', error);
      return {
        success: false,
        message: 'Failed to auto-reschedule appointment'
      };
    }
  }

  // Helper methods
  private static calculatePriorityScore(priority?: string): number {
    const scores = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'URGENT': 4
    };
    return scores[priority as keyof typeof scores] || 2;
  }

  private static generateRecommendations(demandForecast: any[], noShowPredictions: any[]): string[] {
    const recommendations = [];
    
    // High demand recommendations
    const highDemandDays = demandForecast.filter(f => f.predictedDemand > 15);
    if (highDemandDays.length > 0) {
      recommendations.push(`Consider increasing capacity on ${highDemandDays.length} high-demand days`);
    }

    // No-show recommendations
    const highRiskAppointments = noShowPredictions.filter(p => p.probability > 0.7);
    if (highRiskAppointments.length > 0) {
      recommendations.push(`${highRiskAppointments.length} appointments have high no-show risk - consider proactive follow-up`);
    }

    // Utilization recommendations
    const avgDemand = demandForecast.reduce((sum, f) => sum + f.predictedDemand, 0) / demandForecast.length;
    if (avgDemand > 12) {
      recommendations.push('High average demand - consider adding more appointment slots');
    }

    return recommendations;
  }
}


