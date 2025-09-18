'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  Zap,
  ArrowRight,
  Plus,
  Eye,
  Settings
} from 'lucide-react';

interface SimplifiedDashboardProps {
  doctorId: string;
  className?: string;
}

interface PendingAppointment {
  id: number;
  patientName: string;
  appointmentDate: string;
  time: string;
  type: string;
  reason?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  aiSuggestion?: {
    confidence: number;
    recommendedTime?: string;
    reasoning: string;
  };
}

interface TodayAppointment {
  id: number;
  patientName: string;
  time: string;
  type: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
}

export default function SimplifiedDashboard({ doctorId, className }: SimplifiedDashboardProps) {
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [doctorId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load pending appointments with AI suggestions
      const pendingResponse = await fetch(`/api/scheduling/appointments?doctorId=${doctorId}&status=PENDING&limit=10`);
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingAppointments(pendingData.data?.appointments || []);
      }

      // Load today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayResponse = await fetch(`/api/scheduling/appointments?doctorId=${doctorId}&startDate=${today}&endDate=${today}`);
      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        setTodayAppointments(todayData.data?.appointments || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId: number, action: 'ACCEPT' | 'REJECT', aiSuggestedTime?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          action,
          aiSuggestedTime,
          enableAI: aiEnabled
        })
      });

      if (response.ok) {
        await loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error handling appointment action:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with AI Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Streamlined appointment management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">AI Assistant</span>
            <Button
              variant={aiEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAiEnabled(!aiEnabled)}
            >
              {aiEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{pendingAppointments.length}</div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{todayAppointments.length}</div>
                <div className="text-sm text-gray-600">Today's Appointments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {todayAppointments.filter(apt => apt.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Completed Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">87%</div>
                <div className="text-sm text-gray-600">AI Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Appointments - Simplified */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Pending Appointments
              <Badge variant="outline" className="ml-auto">
                {pendingAppointments.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Review and schedule new appointment requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No pending appointments</p>
              </div>
            ) : (
              pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                  {/* Patient Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                    <Badge className={getUrgencyColor(appointment.urgency)}>
                      {appointment.urgency}
                    </Badge>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {appointment.appointmentDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {appointment.time}
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  {aiEnabled && appointment.aiSuggestion && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>AI Suggestion:</strong> {appointment.aiSuggestion.reasoning}
                        {appointment.aiSuggestion.recommendedTime && (
                          <span className="block mt-1">
                            Recommended time: {appointment.aiSuggestion.recommendedTime}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons - Simplified */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAppointmentAction(appointment.id, 'ACCEPT', appointment.aiSuggestion?.recommendedTime)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAppointmentAction(appointment.id, 'REJECT')}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule - Simplified */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Your appointments for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No appointments today</p>
              </div>
            ) : (
              todayAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-mono text-gray-900">
                        {appointment.time}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-600">{appointment.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights - Simplified */}
      {aiEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="text-sm text-green-700">Scheduling Accuracy</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2.3h</div>
                <div className="text-sm text-blue-700">Time Saved Daily</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">87%</div>
                <div className="text-sm text-purple-700">Patient Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


