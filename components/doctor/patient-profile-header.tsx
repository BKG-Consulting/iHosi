"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface PatientProfileHeaderProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
    admissionStatus: {
      isAdmitted: boolean;
      ward?: string;
      bed?: string;
      admissionDate?: string;
    };
    consentStatus: {
      hasConsent: boolean;
      dataCategories: string[];
      medicalActions: string[];
      expiresAt: string;
    };
  };
}

export function PatientProfileHeader({ patient }: PatientProfileHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConsentStatus = () => {
    if (!patient.consentStatus.hasConsent) {
      return {
        status: 'No Consent',
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle
      };
    }
    
    const expiresAt = new Date(patient.consentStatus.expiresAt);
    const now = new Date();
    
    if (expiresAt < now) {
      return {
        status: 'Expired',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle
      };
    }
    
    return {
      status: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    };
  };

  const consentStatus = getConsentStatus();
  const StatusIcon = consentStatus.icon;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">{patient.name}</CardTitle>
              <CardDescription className="text-lg">
                {patient.age} years • {patient.gender} • Patient ID: {patient.id}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {patient.admissionStatus.isAdmitted && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                <Activity className="h-3 w-3 mr-1" />
                Admitted
              </Badge>
            )}
            <Badge className={consentStatus.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {consentStatus.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="text-sm text-gray-600">{patient.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-sm text-gray-600">{patient.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Address</p>
              <p className="text-sm text-gray-600">{patient.address}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Consent</p>
              <p className="text-sm text-gray-600">
                {patient.consentStatus.hasConsent ? 'Active' : 'Required'}
              </p>
            </div>
          </div>
        </div>
        
        {patient.admissionStatus.isAdmitted && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-red-600" />
              <h4 className="font-medium text-red-800">Admission Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-red-700">Ward:</span>
                <span className="ml-2 text-red-600">{patient.admissionStatus.ward}</span>
              </div>
              <div>
                <span className="font-medium text-red-700">Bed:</span>
                <span className="ml-2 text-red-600">{patient.admissionStatus.bed}</span>
              </div>
              <div>
                <span className="font-medium text-red-700">Admission Date:</span>
                <span className="ml-2 text-red-600">
                  {patient.admissionStatus.admissionDate && formatDate(patient.admissionStatus.admissionDate)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {!patient.consentStatus.hasConsent && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Consent Required</h4>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              This patient has not granted consent for data access. You can only view basic demographic information.
            </p>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              Request Consent
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
