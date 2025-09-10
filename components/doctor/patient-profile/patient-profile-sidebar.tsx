"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Pill, Microscope, Calendar } from "lucide-react";
import { PatientProfileData } from "@/types/patient-profile";

interface PatientProfileSidebarProps {
  readonly patient: PatientProfileData;
  readonly onClinicalAction: (action: ClinicalAction) => void;
}

export type ClinicalAction = 
  | 'add-note'
  | 'write-diagnosis' 
  | 'prescribe-medication'
  | 'order-lab-test'
  | 'schedule-followup';

export function PatientProfileSidebar({ patient, onClinicalAction }: PatientProfileSidebarProps) {
  const handleAction = (action: ClinicalAction) => {
    onClinicalAction(action);
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500">Phone</span>
            <p className="font-medium">{patient.phone}</p>
          </div>
          <div>
            <span className="text-gray-500">Email</span>
            <p className="font-medium">{patient.email}</p>
          </div>
          <div>
            <span className="text-gray-500">Address</span>
            <p className="font-medium">{patient.address}</p>
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{patient.emergencyContact.name}</p>
          <p className="text-gray-600">{patient.emergencyContact.phone}</p>
          <p className="text-gray-500">{patient.emergencyContact.relationship}</p>
        </div>
      </Card>

      {/* Insurance */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Insurance</h3>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{patient.insurance.provider}</p>
          <p className="text-gray-600">Policy: {patient.insurance.policyNumber}</p>
          <p className="text-gray-500">Group: {patient.insurance.groupNumber}</p>
        </div>
      </Card>

      {/* Clinical Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Clinical Actions</h3>
        <div className="space-y-2">
          <Button 
            className="w-full justify-start" 
            variant="outline" 
            size="sm"
            onClick={() => handleAction('add-note')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Add Clinical Note
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline" 
            size="sm"
            onClick={() => handleAction('write-diagnosis')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Write Diagnosis
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline" 
            size="sm"
            onClick={() => handleAction('prescribe-medication')}
          >
            <Pill className="h-4 w-4 mr-2" />
            Prescribe Medication
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline" 
            size="sm"
            onClick={() => handleAction('order-lab-test')}
          >
            <Microscope className="h-4 w-4 mr-2" />
            Order Lab Test
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline" 
            size="sm"
            onClick={() => handleAction('schedule-followup')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Follow-up
          </Button>
        </div>
      </Card>
    </div>
  );
}
