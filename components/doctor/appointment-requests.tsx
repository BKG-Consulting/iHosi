"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Clock, 
  Calendar, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText,
  Stethoscope,
  Bell
} from 'lucide-react';

interface AppointmentRequest {
  id: number;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  appointment_date: string;
  time: string;
  type: string;
  reason: string;
  note?: string;
  status: 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

interface AppointmentRequestsProps {
  doctorId: string;
}

export function AppointmentRequests({ doctorId }: AppointmentRequestsProps) {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    appointmentDate: '',
    time: '',
    duration: 30,
    doctorComments: '',
    preparationInstructions: '',
    specialInstructions: '',
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, [doctorId]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/scheduling/appointments?doctorId=${doctorId}&status=PENDING`);
      const result = await response.json();
      
      if (result.success) {
        // Handle different response structures
        const requestsData = result.data || result.appointments || [];
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } else {
        console.error('Failed to load requests:', result.message);
        setRequests([]);
        toast.error('Failed to load appointment requests');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
      toast.error('Failed to load appointment requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/appointments/${selectedRequest.id}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Appointment scheduled successfully');
        setIsScheduleDialogOpen(false);
        setSelectedRequest(null);
        setScheduleData({
          appointmentDate: '',
          time: '',
          duration: 30,
          doctorComments: '',
          preparationInstructions: '',
          specialInstructions: '',
        });
        loadRequests();
      } else {
        toast.error(result.message || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/appointments/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          note: `Rejected: ${rejectReason}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Appointment request rejected');
        setIsRejectDialogOpen(false);
        setSelectedRequest(null);
        setRejectReason('');
        loadRequests();
      } else {
        toast.error(result.message || 'Failed to reject appointment');
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Failed to reject appointment');
    }
  };

  const openScheduleDialog = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setScheduleData({
      appointmentDate: request.appointment_date,
      time: request.time,
      duration: 30,
      doctorComments: '',
      preparationInstructions: '',
      specialInstructions: '',
    });
    setIsScheduleDialogOpen(true);
  };

  const openRejectDialog = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setRejectReason('');
    setIsRejectDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUrgencyColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'follow-up':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Requests</CardTitle>
          <CardDescription>Loading requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Appointment Requests
          </CardTitle>
          <CardDescription>
            Review and schedule pending appointment requests from patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-500">You have no pending appointment requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(requests) && requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-yellow-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {request.patient.first_name} {request.patient.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">{request.patient.email}</p>
                          </div>
                          <Badge className={getUrgencyColor(request.type)}>
                            {request.type}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              <strong>Preferred Date:</strong> {formatDate(request.appointment_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              <strong>Preferred Time:</strong> {request.time}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Reason for Visit:</span>
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {request.reason}
                          </p>
                        </div>
                        
                        {request.note && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">Additional Notes:</span>
                            </div>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {request.note}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Requested on {new Date(request.created_at).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => openScheduleDialog(request)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                        <Button
                          onClick={() => openRejectDialog(request)}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              Schedule the appointment and provide instructions for the patient.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
                <p className="text-sm text-blue-800">
                  <strong>Name:</strong> {selectedRequest.patient.first_name} {selectedRequest.patient.last_name}<br />
                  <strong>Email:</strong> {selectedRequest.patient.email}<br />
                  <strong>Phone:</strong> {selectedRequest.patient.phone}
                </p>
              </div>
              
              <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="schedule">Schedule Details</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appointmentDate">Appointment Date</Label>
                      <Input
                        id="appointmentDate"
                        type="date"
                        value={scheduleData.appointmentDate}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={scheduleData.time}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="480"
                      value={scheduleData.duration}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="instructions" className="space-y-4">
                  <div>
                    <Label htmlFor="doctorComments">Doctor Comments</Label>
                    <Textarea
                      id="doctorComments"
                      placeholder="Internal notes about this appointment..."
                      value={scheduleData.doctorComments}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, doctorComments: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preparationInstructions">Preparation Instructions</Label>
                    <Textarea
                      id="preparationInstructions"
                      placeholder="Instructions for the patient to prepare for the appointment..."
                      value={scheduleData.preparationInstructions}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, preparationInstructions: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      placeholder="Any special instructions or requirements..."
                      value={scheduleData.specialInstructions}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleScheduleAppointment}>
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Appointment Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this appointment request.
            </DialogDescription>
          </DialogHeader>
          
          <div>
            <Label htmlFor="rejectReason">Reason for Rejection</Label>
            <Textarea
              id="rejectReason"
              placeholder="Please provide a reason for rejecting this appointment request..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectAppointment}
              disabled={!rejectReason.trim()}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
