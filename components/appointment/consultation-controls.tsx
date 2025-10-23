'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Play, CheckCircle, Clock } from 'lucide-react';
import { startConsultation, completeConsultation } from '@/app/actions/consultation';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ConsultationControlsProps {
  appointmentId: number;
  doctorId: string;
  status: string;
  isPatient: boolean;
  isDoctor: boolean;
  isNurse: boolean;
}

export function ConsultationControls({
  appointmentId,
  doctorId,
  status,
  isPatient,
  isDoctor,
  isNurse
}: ConsultationControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const canModify = isDoctor || isNurse;

  const handleStartConsultation = async () => {
    setIsLoading(true);
    try {
      const result = await startConsultation(appointmentId, doctorId);
      
      if (result.success) {
        toast.success(result.message || 'Consultation started');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to start consultation');
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteConsultation = async () => {
    setIsLoading(true);
    try {
      const result = await completeConsultation(appointmentId, doctorId);
      
      if (result.success) {
        toast.success(result.message || 'Consultation completed');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to complete consultation');
      }
    } catch (error) {
      console.error('Error completing consultation:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show controls to patients
  if (isPatient) {
    // Show status for patients
    if (status === 'IN_PROGRESS') {
      return (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
              <p className="text-sm font-medium text-purple-800">
                Consultation in Progress
              </p>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              Your doctor is currently documenting this consultation.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (status === 'COMPLETED') {
      return (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Consultation Completed
              </p>
            </div>
            <p className="text-xs text-green-700 mb-3">
              Your consultation has been completed. View diagnosis, vitals, and prescriptions in the tabs above.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                📄 Download Summary
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                💊 View Prescription
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  }

  // Show controls for doctors and nurses
  if (!canModify) return null;

  // SCHEDULED status → Show "Start Consultation"
  if (status === 'SCHEDULED') {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">
                Ready to Start Consultation?
              </p>
              <p className="text-xs text-blue-700">
                This will mark the appointment as in progress and allow you to document clinical findings.
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
          <Button 
            onClick={handleStartConsultation}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Consultation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // IN_PROGRESS status → Show "Complete Consultation"
  if (status === 'IN_PROGRESS') {
    return (
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-purple-800">
              Consultation in Progress
            </p>
          </div>
          <p className="text-xs text-purple-700 mb-3">
            Document findings using the tabs above (Vital Signs, Diagnosis, etc.), then click complete when done.
          </p>
          <Button 
            onClick={handleCompleteConsultation}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Consultation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // COMPLETED status → Show completion info
  if (status === 'COMPLETED') {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Consultation Completed
            </p>
          </div>
          <p className="text-xs text-green-700">
            All clinical records have been documented and are available in the tabs above.
            Patient has been notified.
          </p>
        </CardContent>
      </Card>
    );
  }

  // PENDING or CANCELLED - no controls needed
  return null;
}

