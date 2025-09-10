"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  User,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface MedicalCondition {
  id: string;
  condition: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'chronic';
  severity: 'mild' | 'moderate' | 'severe';
  doctor: string;
  notes?: string;
  treatments?: string[];
}

interface PatientMedicalHistoryProps {
  readonly patientId: string;
}

export function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  // Mock data - in a real implementation, this would come from props or API
  const medicalConditions: MedicalCondition[] = [
    {
      id: '1',
      condition: 'Hypertension',
      diagnosisDate: '2020-03-15',
      status: 'chronic',
      severity: 'moderate',
      doctor: 'Dr. Smith',
      notes: 'Well controlled with medication',
      treatments: ['Lisinopril 10mg daily', 'Lifestyle modifications']
    },
    {
      id: '2',
      condition: 'Type 2 Diabetes',
      diagnosisDate: '2019-08-22',
      status: 'chronic',
      severity: 'mild',
      doctor: 'Dr. Johnson',
      notes: 'HbA1c within target range',
      treatments: ['Metformin 500mg twice daily', 'Dietary counseling']
    },
    {
      id: '3',
      condition: 'Pneumonia',
      diagnosisDate: '2023-12-10',
      status: 'resolved',
      severity: 'moderate',
      doctor: 'Dr. Williams',
      notes: 'Successfully treated with antibiotics',
      treatments: ['Amoxicillin 875mg', 'Rest and fluids']
    },
    {
      id: '4',
      condition: 'Migraine',
      diagnosisDate: '2021-05-08',
      status: 'active',
      severity: 'mild',
      doctor: 'Dr. Brown',
      notes: 'Occasional episodes, well managed',
      treatments: ['Sumatriptan as needed', 'Stress management']
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'chronic':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return AlertCircle;
      case 'resolved':
        return CheckCircle;
      case 'chronic':
        return Calendar;
      default:
        return FileText;
    }
  };

  if (medicalConditions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Medical History
          </CardTitle>
          <CardDescription>
            Patient medical conditions and diagnoses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical History</h3>
            <p className="text-gray-600 mb-4">
              No medical conditions have been recorded for this patient.
            </p>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeConditions = medicalConditions.filter(condition => condition.status === 'active');
  const chronicConditions = medicalConditions.filter(condition => condition.status === 'chronic');
  const resolvedConditions = medicalConditions.filter(condition => condition.status === 'resolved');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Medical History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {medicalConditions.length} conditions
            </Badge>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
        <CardDescription>
          Medical conditions, diagnoses, and treatment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medicalConditions.map((condition) => {
            const StatusIcon = getStatusIcon(condition.status);
            
            return (
              <div key={condition.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className="h-4 w-4 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{condition.condition}</h4>
                        <p className="text-sm text-gray-600">
                          Diagnosed {formatDate(condition.diagnosisDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{condition.doctor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(condition.diagnosisDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getStatusColor(condition.status)}>
                        {condition.status}
                      </Badge>
                      <Badge className={getSeverityColor(condition.severity)}>
                        {condition.severity}
                      </Badge>
                    </div>

                    {condition.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {condition.notes}
                        </p>
                      </div>
                    )}

                    {condition.treatments && condition.treatments.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Treatments:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {condition.treatments.map((treatment, index) => (
                            <li key={`${condition.id}-treatment-${index}`} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{treatment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Medical History Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Active</span>
            </div>
            <p className="text-lg font-bold text-red-900">{activeConditions.length}</p>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Chronic</span>
            </div>
            <p className="text-lg font-bold text-yellow-900">{chronicConditions.length}</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Resolved</span>
            </div>
            <p className="text-lg font-bold text-green-900">{resolvedConditions.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
