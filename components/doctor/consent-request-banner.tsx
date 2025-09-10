"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  User,
  Calendar,
  FileText
} from "lucide-react";

interface ConsentRequestBannerProps {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  onRequestConsent: () => void;
  onViewLimitedProfile: () => void;
}

export function ConsentRequestBanner({ 
  patientId, 
  patientName, 
  doctorId, 
  doctorName,
  onRequestConsent,
  onViewLimitedProfile 
}: ConsentRequestBannerProps) {
  return (
    <Card className="border-amber-200 bg-amber-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-amber-800">
                Patient Data Access Required
              </h3>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                Consent Required
              </Badge>
            </div>
            
            <p className="text-amber-700 mb-4">
              To access <strong>{patientName}'s</strong> complete medical records, you need explicit consent. 
              This ensures patient privacy and HIPAA compliance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  What you can access:
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Basic demographic information
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Appointment history
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Emergency contact information
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  What requires consent:
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    Medical history & diagnoses
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    Lab results & imaging
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    Medications & treatments
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={onRequestConsent}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Request Patient Consent
              </Button>
              
              <Button 
                onClick={onViewLimitedProfile}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <User className="h-4 w-4 mr-2" />
                View Limited Profile
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Note:</strong> Consent requests are sent to the patient via email and SMS. 
                  Once granted, you'll have access to the patient's complete medical records for the duration of their care.
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
