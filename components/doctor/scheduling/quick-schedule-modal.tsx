'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock, 
  Search,
  Loader2,
  AlertTriangle,
  Brain,
  CheckCircle
} from 'lucide-react';
import { Appointment } from '@/types/schedule-types';

interface QuickScheduleModalProps {
  open: boolean;
  onClose: () => void;
  doctorId: string;
  selectedDate: Date;
  selectedTime: string;
  pendingAppointments?: Appointment[];
  onScheduleComplete?: () => void;
}

const APPOINTMENT_TYPES = [
  { value: 'Consultation', label: 'Consultation', duration: 30 },
  { value: 'Follow-up', label: 'Follow-up', duration: 20 },
  { value: 'Checkup', label: 'Checkup', duration: 30 },
  { value: 'Procedure', label: 'Procedure', duration: 60 },
  { value: 'Emergency', label: 'Emergency', duration: 45 }
];

export function QuickScheduleModal({
  open,
  onClose,
  doctorId,
  selectedDate,
  selectedTime,
  pendingAppointments = [],
  onScheduleComplete
}: QuickScheduleModalProps) {
  const [mode, setMode] = useState<'pending' | 'new'>('pending');
  const [selectedPending, setSelectedPending] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consultation');
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Appointment | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMode(pendingAppointments.length > 0 ? 'pending' : 'new');
      setSelectedPending(null);
      setSearchQuery('');
      setNotes('');
      setShowSuccess(false);
      
      // AI suggestion - prioritize by wait time
      if (pendingAppointments.length > 0) {
        const sorted = [...pendingAppointments].sort((a, b) => {
          const dateA = new Date(a.created_at || a.appointment_date);
          const dateB = new Date(b.created_at || b.appointment_date);
          return dateA.getTime() - dateB.getTime();
        });
        setAiSuggestion(sorted[0]);
        setSelectedPending(sorted[0].id);
      }
    }
  }, [open, pendingAppointments]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSchedule = async () => {
    if (mode === 'pending' && !selectedPending) {
      alert('Please select an appointment to schedule');
      return;
    }

    setIsScheduling(true);
    try {
      if (mode === 'pending') {
        // Schedule existing pending appointment
        const appointment = pendingAppointments.find(a => a.id === selectedPending);
        if (!appointment) return;

        // Update appointment time and date
        const updateResponse = await fetch(`/api/appointments/${appointment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            time: selectedTime,
            appointment_date: selectedDate.toISOString().split('T')[0]
          })
        });

        if (!updateResponse.ok) throw new Error('Failed to update appointment');

        // Accept appointment
        const actionResponse = await fetch('/api/appointments/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: appointment.id,
            action: 'ACCEPT',
            reason: `Scheduled to ${selectedTime} on ${formatDate(selectedDate)}`,
            enableAI: false
          })
        });

        const result = await actionResponse.json();
        if (!result.success) throw new Error(result.message);

      } else {
        // Create new appointment (this would need patient selection - simplified for now)
        alert('New patient scheduling requires patient selection. This will be implemented next.');
        setIsScheduling(false);
        return;
      }

      // Show success and close
      setShowSuccess(true);
      setTimeout(() => {
        onScheduleComplete?.();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const filteredPending = pendingAppointments.filter(apt => {
    const patientName = `${apt.patient?.first_name} ${apt.patient?.last_name}`.toLowerCase();
    const type = apt.type.toLowerCase();
    const query = searchQuery.toLowerCase();
    return patientName.includes(query) || type.includes(query);
  });

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              Appointment Scheduled!
            </h3>
            <p className="text-green-700 text-center">
              Patient notification has been sent
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Appointment
          </DialogTitle>
          <DialogDescription className="pt-2">
            Quick scheduling for {formatDate(selectedDate)} at {selectedTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date & Time Display */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          {pendingAppointments.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant={mode === 'pending' ? 'default' : 'outline'}
                onClick={() => setMode('pending')}
                className="flex-1"
              >
                From Pending ({pendingAppointments.length})
              </Button>
              <Button
                variant={mode === 'new' ? 'default' : 'outline'}
                onClick={() => setMode('new')}
                className="flex-1"
              >
                New Patient
              </Button>
            </div>
          )}

          {/* Pending Appointments */}
          {mode === 'pending' && (
            <div className="space-y-4">
              {/* AI Suggestion */}
              {aiSuggestion && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900">
                        AI Suggestion
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        {aiSuggestion.patient?.first_name} {aiSuggestion.patient?.last_name} has 
                        been waiting the longest ({Math.floor((Date.now() - new Date(aiSuggestion.created_at || aiSuggestion.appointment_date).getTime()) / (1000 * 60 * 60 * 24))} days)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search pending appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Pending List */}
              <RadioGroup value={selectedPending || ''} onValueChange={setSelectedPending}>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredPending.map((apt) => {
                    const waitDays = Math.floor((Date.now() - new Date(apt.created_at || apt.appointment_date).getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div
                        key={apt.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPending === apt.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedPending(apt.id)}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={apt.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">
                                {apt.patient?.first_name} {apt.patient?.last_name}
                              </span>
                              {apt.id === aiSuggestion?.id && (
                                <Badge className="bg-purple-100 text-purple-800 text-xs">
                                  <Brain className="h-3 w-3 mr-1" />
                                  AI Pick
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{apt.type}</p>
                            {apt.note && (
                              <p className="text-xs text-gray-500 mt-1">
                                Note: {apt.note}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Requested {waitDays} day{waitDays !== 1 ? 's' : ''} ago
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredPending.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No pending appointments found</p>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* New Patient */}
          {mode === 'new' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      New Patient Scheduling
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This feature requires patient selection and will be enhanced in the next update.
                      For now, please schedule from pending appointments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 opacity-50 pointer-events-none">
                <div>
                  <Label>Appointment Type</Label>
                  <RadioGroup value={appointmentType} onValueChange={setAppointmentType}>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {APPOINTMENT_TYPES.map(type => (
                        <div
                          key={type.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer ${
                            appointmentType === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                          onClick={() => setAppointmentType(type.value)}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={type.value} />
                            <div>
                              <div className="font-medium text-sm">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.duration} min</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special notes or requirements..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-900">
                  Important Notice
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  This action will immediately send a confirmation email to the patient.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isScheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isScheduling || (mode === 'pending' && !selectedPending) || mode === 'new'}
          >
            {isScheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule & Notify'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


