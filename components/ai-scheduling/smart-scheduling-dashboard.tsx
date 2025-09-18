'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  Brain, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Target
} from 'lucide-react';

interface AISchedulingDashboardProps {
  doctorId: string;
  className?: string;
}

interface OptimizedSchedule {
  appointmentId: number;
  scheduledTime: Date;
  confidence: number;
  alternatives: TimeSlot[];
  reasoning: string;
  aiSuggestions: AISuggestion[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  date: Date;
  confidence: number;
  reason: string;
}

interface AISuggestion {
  type: 'OPTIMIZATION' | 'CONFLICT_RESOLUTION' | 'PREFERENCE_LEARNING';
  message: string;
  action?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface DemandForecast {
  date: Date;
  predictedDemand: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

interface NoShowPrediction {
  appointmentId: number;
  probability: number;
  factors: string[];
  recommendations: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function SmartSchedulingDashboard({ doctorId, className }: AISchedulingDashboardProps) {
  const [optimizedSchedules, setOptimizedSchedules] = useState<OptimizedSchedule[]>([]);
  const [demandForecast, setDemandForecast] = useState<DemandForecast[]>([]);
  const [noShowPredictions, setNoShowPredictions] = useState<NoShowPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load AI scheduling data
  useEffect(() => {
    loadAISchedulingData();
  }, [doctorId]);

  const loadAISchedulingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load demand forecast
      const demandResponse = await fetch('/api/ai-scheduling/predict-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
      
      if (demandResponse.ok) {
        const demandData = await demandResponse.json();
        setDemandForecast(demandData.data.forecasts);
      }
      
      // Load no-show predictions for upcoming appointments
      const noShowResponse = await fetch('/api/ai-scheduling/predict-noshow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: 1 // This would be dynamic in real implementation
        })
      });
      
      if (noShowResponse.ok) {
        const noShowData = await noShowResponse.json();
        setNoShowPredictions([noShowData.data]);
      }
      
    } catch (err) {
      setError('Failed to load AI scheduling data');
      console.error('Error loading AI data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeSchedule = async (patientId: string, appointmentType: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai-scheduling/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          appointmentType,
          urgency: 'MEDIUM'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOptimizedSchedules(prev => [...prev, data.data]);
      }
    } catch (err) {
      setError('Failed to optimize schedule');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading AI insights...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI-Powered Scheduling
          </h2>
          <p className="text-gray-600">Intelligent appointment optimization and analytics</p>
        </div>
        <Button onClick={loadAISchedulingData} variant="outline">
          Refresh AI Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Average optimization confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">
              Daily scheduling efficiency gain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
            <p className="text-xs text-muted-foreground">
              Reduced from 18% with AI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="optimization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="optimization">Smart Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Smart Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Optimized Schedules
              </CardTitle>
              <CardDescription>
                AI-recommended appointment times with confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimizedSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No optimized schedules yet</p>
                  <Button 
                    onClick={() => handleOptimizeSchedule('patient-1', 'Consultation')}
                    className="mt-2"
                  >
                    Generate AI Schedule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizedSchedules.map((schedule, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {schedule.scheduledTime.toLocaleString()}
                          </span>
                        </div>
                        <Badge className={getConfidenceColor(schedule.confidence)}>
                          {Math.round(schedule.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{schedule.reasoning}</p>
                      
                      {/* AI Suggestions */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <Lightbulb className="h-4 w-4" />
                          AI Suggestions
                        </h4>
                        {schedule.aiSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="text-sm p-2 bg-blue-50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.type.replace('_', ' ')}
                              </Badge>
                              <span className={suggestion.priority === 'HIGH' ? 'font-medium' : ''}>
                                {suggestion.message}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Demand Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Demand Forecast
                </CardTitle>
                <CardDescription>
                  AI-predicted appointment demand for the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {demandForecast.length === 0 ? (
                  <div className="text-center py-4">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No forecast data available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {demandForecast.slice(0, 7).map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="text-sm font-medium">
                            {forecast.date.toLocaleDateString()}
                          </span>
                          <div className="text-xs text-gray-500">
                            {forecast.factors.join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{forecast.predictedDemand}</div>
                          <div className="text-xs text-gray-500">
                            {Math.round(forecast.confidence * 100)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* No-Show Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  No-Show Predictions
                </CardTitle>
                <CardDescription>
                  AI-predicted no-show risk for upcoming appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {noShowPredictions.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No predictions available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {noShowPredictions.map((prediction, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Appointment #{prediction.appointmentId}
                          </span>
                          <Badge className={getRiskLevelColor(prediction.riskLevel)}>
                            {prediction.riskLevel} RISK
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {Math.round(prediction.probability * 100)}% no-show probability
                        </div>
                        <div className="text-xs">
                          <strong>Factors:</strong> {prediction.factors.join(', ')}
                        </div>
                        {prediction.recommendations.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-xs">Recommendations:</strong>
                            <ul className="text-xs text-gray-600 mt-1">
                              {prediction.recommendations.slice(0, 2).map((rec, idx) => (
                                <li key={idx}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Patient Preferences</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pattern Recognition</span>
                      <span>72%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conflict Resolution</span>
                      <span>91%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Scheduling Accuracy</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time Optimization</span>
                    <span className="font-medium">+23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Patient Satisfaction</span>
                    <span className="font-medium">4.7/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Resource Utilization</span>
                    <span className="font-medium">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


