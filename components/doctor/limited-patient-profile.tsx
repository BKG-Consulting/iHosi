"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  Shield,
  AlertCircle,
  Clock
} from "lucide-react";

interface LimitedPatientProfileProps {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
    gender: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    blood_group?: string;
  };
  appointments: any[];
  onRequestConsent: () => void;
}

export function LimitedPatientProfile({ patient, appointments, onRequestConsent }: LimitedPatientProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  return (
    <div className="space-y-6">
      {/* Patient Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Patient Information
          </CardTitle>
          <CardDescription>
            Basic demographic information (no consent required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Personal Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Name:</span>
                    <span>{patient.first_name} {patient.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Age:</span>
                    <span>{calculateAge(patient.date_of_birth)} years old</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Gender:</span>
                    <span className="capitalize">{patient.gender.toLowerCase()}</span>
                  </div>
                  {patient.blood_group && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Blood Group:</span>
                      <Badge variant="outline">{patient.blood_group}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Address:</span>
                    <span>{patient.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Name:</span>
              <span>{patient.emergency_contact_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Phone:</span>
              <span>{patient.emergency_contact_number}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Appointment History
          </CardTitle>
          <CardDescription>
            Recent appointments with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(appointment.appointment_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.time} • {appointment.type}
                    </p>
                  </div>
                  <Badge 
                    className={
                      appointment.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No appointments found</p>
          )}
        </CardContent>
      </Card>

      {/* Restricted Information Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Shield className="h-5 w-5" />
            Restricted Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-amber-700">
              The following information requires patient consent to access:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-3 w-3" />
                Medical History
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-3 w-3" />
                Lab Results
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-3 w-3" />
                Medications
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-3 w-3" />
                Imaging Results
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-3 w-3" />
                Allergies
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-3 w-3" />
                Vital Signs
              </div>
            </div>
            <div className="pt-3">
              <Button 
                onClick={onRequestConsent}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Request Full Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
