'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Video, 
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Star,
  Shield,
  Zap,
  Smartphone,
  Globe,
  MessageCircle,
  Bell,
  CreditCard,
  FileText,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PatientBookingPortalProps {
  doctorId: string;
  doctorName: string;
  specialization: string;
  facilityName: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  isVirtual: boolean;
  price: number;
  duration: number;
}

interface AppointmentType {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isVirtual: boolean;
  icon: string;
}

interface BookingFormData {
  patientName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  appointmentType: string;
  selectedDate: string;
  selectedTime: string;
  reason: string;
  notes: string;
  isVirtual: boolean;
  insuranceProvider: string;
  insuranceNumber: string;
}

export function PatientBookingPortal({ 
  doctorId, 
  doctorName, 
  specialization, 
  facilityName 
}: PatientBookingPortalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    patientName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    appointmentType: '',
    selectedDate: '',
    selectedTime: '',
    reason: '',
    notes: '',
    isVirtual: false,
    insuranceProvider: '',
    insuranceNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const steps = [
    { id: 1, title: 'Select Service', description: 'Choose appointment type' },
    { id: 2, title: 'Pick Date & Time', description: 'Select your preferred slot' },
    { id: 3, title: 'Patient Info', description: 'Enter your details' },
    { id: 4, title: 'Confirm Booking', description: 'Review and confirm' }
  ];

  useEffect(() => {
    loadAppointmentTypes();
    loadTimeSlots();
  }, [selectedDate, formData.appointmentType]);

  const loadAppointmentTypes = async () => {
    try {
      // Mock data - replace with actual API call
      const types: AppointmentType[] = [
        {
          id: '1',
          name: 'General Consultation',
          description: 'Routine health checkup and consultation',
          duration: 30,
          price: 150,
          isVirtual: true,
          icon: 'stethoscope'
        },
        {
          id: '2',
          name: 'Follow-up Visit',
          description: 'Follow-up appointment for ongoing treatment',
          duration: 20,
          price: 100,
          isVirtual: true,
          icon: 'heart'
        },
        {
          id: '3',
          name: 'Specialist Consultation',
          description: 'Specialized medical consultation',
          duration: 45,
          price: 200,
          isVirtual: false,
          icon: 'user'
        },
        {
          id: '4',
          name: 'Telehealth Visit',
          description: 'Virtual consultation via video call',
          duration: 25,
          price: 120,
          isVirtual: true,
          icon: 'video'
        }
      ];
      setAppointmentTypes(types);
    } catch (error) {
      console.error('Error loading appointment types:', error);
    }
  };

  const loadTimeSlots = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const slots: TimeSlot[] = [
        { time: '09:00', available: true, isVirtual: true, price: 150, duration: 30 },
        { time: '09:30', available: false, isVirtual: true, price: 150, duration: 30 },
        { time: '10:00', available: true, isVirtual: true, price: 150, duration: 30 },
        { time: '10:30', available: true, isVirtual: false, price: 150, duration: 30 },
        { time: '11:00', available: true, isVirtual: true, price: 150, duration: 30 },
        { time: '11:30', available: false, isVirtual: true, price: 150, duration: 30 },
        { time: '14:00', available: true, isVirtual: true, price: 150, duration: 30 },
        { time: '14:30', available: true, isVirtual: false, price: 150, duration: 30 },
        { time: '15:00', available: true, isVirtual: true, price: 150, duration: 30 },
        { time: '15:30', available: true, isVirtual: true, price: 150, duration: 30 },
        { time: '16:00', available: false, isVirtual: true, price: 150, duration: 30 },
        { time: '16:30', available: true, isVirtual: true, price: 150, duration: 30 }
      ];
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Appointment booked successfully!');
      // Reset form or redirect
      setCurrentStep(1);
      setFormData({
        patientName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        appointmentType: '',
        selectedDate: '',
        selectedTime: '',
        reason: '',
        notes: '',
        isVirtual: false,
        insuranceProvider: '',
        insuranceNumber: ''
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons = {
      stethoscope: Stethoscope,
      heart: Heart,
      user: User,
      video: Video
    };
    return icons[iconName as keyof typeof icons] || Stethoscope;
  };

  const selectedAppointmentType = appointmentTypes.find(type => type.id === formData.appointmentType);
  const selectedTimeSlot = timeSlots.find(slot => slot.time === formData.selectedTime);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
            <p className="text-gray-600">Dr. {doctorName} • {specialization}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-green-600" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-blue-600" />
            <span>Instant Confirmation</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="h-4 w-4 text-purple-600" />
            <span>Mobile Friendly</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                  currentStep >= step.id 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-white border-gray-300 text-gray-400"
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-4",
                    currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {/* Step 1: Select Service */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select Appointment Type</h2>
                <p className="text-gray-600">Choose the type of appointment that best fits your needs</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointmentTypes.map((type) => {
                  const IconComponent = getIcon(type.icon);
                  return (
                    <div
                      key={type.id}
                      className={cn(
                        "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                        formData.appointmentType === type.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setFormData(prev => ({ ...prev, appointmentType: type.id, isVirtual: type.isVirtual }))}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{type.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{type.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-green-600">${type.price}</span>
                            </div>
                            {type.isVirtual && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Video className="h-3 w-3 mr-1" />
                                Virtual
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Pick Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
                <p className="text-gray-600">Choose your preferred appointment date and time</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date Picker */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Date
                  </Label>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() + i);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      
                      return (
                        <button
                          key={i}
                          className={cn(
                            "p-3 text-center rounded-lg border transition-all duration-200",
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : isToday
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="text-xs font-medium">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-sm font-bold">
                            {date.getDate()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Time Slots */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Available Times
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {isLoading ? (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        Loading available times...
                      </div>
                    ) : (
                      timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          className={cn(
                            "p-3 text-center rounded-lg border transition-all duration-200",
                            !slot.available
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                              : formData.selectedTime === slot.time
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          )}
                          onClick={() => slot.available && setFormData(prev => ({ ...prev, selectedTime: slot.time }))}
                        >
                          <div className="text-sm font-medium">{slot.time}</div>
                          <div className="text-xs text-gray-500">
                            {slot.isVirtual ? 'Virtual' : 'In-person'}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Patient Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Information</h2>
                <p className="text-gray-600">Please provide your details for the appointment</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Full Name *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason for Visit *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please describe the reason for your appointment"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information you'd like to share"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirm Booking */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Your Booking</h2>
                <p className="text-gray-600">Please review your appointment details</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Details */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Appointment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedAppointmentType?.name}</h3>
                        <p className="text-sm text-gray-600">{selectedAppointmentType?.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{formData.selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedAppointmentType?.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="outline">
                          {formData.isVirtual ? 'Virtual' : 'In-person'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-green-600">${selectedAppointmentType?.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Patient Info */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium text-right max-w-32 truncate">{formData.reason}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Confirmation Message */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Booking Confirmation</span>
                </div>
                <p className="text-sm text-green-700">
                  You will receive a confirmation email and SMS with appointment details. 
                  A reminder will be sent 24 hours before your appointment.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        {currentStep < steps.length ? (
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !formData.appointmentType) ||
              (currentStep === 2 && !formData.selectedTime) ||
              (currentStep === 3 && (!formData.patientName || !formData.email || !formData.phone))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleBooking}
            disabled={isBooking}
            className="bg-green-600 hover:bg-green-700"
          >
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}


