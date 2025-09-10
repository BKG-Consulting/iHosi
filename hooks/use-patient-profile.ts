import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PatientProfileState } from '@/types/patient-profile';
import { PatientProfileService } from '@/services/patient-profile-service';

export function usePatientProfile() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [state, setState] = useState<PatientProfileState>({
    data: null,
    loading: true,
    error: null,
    consentRequired: false,
    showLimitedProfile: false,
  });

  const fetchPatientData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, consentRequired: false }));
      
      const rawData = await PatientProfileService.fetchPatientData(patientId);
      
      // Transform and validate the data
      const data = PatientProfileService.transformPatientData(rawData);
      
      if (!PatientProfileService.validatePatientData(data)) {
        throw new Error('Invalid patient data received');
      }
      
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      if (error instanceof Error && error.message === 'CONSENT_REQUIRED') {
        setState(prev => ({ 
          ...prev, 
          consentRequired: true, 
          loading: false 
        }));
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          loading: false 
        }));
        console.error('Error fetching patient data:', error);
      }
    }
  };

  const handleRequestConsent = async () => {
    try {
      await PatientProfileService.requestConsent(patientId);
      // Show success message
      alert('Consent request sent to patient. You will be notified when they respond.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send consent request';
      console.error('Error requesting consent:', error);
      alert(`${errorMessage}. Please try again.`);
    }
  };

  const handleViewLimitedProfile = () => {
    setState(prev => ({ ...prev, showLimitedProfile: true }));
  };

  const setActiveTab = (tab: string) => {
    // This could be moved to a separate hook if needed
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  return {
    ...state,
    patientId,
    router,
    fetchPatientData,
    handleRequestConsent,
    handleViewLimitedProfile,
    setActiveTab,
  };
}
