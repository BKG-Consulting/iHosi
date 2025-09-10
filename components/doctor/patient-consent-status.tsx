"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Clock, 
  AlertTriangle,
  Eye,
  Settings,
  Calendar
} from "lucide-react";

interface ConsentStatus {
  hasConsent: boolean;
  dataCategories: string[];
  medicalActions: string[];
  expiresAt: string;
  restrictions: string[];
}

interface PatientConsentStatusProps {
  readonly consentStatus: ConsentStatus;
}

export function PatientConsentStatus({ consentStatus }: PatientConsentStatusProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsentStatus = () => {
    if (!consentStatus.hasConsent) {
      return {
        status: 'No Consent',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: ShieldX,
        description: 'Patient has not granted consent for data access'
      };
    }
    
    const expiresAt = new Date(consentStatus.expiresAt);
    const now = new Date();
    
    if (expiresAt < now) {
      return {
        status: 'Expired',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        description: 'Consent has expired and needs renewal'
      };
    }
    
    return {
      status: 'Active',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: ShieldCheck,
      description: 'Patient has granted consent for data access'
    };
  };

  const consentInfo = getConsentStatus();
  const StatusIcon = consentInfo.icon;

  const getDataCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'DEMOGRAPHICS': 'Demographics',
      'CONTACT_INFO': 'Contact Information',
      'MEDICAL_HISTORY': 'Medical History',
      'ALLERGIES': 'Allergies',
      'MEDICATIONS': 'Medications',
      'VITAL_SIGNS': 'Vital Signs',
      'LAB_RESULTS': 'Lab Results',
      'IMAGING_RESULTS': 'Imaging Results',
      'DIAGNOSES': 'Diagnoses',
      'TREATMENT_PLANS': 'Treatment Plans',
      'PRESCRIPTIONS': 'Prescriptions',
      'BILLING_INFO': 'Billing Information',
      'INSURANCE_INFO': 'Insurance Information',
      'EMERGENCY_CONTACTS': 'Emergency Contacts',
      'FAMILY_HISTORY': 'Family History',
      'SOCIAL_HISTORY': 'Social History',
      'MENTAL_HEALTH': 'Mental Health',
      'SUBSTANCE_USE': 'Substance Use',
      'SEXUAL_HEALTH': 'Sexual Health',
      'GENETIC_INFO': 'Genetic Information'
    };
    return labels[category] || category;
  };

  const getMedicalActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'VIEW_MEDICAL_RECORDS': 'View Medical Records',
      'WRITE_DIAGNOSIS': 'Write Diagnoses',
      'PRESCRIBE_MEDICATION': 'Prescribe Medications',
      'ORDER_LAB_TESTS': 'Order Lab Tests',
      'ORDER_IMAGING': 'Order Imaging',
      'REFER_TO_SPECIALIST': 'Refer to Specialists',
      'SHARE_WITH_OTHER_DOCTORS': 'Share with Other Doctors',
      'USE_FOR_RESEARCH': 'Use for Research',
      'MARKETING_COMMUNICATIONS': 'Marketing Communications',
      'EMERGENCY_ACCESS': 'Emergency Access'
    };
    return labels[action] || action;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Consent Status
        </CardTitle>
        <CardDescription>
          Patient data access permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Consent Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Status</span>
          </div>
          <Badge className={consentInfo.color}>
            {consentInfo.status}
          </Badge>
        </div>

        <p className="text-sm text-gray-600">{consentInfo.description}</p>

        {consentStatus.hasConsent && (
          <div className="space-y-3">
            {/* Expiration Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Expires</span>
              </div>
              <span className="text-sm text-gray-600">
                {formatDate(consentStatus.expiresAt)}
              </span>
            </div>

            {/* Data Categories */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Data Categories</h4>
              <div className="flex flex-wrap gap-1">
                {consentStatus.dataCategories.map((category) => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {getDataCategoryLabel(category)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Medical Actions</h4>
              <div className="flex flex-wrap gap-1">
                {consentStatus.medicalActions.map((action) => (
                  <Badge key={action} variant="secondary" className="text-xs">
                    {getMedicalActionLabel(action)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Restrictions */}
            {consentStatus.restrictions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Restrictions</h4>
                <div className="space-y-1">
                  {consentStatus.restrictions.map((restriction) => (
                    <div key={restriction} className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      {restriction}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200">
          {!consentStatus.hasConsent ? (
            <Button className="w-full" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Request Consent
            </Button>
          ) : (
            <div className="space-y-2">
              <Button className="w-full" size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Consent
              </Button>
              <Button className="w-full" size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          )}
        </div>

        {/* Consent Alerts */}
        {!consentStatus.hasConsent && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Limited Access:</strong> You can only view basic demographic information. 
              Request consent to access medical records and provide treatment.
            </AlertDescription>
          </Alert>
        )}

        {consentStatus.hasConsent && new Date(consentStatus.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Consent Expiring Soon:</strong> This patient's consent will expire in less than 7 days. 
              Consider requesting renewal.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
