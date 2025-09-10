"use client";

import { useState } from "react";
import { usePatientProfile } from "@/hooks/use-patient-profile";
import { PatientProfileHeader } from "@/components/doctor/patient-profile/patient-profile-header";
import { PatientProfileSidebar, ClinicalAction } from "@/components/doctor/patient-profile/patient-profile-sidebar";
import { PatientProfileTabs } from "@/components/doctor/patient-profile/patient-profile-tabs";
import { PatientProfileLoading } from "@/components/doctor/patient-profile/patient-profile-loading";
import { PatientProfileError } from "@/components/doctor/patient-profile/patient-profile-error";
import { PatientProfileConsentBanner } from "@/components/doctor/patient-profile/patient-profile-consent-banner";
import { LimitedPatientProfile } from "@/components/doctor/limited-patient-profile";

export default function PatientProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const {
    data: patientData,
    loading,
    error,
    consentRequired,
    showLimitedProfile,
    router,
    fetchPatientData,
    handleRequestConsent,
    handleViewLimitedProfile,
  } = usePatientProfile();

  const handleBack = () => {
    router.back();
  };

  const handleClinicalAction = (action: ClinicalAction) => {
    // TODO: Implement clinical actions based on action type
    switch (action) {
      case 'add-note':
        console.log('Opening add note dialog');
        break;
      case 'write-diagnosis':
        console.log('Opening diagnosis form');
        break;
      case 'prescribe-medication':
        console.log('Opening prescription form');
        break;
      case 'order-lab-test':
        console.log('Opening lab test order form');
        break;
      case 'schedule-followup':
        console.log('Opening follow-up scheduling');
        break;
      default:
        console.log('Unknown clinical action:', action);
    }
  };

  // Loading state
  if (loading) {
    return <PatientProfileLoading />;
  }

  // Error state
  if (error || !patientData) {
    return (
      <PatientProfileError 
        error={error || 'Patient not found'} 
        onRetry={fetchPatientData} 
      />
    );
  }

  // Consent required state
  if (consentRequired && !showLimitedProfile) {
    return (
      <PatientProfileConsentBanner
        patientName={patientData.name}
        onRequestConsent={handleRequestConsent}
        onViewLimitedProfile={handleViewLimitedProfile}
      />
    );
  }

  // Limited profile state
  if (consentRequired && showLimitedProfile) {
    return (
      <div className="space-y-6">
        <PatientProfileConsentBanner
          patientName={patientData.name}
          onRequestConsent={handleRequestConsent}
          onViewLimitedProfile={() => {}} // Already viewing limited profile
        />
        <LimitedPatientProfile
          patient={{
            id: patientData.id,
            first_name: patientData.name.split(' ')[0] || '',
            last_name: patientData.name.split(' ').slice(1).join(' ') || '',
            email: patientData.email,
            phone: patientData.phone,
            address: patientData.address,
            date_of_birth: new Date().toISOString(),
            gender: patientData.gender,
            emergency_contact_name: patientData.emergencyContact.name,
            emergency_contact_number: patientData.emergencyContact.phone,
            blood_group: undefined
          }}
          appointments={patientData.appointments || []}
          onRequestConsent={handleRequestConsent}
        />
      </div>
    );
  }

  // Main content - Full patient profile
  return (
    <div className="space-y-6">
      <PatientProfileHeader 
        patient={patientData} 
        onBack={handleBack} 
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <PatientProfileSidebar 
          patient={patientData} 
          onClinicalAction={handleClinicalAction} 
        />
        
        <div className="xl:col-span-3">
          <PatientProfileTabs 
            patient={patientData} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>
      </div>
    </div>
  );
}
