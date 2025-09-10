"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity } from "lucide-react";
import { PatientProfileData } from "@/types/patient-profile";
import { PatientProfileService } from "@/services/patient-profile-service";

interface PatientProfileHeaderProps {
  patient: PatientProfileData;
  onBack: () => void;
}

export function PatientProfileHeader({ patient, onBack }: PatientProfileHeaderProps) {
  const { initials, displayInfo, isAdmitted } = PatientProfileService.formatPatientInfo(patient);

  return (
    <>
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-lg font-semibold text-gray-900">Patient Profile</h1>
        </div>
      </div>

      {/* Patient Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">
              {initials}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-gray-600">{displayInfo}</span>
              {isAdmitted && (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Admitted
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
