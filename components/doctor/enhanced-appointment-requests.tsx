"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Stethoscope,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface AppointmentRequest {
  id: number;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  time: string;
  type: string;
  status: 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  reason?: string;
  note?: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    img?: string;
    colorCode?: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    img?: string;
    colorCode?: string;
  };
  created_at: string;
  updated_at: string;
}

interface EnhancedAppointmentRequestsProps {
  doctorId: string;
}

export const EnhancedAppointmentRequests: React.FC<EnhancedAppointmentRequestsProps> = ({
  doctorId
}) => {
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = useState(false);
  const [schedulingData, setSchedulingData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    requirements: '',
    notes: '',
    duration: 30
  });

  // Fetch appointment requests
  const fetchAppointmentRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/appointments/requests?doctor_id=${doctorId}&status=PENDING`);
      
      if (response.ok) {
        const result = await response.json();
        setAppointmentRequests(result.data || []);
      } else {
        console.error('Failed to fetch appointment requests');
        toast.error('Failed to load appointment requests');
      }
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      toast.error('Failed to load appointment requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Load requests on component mount
  useEffect(() => {
    fetchAppointmentRequests();
  }, [doctorId]);

  // Handle scheduling an appointment
  const handleScheduleAppointment = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/appointments/${selectedRequest.id}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_date: schedulingData.appointmentDate,
          time: schedulingData.appointmentTime,
          requirements: schedulingData.requirements,
          notes: schedulingData.notes,
          duration: schedulingData.duration,
          status: 'SCHEDULED'
        }),
      });

      if (response.ok) {
        toast.success('Appointment scheduled successfully!');
        setIsSchedulingDialogOpen(false);
        setSelectedRequest(null);
        setSchedulingData({
          appointmentDate: '',
          appointmentTime: '',
          requirements: '',
          notes: '',
          duration: 30
        });
        await fetchAppointmentRequests(); // Refresh the list
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  // Handle rejecting an appointment
  const handleRejectAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          reason: 'Rejected by doctor'
        }),
      });

      if (response.ok) {
        toast.success('Appointment request rejected');
        await fetchAppointmentRequests(); // Refresh the list
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to reject appointment');
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Failed to reject appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'SCHEDULED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046658]"></div>
              <span className="text-[#3E4C4B] font-medium">Loading appointment requests...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#046658]">Appointment Requests</h3>
          <p className="text-[#3E4C4B]">
            {appointmentRequests.length} pending request{appointmentRequests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={fetchAppointmentRequests}
          variant="outline"
          size="sm"
          className="border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
        >
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Appointment Requests List */}
      <div className="space-y-4">
        {appointmentRequests.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardContent className="p-12 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-[#2EB6B0]" />
              <h3 className="text-lg font-semibold text-[#046658] mb-2">No Pending Requests</h3>
              <p className="text-[#3E4C4B]">You have no pending appointment requests at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          appointmentRequests.map((request) => (
            <Card key={request.id} className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Patient Information */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-full flex items-center justify-center text-white font-semibold">
                      {request.patient.first_name[0]}{request.patient.last_name[0]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-[#046658] text-lg">
                          {request.patient.first_name} {request.patient.last_name}
                        </h4>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#3E4C4B]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#2EB6B0]" />
                            <span>{formatDate(request.appointment_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#2EB6B0]" />
                            <span>{formatTime(request.time)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-[#2EB6B0]" />
                            <span>{request.type}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#2EB6B0]" />
                            <span>{request.patient.gender}, {calculateAge(request.patient.date_of_birth)} years</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#2EB6B0]" />
                            <span>{request.patient.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#2EB6B0]" />
                            <span className="truncate">{request.patient.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      {request.reason && (
                        <div className="mt-3 p-3 bg-[#D1F1F2]/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-[#2EB6B0]" />
                            <span className="font-medium text-[#046658]">Reason for Visit</span>
                          </div>
                          <p className="text-sm text-[#3E4C4B]">{request.reason}</p>
                        </div>
                      )}
                      
                      {request.note && (
                        <div className="mt-2 p-3 bg-[#F5F7FA] rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-[#2EB6B0]" />
                            <span className="font-medium text-[#046658]">Additional Notes</span>
                          </div>
                          <p className="text-sm text-[#3E4C4B]">{request.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setSchedulingData({
                          appointmentDate: request.appointment_date,
                          appointmentTime: request.time,
                          requirements: '',
                          notes: '',
                          duration: 30
                        });
                        setIsSchedulingDialogOpen(true);
                      }}
                      className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                    
                    <Button
                      onClick={() => handleRejectAppointment(request.id)}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Scheduling Dialog */}
      <Dialog open={isSchedulingDialogOpen} onOpenChange={setIsSchedulingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              Confirm the appointment details and add any requirements or notes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointmentDate">Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={schedulingData.appointmentDate}
                  onChange={(e) => setSchedulingData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="appointmentTime">Time</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={schedulingData.appointmentTime}
                  onChange={(e) => setSchedulingData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={schedulingData.duration.toString()} onValueChange={(value) => setSchedulingData(prev => ({ ...prev, duration: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="requirements">Requirements for Patient</Label>
              <Textarea
                id="requirements"
                placeholder="e.g., Bring ID, insurance card, fasting required, etc."
                value={schedulingData.requirements}
                onChange={(e) => setSchedulingData(prev => ({ ...prev, requirements: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Internal notes for this appointment..."
                value={schedulingData.notes}
                onChange={(e) => setSchedulingData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSchedulingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleAppointment}
              className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
            >
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
