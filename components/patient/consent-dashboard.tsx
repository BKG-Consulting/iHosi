"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { DataCategory, MedicalActionType } from "@/lib/granular-consent-management";

interface ConsentRecord {
  id: string;
  doctor?: {
    name: string;
    specialty?: string;
  };
  consent_type: string;
  data_categories: DataCategory[];
  medical_actions: MedicalActionType[];
  status: string;
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  restrictions: string[];
}

interface PatientConsentDashboardProps {
  patientId: string;
}

export function PatientConsentDashboard({ patientId }: PatientConsentDashboardProps) {
  const [consentData, setConsentData] = useState<{
    activeConsents: ConsentRecord[];
    expiredConsents: ConsentRecord[];
    revokedConsents: ConsentRecord[];
    doctorRelationships: any[];
  }>({
    activeConsents: [],
    expiredConsents: [],
    revokedConsents: [],
    doctorRelationships: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);

  useEffect(() => {
    fetchConsentData();
  }, [patientId]);

  const fetchConsentData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call your API
      const response = await fetch(`/api/patient/${patientId}/consent-dashboard`);
      const data = await response.json();
      setConsentData(data);
    } catch (error) {
      console.error('Failed to fetch consent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GRANTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'EXPIRED':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REVOKED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GRANTED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'EXPIRED':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expired</Badge>;
      case 'REVOKED':
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDataCategoryLabel = (category: DataCategory) => {
    const labels: Record<DataCategory, string> = {
      [DataCategory.DEMOGRAPHICS]: 'Demographics',
      [DataCategory.CONTACT_INFO]: 'Contact Information',
      [DataCategory.MEDICAL_HISTORY]: 'Medical History',
      [DataCategory.ALLERGIES]: 'Allergies',
      [DataCategory.MEDICATIONS]: 'Medications',
      [DataCategory.VITAL_SIGNS]: 'Vital Signs',
      [DataCategory.LAB_RESULTS]: 'Lab Results',
      [DataCategory.IMAGING_RESULTS]: 'Imaging Results',
      [DataCategory.DIAGNOSES]: 'Diagnoses',
      [DataCategory.TREATMENT_PLANS]: 'Treatment Plans',
      [DataCategory.PRESCRIPTIONS]: 'Prescriptions',
      [DataCategory.BILLING_INFO]: 'Billing Information',
      [DataCategory.INSURANCE_INFO]: 'Insurance Information',
      [DataCategory.EMERGENCY_CONTACTS]: 'Emergency Contacts',
      [DataCategory.FAMILY_HISTORY]: 'Family History',
      [DataCategory.SOCIAL_HISTORY]: 'Social History',
      [DataCategory.MENTAL_HEALTH]: 'Mental Health',
      [DataCategory.SUBSTANCE_USE]: 'Substance Use',
      [DataCategory.SEXUAL_HEALTH]: 'Sexual Health',
      [DataCategory.GENETIC_INFO]: 'Genetic Information'
    };
    return labels[category] || category;
  };

  const getMedicalActionLabel = (action: MedicalActionType) => {
    const labels: Record<MedicalActionType, string> = {
      [MedicalActionType.VIEW_MEDICAL_RECORDS]: 'View Medical Records',
      [MedicalActionType.WRITE_DIAGNOSIS]: 'Write Diagnoses',
      [MedicalActionType.PRESCRIBE_MEDICATION]: 'Prescribe Medications',
      [MedicalActionType.ORDER_LAB_TESTS]: 'Order Lab Tests',
      [MedicalActionType.ORDER_IMAGING]: 'Order Imaging',
      [MedicalActionType.REFER_TO_SPECIALIST]: 'Refer to Specialists',
      [MedicalActionType.SHARE_WITH_OTHER_DOCTORS]: 'Share with Other Doctors',
      [MedicalActionType.USE_FOR_RESEARCH]: 'Use for Research',
      [MedicalActionType.MARKETING_COMMUNICATIONS]: 'Marketing Communications',
      [MedicalActionType.EMERGENCY_ACCESS]: 'Emergency Access'
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consent Management</h2>
          <p className="text-gray-600">Manage your health information sharing preferences</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Manage Preferences
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {consentData.activeConsents.length}
            </div>
            <p className="text-xs text-gray-600">
              Currently active permissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Consents</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {consentData.expiredConsents.length}
            </div>
            <p className="text-xs text-gray-600">
              Need renewal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revoked Consents</CardTitle>
            <ShieldX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {consentData.revokedConsents.length}
            </div>
            <p className="text-xs text-gray-600">
              Previously revoked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consent Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Consents</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="revoked">Revoked</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {consentData.activeConsents.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No active consents found. You may need to grant consent to your doctors.
              </AlertDescription>
            </Alert>
          ) : (
            consentData.activeConsents.map((consent) => (
              <Card key={consent.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(consent.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {consent.doctor?.name || 'General Consent'}
                        </CardTitle>
                        <CardDescription>
                          {consent.doctor?.specialty && `${consent.doctor.specialty} • `}
                          Granted on {formatDate(consent.granted_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(consent.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConsent(consent)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Data Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {consent.data_categories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {getDataCategoryLabel(category)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Medical Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {consent.medical_actions.map((action) => (
                          <Badge key={action} variant="secondary" className="text-xs">
                            {getMedicalActionLabel(action)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {consent.expires_at && (
                      <div className="text-sm text-gray-600">
                        <strong>Expires:</strong> {formatDate(consent.expires_at)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {consentData.expiredConsents.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No expired consents. All your active consents are up to date.
              </AlertDescription>
            </Alert>
          ) : (
            consentData.expiredConsents.map((consent) => (
              <Card key={consent.id} className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(consent.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {consent.doctor?.name || 'General Consent'}
                        </CardTitle>
                        <CardDescription>
                          Expired on {consent.expires_at && formatDate(consent.expires_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(consent.status)}
                      <Button variant="outline" size="sm">
                        Renew Consent
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="revoked" className="space-y-4">
          {consentData.revokedConsents.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No revoked consents. You haven't revoked any permissions.
              </AlertDescription>
            </Alert>
          ) : (
            consentData.revokedConsents.map((consent) => (
              <Card key={consent.id} className="border-red-200 bg-red-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(consent.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {consent.doctor?.name || 'General Consent'}
                        </CardTitle>
                        <CardDescription>
                          Revoked on {consent.revoked_at && formatDate(consent.revoked_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(consent.status)}
                      <Button variant="outline" size="sm">
                        Grant New Consent
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          {consentData.doctorRelationships.length === 0 ? (
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                No doctor relationships found. Your doctors will appear here once you grant consent.
              </AlertDescription>
            </Alert>
          ) : (
            consentData.doctorRelationships.map((relationship) => (
              <Card key={relationship.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{relationship.doctor.name}</CardTitle>
                        <CardDescription>
                          {relationship.doctor.specialty} • 
                          Status: <Badge variant={relationship.status === 'active' ? 'default' : 'secondary'}>
                            {relationship.status}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Since {formatDate(relationship.consent_granted_at)}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Consent Details Modal would go here */}
      {selectedConsent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Consent Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedConsent(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Detailed consent information would go here */}
              <p>Detailed consent information for {selectedConsent.doctor?.name}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

