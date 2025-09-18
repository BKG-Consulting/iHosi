'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  Brain,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface SimplifiedBookingProps {
  patientId: string;
  className?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  img?: string;
  nextAvailable?: string;
  aiRecommended?: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  aiRecommended?: boolean;
  confidence?: number;
}

export default function SimplifiedBooking({ patientId, className }: SimplifiedBookingProps) {
  const [step, setStep] = useState<'doctor' | 'time' | 'confirm'>('doctor');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  // Load doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (doctorId: string, date: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/scheduling/availability/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          date: new Date(date).toISOString(),
          duration: 30
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.data?.availableSlots || []);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep('time');
    if (selectedDate) {
      loadTimeSlots(doctor.id, selectedDate);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (selectedDoctor) {
      loadTimeSlots(selectedDoctor.id, date);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('confirm');
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedTime || !selectedDate || !appointmentType) return;

    setLoading(true);
    try {
      const response = await fetch('/api/scheduling/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId: selectedDoctor.id,
          appointmentDate: new Date(selectedDate).toISOString(),
          time: selectedTime,
          type: appointmentType,
          enableAI: aiEnabled
        })
      });

      if (response.ok) {
        // Success - show confirmation
        setStep('confirm');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      });
    }
    return days;
  };

  const appointmentTypes = [
    'General Consultation',
    'Follow-up',
    'Check-up',
    'Emergency',
    'Specialist Referral'
  ];

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600">Simple, fast, and AI-powered scheduling</p>
        {aiEnabled && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <Brain className="h-4 w-4" />
            <span>AI Assistant is optimizing your booking experience</span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {['doctor', 'time', 'confirm'].map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === stepName 
                ? 'bg-blue-600 text-white' 
                : index < ['doctor', 'time', 'confirm'].indexOf(step)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            {index < 2 && (
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Doctor */}
      {step === 'doctor' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Choose Your Doctor
            </CardTitle>
            <CardDescription>
              Select a doctor for your appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => handleDoctorSelect(doctor)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {doctor.aiRecommended && (
                      <Badge className="bg-purple-100 text-purple-800 mb-2">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Recommended
                      </Badge>
                    )}
                    {doctor.nextAvailable && (
                      <p className="text-sm text-gray-600">
                        Next available: {doctor.nextAvailable}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 'time' && selectedDoctor && (
        <div className="space-y-6">
          {/* Appointment Type */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {appointmentTypes.map((type) => (
                  <Button
                    key={type}
                    variant={appointmentType === type ? "default" : "outline"}
                    onClick={() => setAppointmentType(type)}
                    className="justify-start"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {getNext7Days().map((day) => (
                  <Button
                    key={day.date}
                    variant={selectedDate === day.date ? "default" : "outline"}
                    onClick={() => handleDateSelect(day.date)}
                    className="flex flex-col h-16"
                  >
                    <span className="text-xs">{day.display.split(' ')[0]}</span>
                    <span className="text-sm font-medium">{day.display.split(' ')[1]}</span>
                    <span className="text-xs">{day.display.split(' ')[2]}</span>
                    {day.isToday && (
                      <Badge className="text-xs mt-1">Today</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          {selectedDate && timeSlots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Times</CardTitle>
                <CardDescription>
                  {selectedDate} - {selectedDoctor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className="relative"
                    >
                      {slot.time}
                      {slot.aiRecommended && (
                        <Brain className="h-3 w-3 absolute -top-1 -right-1 text-purple-600" />
                      )}
                    </Button>
                  ))}
                </div>
                {aiEnabled && (
                  <Alert className="mt-4 bg-purple-50 border-purple-200">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      AI is suggesting optimal times based on your preferences and doctor availability
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirm' && selectedDoctor && selectedTime && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Confirm Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Doctor:</span>
                <span>{selectedDoctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Specialization:</span>
                <span>{selectedDoctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span>{appointmentType}</span>
              </div>
            </div>

            {aiEnabled && (
              <Alert className="bg-blue-50 border-blue-200">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  AI has optimized this appointment for maximum efficiency and patient satisfaction
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleBooking}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('time')}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


