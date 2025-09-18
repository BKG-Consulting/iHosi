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
  Zap,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface EnhancedBookingInterfaceProps {
  patientId: string;
  className?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  img?: string;
  rating: number;
  nextAvailable: string;
  aiRecommended: boolean;
  location: string;
  phone: string;
  email: string;
  experience: string;
  languages: string[];
  consultationFee: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  aiRecommended: boolean;
  confidence: number;
  reason?: string;
}

interface BookingStep {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
}

export default function EnhancedBookingInterface({ patientId, className }: EnhancedBookingInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const steps: BookingStep[] = [
    { id: 'doctor', title: 'Choose Doctor', completed: false, current: true },
    { id: 'datetime', title: 'Select Time', completed: false, current: false },
    { id: 'details', title: 'Appointment Details', completed: false, current: false },
    { id: 'confirm', title: 'Confirmation', completed: false, current: false }
  ];

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
          duration: 30,
          enableAI: aiEnabled
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
    setCurrentStep(1);
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
    setCurrentStep(2);
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
        setCurrentStep(3);
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
    { value: 'General Consultation', label: 'General Consultation', icon: '🩺' },
    { value: 'Follow-up', label: 'Follow-up Visit', icon: '🔄' },
    { value: 'Check-up', label: 'Routine Check-up', icon: '✅' },
    { value: 'Emergency', label: 'Emergency', icon: '🚨' },
    { value: 'Specialist Referral', label: 'Specialist Referral', icon: '👨‍⚕️' }
  ];

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Book Your Appointment</h1>
        <p className="text-xl text-gray-600">Simple, fast, and AI-powered scheduling</p>
        {aiEnabled && (
          <div className="flex items-center justify-center gap-2 text-lg text-blue-600">
            <Brain className="h-5 w-5" />
            <span>AI Assistant is optimizing your booking experience</span>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${
              index < currentStep 
                ? 'bg-green-600 text-white' 
                : index === currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            <div className="ml-3 text-left">
              <div className={`font-medium ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Choose Doctor */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              Choose Your Doctor
            </CardTitle>
            <CardDescription>
              Select from our qualified healthcare professionals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => handleDoctorSelect(doctor)}
                className="p-6 border rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 bg-white hover:bg-blue-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                      <div className="flex items-center gap-2">
                        {doctor.aiRecommended && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Recommended
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{doctor.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-3">{doctor.specialization}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Next: {doctor.nextAvailable}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${doctor.consultationFee}</span>
                        <span>consultation</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="text-gray-600">Experience: {doctor.experience}</span>
                      <span className="text-gray-600">Languages: {doctor.languages.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Date & Time */}
      {currentStep === 1 && selectedDoctor && (
        <div className="space-y-6">
          {/* Doctor Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{selectedDoctor.name}</h3>
                  <p className="text-blue-700">{selectedDoctor.specialization}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3">
                {getNext7Days().map((day) => (
                  <Button
                    key={day.date}
                    variant={selectedDate === day.date ? "default" : "outline"}
                    onClick={() => handleDateSelect(day.date)}
                    className="flex flex-col h-20"
                  >
                    <span className="text-sm">{day.display.split(' ')[0]}</span>
                    <span className="text-lg font-medium">{day.display.split(' ')[1]}</span>
                    <span className="text-sm">{day.display.split(' ')[2]}</span>
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
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Times
                </CardTitle>
                <CardDescription>
                  {selectedDate} - {selectedDoctor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={`relative h-16 ${
                        slot.aiRecommended ? 'ring-2 ring-purple-500' : ''
                      }`}
                    >
                      {slot.time}
                      {slot.aiRecommended && (
                        <Brain className="h-4 w-4 absolute -top-1 -right-1 text-purple-600" />
                      )}
                    </Button>
                  ))}
                </div>
                
                {aiEnabled && (
                  <Alert className="mt-4 bg-purple-50 border-purple-200">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <strong>AI Suggestion:</strong> Purple-ringed times are AI-recommended for optimal scheduling
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Appointment Details */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Appointment Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {appointmentTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={appointmentType === type.value ? "default" : "outline"}
                    onClick={() => setAppointmentType(type.value)}
                    className="flex flex-col h-20 justify-center"
                  >
                    <span className="text-2xl mb-1">{type.icon}</span>
                    <span className="text-sm">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Appointment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="font-medium">{selectedDoctor?.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{appointmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-medium">${selectedDoctor?.consultationFee}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBooking}
                disabled={loading || !appointmentType}
                className="flex-1"
                size="lg"
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                size="lg"
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 3 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              Appointment Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Your appointment has been successfully booked!
              </h3>
              <p className="text-green-700">
                You will receive a confirmation email shortly with all the details.
              </p>
            </div>

            {aiEnabled && (
              <Alert className="bg-purple-50 border-purple-200">
                <Zap className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  AI has optimized this appointment for maximum efficiency and patient satisfaction
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setCurrentStep(0);
                  setSelectedDoctor(null);
                  setSelectedDate('');
                  setSelectedTime('');
                  setAppointmentType('');
                }}
                variant="outline"
              >
                Book Another Appointment
              </Button>
              <Button>
                View My Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


