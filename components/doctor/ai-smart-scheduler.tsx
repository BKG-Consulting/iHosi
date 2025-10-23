'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Star,
  Target,
  Lightbulb,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AISmartSchedulerProps {
  doctorId: string;
  onScheduleOptimized?: (optimizations: ScheduleOptimization[]) => void;
}

interface ScheduleOptimization {
  id: string;
  type: 'time_slot' | 'patient_flow' | 'resource_allocation' | 'conflict_resolution';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  suggestedAction: string;
  estimatedBenefit: string;
  autoApplyable: boolean;
}

interface PatientPattern {
  patientId: string;
  name: string;
  preferredTimes: string[];
  averageDuration: number;
  noShowRate: number;
  satisfactionScore: number;
  lastVisit: string;
}

interface ScheduleInsight {
  type: 'efficiency' | 'patient_satisfaction' | 'revenue' | 'workload';
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export function AISmartScheduler({ doctorId, onScheduleOptimized }: AISmartSchedulerProps) {
  const [optimizations, setOptimizations] = useState<ScheduleOptimization[]>([]);
  const [patientPatterns, setPatientPatterns] = useState<PatientPattern[]>([]);
  const [insights, setInsights] = useState<ScheduleInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  useEffect(() => {
    if (aiEnabled) {
      analyzeSchedule();
    }
  }, [doctorId, aiEnabled]);

  const analyzeSchedule = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockOptimizations: ScheduleOptimization[] = [
        {
          id: '1',
          type: 'time_slot',
          priority: 'high',
          title: 'Optimize Morning Slots',
          description: 'Move 2 routine checkups from 9:00 AM to 10:30 AM to reduce wait times',
          impact: 'Reduces average wait time by 15 minutes',
          effort: 'low',
          confidence: 87,
          suggestedAction: 'Automatically reschedule routine appointments',
          estimatedBenefit: '15% improvement in patient satisfaction',
          autoApplyable: true
        },
        {
          id: '2',
          type: 'patient_flow',
          priority: 'medium',
          title: 'Balance Virtual vs In-Person',
          description: 'Schedule virtual appointments during lunch break to maximize efficiency',
          impact: 'Increases daily capacity by 2 appointments',
          effort: 'medium',
          confidence: 72,
          suggestedAction: 'Block 12:00-1:00 PM for virtual consultations',
          estimatedBenefit: '20% increase in daily revenue',
          autoApplyable: false
        },
        {
          id: '3',
          type: 'conflict_resolution',
          priority: 'critical',
          title: 'Resolve Double Booking',
          description: 'Detected potential conflict at 2:30 PM - two appointments scheduled',
          impact: 'Prevents patient confusion and delays',
          effort: 'low',
          confidence: 95,
          suggestedAction: 'Move second appointment to 3:00 PM slot',
          estimatedBenefit: 'Prevents scheduling conflict',
          autoApplyable: true
        }
      ];

      const mockPatientPatterns: PatientPattern[] = [
        {
          patientId: '1',
          name: 'Sarah Johnson',
          preferredTimes: ['9:00 AM', '2:00 PM'],
          averageDuration: 30,
          noShowRate: 5,
          satisfactionScore: 4.8,
          lastVisit: '2024-01-15'
        },
        {
          patientId: '2',
          name: 'Michael Chen',
          preferredTimes: ['10:00 AM', '3:00 PM'],
          averageDuration: 45,
          noShowRate: 15,
          satisfactionScore: 4.2,
          lastVisit: '2024-01-10'
        }
      ];

      const mockInsights: ScheduleInsight[] = [
        {
          type: 'efficiency',
          metric: 'Appointment Utilization',
          value: 78,
          trend: 'up',
          recommendation: 'Consider adding 2 more slots in the afternoon'
        },
        {
          type: 'patient_satisfaction',
          metric: 'Average Wait Time',
          value: 12,
          trend: 'down',
          recommendation: 'Current wait times are optimal'
        },
        {
          type: 'revenue',
          metric: 'Daily Revenue',
          value: 2450,
          trend: 'up',
          recommendation: 'Revenue trending positively'
        }
      ];

      setOptimizations(mockOptimizations);
      setPatientPatterns(mockPatientPatterns);
      setInsights(mockInsights);
      setLastAnalysis(new Date());
      
      if (onScheduleOptimized) {
        onScheduleOptimized(mockOptimizations);
      }
      
      toast.success('AI analysis completed! Found 3 optimization opportunities.');
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      toast.error('Failed to analyze schedule');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = async (optimization: ScheduleOptimization) => {
    try {
      // Simulate applying optimization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOptimizations(prev => 
        prev.filter(opt => opt.id !== optimization.id)
      );
      
      toast.success(`Applied: ${optimization.title}`);
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast.error('Failed to apply optimization');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      critical: 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      time_slot: Clock,
      patient_flow: Users,
      resource_allocation: BarChart3,
      conflict_resolution: AlertTriangle
    };
    return icons[type as keyof typeof icons] || Clock;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Smart Scheduler</h2>
            <p className="text-sm text-gray-600">
              Intelligent scheduling optimization powered by machine learning
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeSchedule}
            disabled={isAnalyzing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isAnalyzing && "animate-spin")} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
          
          <Button
            variant={aiEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAiEnabled(!aiEnabled)}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI {aiEnabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">AI Active</span>
              </div>
              <div className="text-sm text-gray-600">
                Last analysis: {lastAnalysis ? lastAnalysis.toLocaleTimeString() : 'Never'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Confidence:</span>
              <Badge className="bg-green-100 text-green-800">87%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTrendIcon(insight.trend)}
                  <span className="text-sm font-medium text-gray-600">
                    {insight.metric}
                  </span>
                </div>
                <Badge variant="outline">
                  {insight.type.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {insight.value}{insight.type === 'revenue' ? '$' : insight.type === 'efficiency' ? '%' : ' min'}
              </div>
              <p className="text-xs text-gray-600">
                {insight.recommendation}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.map((optimization) => {
              const TypeIcon = getTypeIcon(optimization.type);
              return (
                <div
                  key={optimization.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TypeIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {optimization.title}
                          </h3>
                          <Badge className={getPriorityColor(optimization.priority)}>
                            {optimization.priority}
                          </Badge>
                          <Badge variant="outline">
                            {optimization.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {optimization.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Impact:</span>
                            <p className="font-medium">{optimization.impact}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Effort:</span>
                            <p className="font-medium capitalize">{optimization.effort}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Benefit:</span>
                            <p className="font-medium">{optimization.estimatedBenefit}</p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Suggested Action:
                          </p>
                          <p className="text-sm text-blue-700">
                            {optimization.suggestedAction}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {optimization.autoApplyable && (
                        <Button
                          size="sm"
                          onClick={() => applyOptimization(optimization)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Apply
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info('Manual review required')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Patient Patterns */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Patient Behavior Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patientPatterns.map((patient) => (
              <div
                key={patient.patientId}
                className="p-3 border rounded-lg hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{patient.name}</h4>
                      <p className="text-sm text-gray-600">
                        Last visit: {patient.lastVisit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">No-Show Rate</p>
                      <p className="text-sm font-medium">{patient.noShowRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Satisfaction</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <p className="text-sm font-medium">{patient.satisfactionScore}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium">{patient.averageDuration}min</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Preferred Times</p>
                      <div className="flex gap-1">
                        {patient.preferredTimes.map((time, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            AI Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">23%</div>
              <div className="text-sm text-gray-600">Efficiency Gain</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-gray-600">Optimizations Applied</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


