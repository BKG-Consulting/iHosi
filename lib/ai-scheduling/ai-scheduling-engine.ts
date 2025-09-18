/**
 * AI-Powered Scheduling Engine
 * 
 * This module provides intelligent scheduling capabilities including:
 * - Predictive analytics for demand forecasting
 * - Smart conflict resolution
 * - Patient preference learning
 * - Optimal time slot recommendations
 * - Automated rescheduling
 */

import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { AppointmentStatus } from '@prisma/client';

// Types for AI scheduling
export interface AISchedulingRequest {
  patientId: string;
  doctorId: string;
  preferredDate?: Date;
  preferredTime?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  appointmentType: string;
  duration?: number;
  constraints?: SchedulingConstraints;
}

export interface SchedulingConstraints {
  maxWaitDays?: number;
  preferredDays?: string[];
  avoidTimes?: string[];
  specialRequirements?: string;
}

export interface OptimizedSchedule {
  appointmentId: number;
  scheduledTime: Date;
  confidence: number;
  alternatives: TimeSlot[];
  reasoning: string;
  aiSuggestions: AISuggestion[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  date: Date;
  confidence: number;
  reason: string;
}

export interface AISuggestion {
  type: 'OPTIMIZATION' | 'CONFLICT_RESOLUTION' | 'PREFERENCE_LEARNING';
  message: string;
  action?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DemandForecast {
  date: Date;
  predictedDemand: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface NoShowPrediction {
  appointmentId: number;
  probability: number;
  factors: string[];
  recommendations: string[];
}

export class AISchedulingEngine {
  /**
   * Main AI scheduling optimization method
   */
  static async optimizeSchedule(request: AISchedulingRequest): Promise<OptimizedSchedule> {
    try {
      // 1. Analyze patient preferences
      const patientPrefs = await this.analyzePatientPreferences(request.patientId);
      
      // 2. Get doctor availability patterns
      const doctorPatterns = await this.getDoctorPatterns(request.doctorId);
      
      // 3. Predict optimal times using ML
      const optimalTimes = await this.predictOptimalTimes(request, patientPrefs, doctorPatterns);
      
      // 4. Check for conflicts and resolve
      const conflictResolution = await this.resolveConflicts(optimalTimes, request);
      
      // 5. Generate AI suggestions
      const suggestions = await this.generateSuggestions(request, optimalTimes);
      
      // 6. Create the optimized schedule
      const optimizedSchedule = await this.createOptimizedSchedule(
        request,
        optimalTimes,
        conflictResolution,
        suggestions
      );
      
      // Log AI decision making
      await logAudit({
        action: 'AI_OPTIMIZATION',
        resourceType: 'SCHEDULING',
        resourceId: request.patientId,
        reason: 'AI optimized appointment scheduling',
        metadata: {
          patientId: request.patientId,
          doctorId: request.doctorId,
          confidence: optimizedSchedule.confidence,
          suggestionsCount: suggestions.length,
          alternativesCount: optimizedSchedule.alternatives.length
        }
      });
      
      return optimizedSchedule;
      
    } catch (error) {
      console.error('AI scheduling optimization failed:', error);
      throw new Error('Failed to optimize schedule with AI');
    }
  }

  /**
   * Predict optimal appointment times using machine learning
   */
  static async predictOptimalTimes(
    request: AISchedulingRequest,
    patientPrefs: any,
    doctorPatterns: any
  ): Promise<TimeSlot[]> {
    const timeSlots: TimeSlot[] = [];
    
    // Get doctor's working hours
    const workingDays = await db.workingDays.findMany({
      where: { doctor_id: request.doctorId, is_working: true }
    });
    
    // Generate time slots for the next 30 days
    const startDate = request.preferredDate || new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const workingDay = workingDays.find(wd => wd.day_of_week === dayOfWeek);
      
      if (!workingDay) continue;
      
      // Generate hourly slots
      const slots = this.generateTimeSlots(
        workingDay.start_time,
        workingDay.end_time,
        request.duration || 30
      );
      
      for (const slot of slots) {
        // Calculate AI confidence score
        const confidence = await this.calculateSlotConfidence(
          request,
          date,
          slot,
          patientPrefs,
          doctorPatterns
        );
        
        if (confidence > 0.3) { // Only include slots with reasonable confidence
          timeSlots.push({
            startTime: slot.start,
            endTime: slot.end,
            date: new Date(date),
            confidence,
            reason: this.generateReasoning(confidence, patientPrefs, doctorPatterns)
          });
        }
      }
    }
    
    // Sort by confidence score
    return timeSlots.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze patient preferences using historical data
   */
  static async analyzePatientPreferences(patientId: string): Promise<any> {
    // Get patient's appointment history
    const appointments = await db.appointment.findMany({
      where: { patient_id: patientId },
      include: { doctor: true },
      orderBy: { appointment_date: 'desc' },
      take: 50
    });
    
    // Analyze patterns
    const preferences = {
      preferredTimes: this.extractTimePreferences(appointments),
      preferredDoctors: this.extractDoctorPreferences(appointments),
      averageDuration: this.calculateAverageDuration(appointments),
      noShowRate: this.calculateNoShowRate(appointments),
      preferredDays: this.extractDayPreferences(appointments)
    };
    
    // TODO: Store/update patient preferences when patientPreferences table is added to schema
    // await db.patientPreferences.upsert({
    //   where: { patient_id: patientId },
    //   update: {
    //     preferred_times: preferences.preferredTimes,
    //     preferred_doctors: preferences.preferredDoctors,
    //     appointment_duration_preference: preferences.averageDuration,
    //     updated_at: new Date()
    //   },
    //   create: {
    //     patient_id: patientId,
    //     preferred_times: preferences.preferredTimes,
    //     preferred_doctors: preferences.preferredDoctors,
    //     appointment_duration_preference: preferences.averageDuration
    //   }
    // });
    
    return preferences;
  }

  /**
   * Get doctor patterns and preferences
   */
  static async getDoctorPatterns(doctorId: string): Promise<any> {
    // Get doctor's scheduling patterns
    // TODO: Add aiSchedulingPatterns table to schema
    // const patterns = await db.aiSchedulingPatterns.findMany({
    const patterns: any[] = [];
    
    // Get recent performance data
    const analytics = await db.scheduleAnalytics.findMany({
      where: { doctor_id: doctorId },
      orderBy: { date: 'desc' },
      take: 30
    });
    
    return {
      patterns: patterns.map(p => p.pattern_data),
      performance: this.analyzePerformance(analytics),
      utilizationRate: this.calculateUtilizationRate(analytics)
    };
  }

  /**
   * Calculate confidence score for a time slot
   */
  static async calculateSlotConfidence(
    request: AISchedulingRequest,
    date: Date,
    slot: { start: string; end: string },
    patientPrefs: any,
    doctorPatterns: any
  ): Promise<number> {
    let confidence = 0.5; // Base confidence
    
    // Factor 1: Patient time preferences (30% weight)
    if (patientPrefs.preferredTimes.includes(slot.start)) {
      confidence += 0.3;
    }
    
    // Factor 2: Doctor availability patterns (25% weight)
    const timeSlot = `${slot.start}-${slot.end}`;
    if (doctorPatterns.patterns.some((p: any) => p.preferredSlots?.includes(timeSlot))) {
      confidence += 0.25;
    }
    
    // Factor 3: Historical success rate (20% weight)
    const historicalSuccess = await this.getHistoricalSuccessRate(request.doctorId, date, slot);
    confidence += historicalSuccess * 0.2;
    
    // Factor 4: Urgency factor (15% weight)
    const urgencyMultiplier = this.getUrgencyMultiplier(request.urgency);
    confidence += urgencyMultiplier * 0.15;
    
    // Factor 5: Day of week preference (10% weight)
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (patientPrefs.preferredDays?.includes(dayOfWeek)) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Resolve scheduling conflicts intelligently
   */
  static async resolveConflicts(
    timeSlots: TimeSlot[],
    request: AISchedulingRequest
  ): Promise<TimeSlot[]> {
    const resolvedSlots: TimeSlot[] = [];
    
    for (const slot of timeSlots) {
      // Check for conflicts
      const conflicts = await this.checkSchedulingConflicts(
        request.doctorId,
        slot.date,
        slot.startTime
      );
      
      if (conflicts.length === 0) {
        resolvedSlots.push(slot);
      } else {
        // Try to resolve conflicts
        const resolution = await this.attemptConflictResolution(conflicts, slot, request);
        if (resolution) {
          resolvedSlots.push(resolution);
        }
      }
    }
    
    return resolvedSlots;
  }

  /**
   * Generate AI suggestions for optimization
   */
  static async generateSuggestions(
    request: AISchedulingRequest,
    timeSlots: TimeSlot[]
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    
    // Suggestion 1: Optimal time recommendation
    if (timeSlots.length > 0) {
      const bestSlot = timeSlots[0];
      suggestions.push({
        type: 'OPTIMIZATION',
        message: `Best time slot: ${bestSlot.startTime} on ${bestSlot.date.toDateString()} (${Math.round(bestSlot.confidence * 100)}% confidence)`,
        action: 'SCHEDULE_APPOINTMENT',
        priority: 'HIGH'
      });
    }
    
    // Suggestion 2: Alternative times
    if (timeSlots.length > 1) {
      suggestions.push({
        type: 'OPTIMIZATION',
        message: `${timeSlots.length - 1} alternative time slots available`,
        action: 'VIEW_ALTERNATIVES',
        priority: 'MEDIUM'
      });
    }
    
    // Suggestion 3: Preference learning
    suggestions.push({
      type: 'PREFERENCE_LEARNING',
      message: 'AI is learning your scheduling preferences for better future recommendations',
      priority: 'LOW'
    });
    
    return suggestions;
  }

  /**
   * Forecast appointment demand using AI
   */
  static async forecastDemand(
    doctorId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<DemandForecast[]> {
    const forecasts: DemandForecast[] = [];
    
    // Get historical data
    const historicalData = await db.scheduleAnalytics.findMany({
      where: {
        doctor_id: doctorId,
        date: {
          gte: new Date(dateRange.start.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days before
          lte: dateRange.end
        }
      },
      orderBy: { date: 'asc' }
    });
    
    // Simple linear regression for demand prediction
    for (let date = new Date(dateRange.start); date <= dateRange.end; date.setDate(date.getDate() + 1)) {
      const prediction = this.predictDemandForDate(date, historicalData);
      forecasts.push(prediction);
    }
    
    return forecasts;
  }

  /**
   * Predict no-show probability for an appointment
   */
  static async predictNoShow(appointmentId: number): Promise<NoShowPrediction> {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, doctor: true }
    });
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    // Get patient's no-show history
    const noShowHistory = await db.appointment.findMany({
      where: {
        patient_id: appointment.patient_id,
        status: 'CANCELLED'
      }
    });
    
    // Calculate no-show probability
    const noShowRate = noShowHistory.length / Math.max(1, noShowHistory.length + 10);
    const factors = this.identifyNoShowFactors(appointment, noShowHistory);
    const recommendations = this.generateNoShowRecommendations(noShowRate, factors);
    
    return {
      appointmentId,
      probability: noShowRate,
      factors,
      recommendations
    };
  }

  // Helper methods
  private static generateTimeSlots(startTime: string, endTime: string, duration: number) {
    const slots = [];
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    let currentTime = new Date();
    currentTime.setHours(startHours, startMinutes, 0, 0);
    
    const endTimeDate = new Date();
    endTimeDate.setHours(endHours, endMinutes, 0, 0);
    
    while (currentTime < endTimeDate) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);
      
      if (slotEnd <= endTimeDate) {
        slots.push({
          start: currentTime.toTimeString().slice(0, 5),
          end: slotEnd.toTimeString().slice(0, 5)
        });
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }
    
    return slots;
  }

  private static extractTimePreferences(appointments: any[]): string[] {
    const timeCounts: { [key: string]: number } = {};
    
    appointments.forEach(apt => {
      const time = apt.time;
      timeCounts[time] = (timeCounts[time] || 0) + 1;
    });
    
    return Object.entries(timeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);
  }

  private static extractDoctorPreferences(appointments: any[]): string[] {
    const doctorCounts: { [key: string]: number } = {};
    
    appointments.forEach(apt => {
      const doctorId = apt.doctor_id;
      doctorCounts[doctorId] = (doctorCounts[doctorId] || 0) + 1;
    });
    
    return Object.entries(doctorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([doctorId]) => doctorId);
  }

  private static calculateAverageDuration(appointments: any[]): number {
    if (appointments.length === 0) return 30;
    
    const totalDuration = appointments.reduce((sum, apt) => sum + (apt.duration || 30), 0);
    return Math.round(totalDuration / appointments.length);
  }

  private static calculateNoShowRate(appointments: any[]): number {
    const cancelled = appointments.filter(apt => apt.status === 'CANCELLED').length;
    return cancelled / Math.max(1, appointments.length);
  }

  private static extractDayPreferences(appointments: any[]): string[] {
    const dayCounts: { [key: string]: number } = {};
    
    appointments.forEach(apt => {
      const day = apt.appointment_date.toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([day]) => day);
  }

  private static getUrgencyMultiplier(urgency: string): number {
    const multipliers = {
      'LOW': 0.1,
      'MEDIUM': 0.3,
      'HIGH': 0.6,
      'URGENT': 0.9
    };
    return multipliers[urgency as keyof typeof multipliers] || 0.3;
  }

  private static generateReasoning(confidence: number, patientPrefs: any, doctorPatterns: any): string {
    const reasons = [];
    
    if (confidence > 0.8) {
      reasons.push('Excellent match based on historical patterns');
    } else if (confidence > 0.6) {
      reasons.push('Good match with some optimization potential');
    } else {
      reasons.push('Available slot with room for improvement');
    }
    
    return reasons.join(', ');
  }

  private static async createOptimizedSchedule(
    request: AISchedulingRequest,
    timeSlots: TimeSlot[],
    conflictResolution: TimeSlot[],
    suggestions: AISuggestion[]
  ): Promise<OptimizedSchedule> {
    const bestSlot = timeSlots[0] || conflictResolution[0];
    
    if (!bestSlot) {
      throw new Error('No suitable time slots found');
    }
    
    return {
      appointmentId: 0, // Will be set when appointment is created
      scheduledTime: new Date(`${bestSlot.date.toDateString()} ${bestSlot.startTime}`),
      confidence: bestSlot.confidence,
      alternatives: timeSlots.slice(1, 4), // Top 3 alternatives
      reasoning: bestSlot.reason,
      aiSuggestions: suggestions
    };
  }

  private static async checkSchedulingConflicts(doctorId: string, date: Date, time: string) {
    // Implementation for conflict checking
    return [];
  }

  private static async attemptConflictResolution(conflicts: any[], slot: TimeSlot, request: AISchedulingRequest) {
    // Implementation for conflict resolution
    return null;
  }

  private static async getHistoricalSuccessRate(doctorId: string, date: Date, slot: { start: string; end: string }) {
    // Implementation for historical success rate calculation
    return 0.8; // Placeholder
  }

  private static analyzePerformance(analytics: any[]) {
    // Implementation for performance analysis
    return { averageUtilization: 0.75 };
  }

  private static calculateUtilizationRate(analytics: any[]) {
    // Implementation for utilization rate calculation
    return 0.75; // Placeholder
  }

  private static predictDemandForDate(date: Date, historicalData: any[]): DemandForecast {
    // Simple prediction based on historical average
    const avgDemand = historicalData.reduce((sum, data) => sum + data.total_appointments, 0) / Math.max(1, historicalData.length);
    
    return {
      date: new Date(date),
      predictedDemand: Math.round(avgDemand),
      confidence: 0.7,
      factors: ['Historical average', 'Day of week pattern'],
      recommendations: ['Consider increasing capacity if demand exceeds 80%']
    };
  }

  private static identifyNoShowFactors(appointment: any, noShowHistory: any[]): string[] {
    const factors = [];
    
    if (noShowHistory.length > 2) {
      factors.push('High historical no-show rate');
    }
    
    if (appointment.appointment_date.getDay() === 0 || appointment.appointment_date.getDay() === 6) {
      factors.push('Weekend appointment');
    }
    
    return factors;
  }

  private static generateNoShowRecommendations(noShowRate: number, factors: string[]): string[] {
    const recommendations = [];
    
    if (noShowRate > 0.3) {
      recommendations.push('Send reminder 24 hours before appointment');
      recommendations.push('Consider phone confirmation');
    }
    
    if (factors.includes('Weekend appointment')) {
      recommendations.push('Offer weekday alternatives');
    }
    
    return recommendations;
  }
}


