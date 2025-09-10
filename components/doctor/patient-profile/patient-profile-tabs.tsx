"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientVitalsCard } from "@/components/doctor/patient-vitals-card";
import { PatientAllergiesCard } from "@/components/doctor/patient-allergies-card";
import { PatientMedicationsCard } from "@/components/doctor/patient-medications-card";
import { PatientMedicalHistory } from "@/components/doctor/patient-medical-history";
import { PatientLabResults } from "@/components/doctor/patient-lab-results";
import { PatientImagingResults } from "@/components/doctor/patient-imaging-results";
import { PatientAppointments } from "@/components/doctor/patient-appointments";
import { PatientNotes } from "@/components/doctor/patient-notes";
import { PatientProfileData } from "@/types/patient-profile";

interface PatientProfileTabsProps {
  readonly patient: PatientProfileData;
  readonly activeTab: string;
  readonly onTabChange: (tab: string) => void;
}

export function PatientProfileTabs({ patient, activeTab, onTabChange }: PatientProfileTabsProps) {
  return (
    <div className="space-y-6">
      {/* Vital Signs - Always Visible */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Vital Signs</h2>
        <PatientVitalsCard vitals={patient.vitals} />
      </div>

      {/* Clinical Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white">
            Medical History
          </TabsTrigger>
          <TabsTrigger value="labs" className="data-[state=active]:bg-white">
            Lab Results
          </TabsTrigger>
          <TabsTrigger value="imaging" className="data-[state=active]:bg-white">
            Imaging
          </TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-white">
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientAllergiesCard allergies={patient.allergies} />
            <PatientMedicationsCard 
              patientId={patient.id} 
              medications={patient.medications} 
            />
          </div>
          <PatientNotes patientId={patient.id} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <PatientMedicalHistory patientId={patient.id} />
          <PatientNotes patientId={patient.id} />
        </TabsContent>

        <TabsContent value="labs" className="space-y-6">
          <PatientLabResults patientId={patient.id} />
        </TabsContent>

        <TabsContent value="imaging" className="space-y-6">
          <PatientImagingResults patientId={patient.id} />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <PatientAppointments patientId={patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
