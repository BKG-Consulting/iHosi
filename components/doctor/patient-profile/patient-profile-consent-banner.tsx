"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, Eye } from "lucide-react";

interface PatientProfileConsentBannerProps {
  readonly patientName: string;
  readonly onRequestConsent: () => void;
  readonly onViewLimitedProfile: () => void;
}

export function PatientProfileConsentBanner({ 
  patientName, 
  onRequestConsent, 
  onViewLimitedProfile 
}: PatientProfileConsentBannerProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium">Consent Required</p>
            <p className="text-sm text-gray-600 mt-1">
              You need patient consent to access {patientName}'s full medical records.
            </p>
          </div>
          <div className="flex space-x-2 ml-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewLimitedProfile}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Limited Profile
            </Button>
            <Button 
              size="sm" 
              onClick={onRequestConsent}
            >
              Request Consent
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
