"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pill, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued' | 'completed';
  prescribedBy: string;
  notes?: string;
  sideEffects?: string[];
}

interface PatientMedicationsCardProps {
  readonly patientId: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescribedBy: string;
  }>;
}

export function PatientMedicationsCard({ patientId, medications: propMedications }: PatientMedicationsCardProps) {
  // Use passed medications or mock data
  const medications: Medication[] = propMedications ? propMedications.map(med => ({
    id: Math.random().toString(),
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    startDate: med.startDate,
    status: 'active' as const,
    prescribedBy: med.prescribedBy,
    notes: '',
    sideEffects: []
  })) : [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: '2020-03-15',
      status: 'active',
      prescribedBy: 'Dr. Smith',
      notes: 'For hypertension management',
      sideEffects: []
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      startDate: '2019-08-22',
      status: 'active',
      prescribedBy: 'Dr. Johnson',
      notes: 'For type 2 diabetes',
      sideEffects: ['Mild gastrointestinal upset']
    },
    {
      id: '3',
      name: 'Amoxicillin',
      dosage: '875mg',
      frequency: 'Twice daily',
      startDate: '2023-12-10',
      endDate: '2023-12-17',
      status: 'completed',
      prescribedBy: 'Dr. Williams',
      notes: '7-day course for pneumonia',
      sideEffects: []
    },
    {
      id: '4',
      name: 'Sumatriptan',
      dosage: '50mg',
      frequency: 'As needed for migraine',
      startDate: '2021-05-08',
      status: 'active',
      prescribedBy: 'Dr. Brown',
      notes: 'Take at first sign of migraine',
      sideEffects: ['Drowsiness', 'Nausea']
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'discontinued':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'discontinued':
        return AlertTriangle;
      case 'completed':
        return Clock;
      default:
        return Pill;
    }
  };

  if (medications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            Medications
          </CardTitle>
          <CardDescription>
            Patient current and past medications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Medications</h3>
            <p className="text-gray-600 mb-4">
              No medications have been prescribed for this patient.
            </p>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Prescribe Medication
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeMedications = medications.filter(med => med.status === 'active');
  const discontinuedMedications = medications.filter(med => med.status === 'discontinued');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            Medications
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {medications.length} medications
            </Badge>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Prescribe
            </Button>
          </div>
        </div>
        <CardDescription>
          Current and past medications, dosages, and side effects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.map((medication) => {
            const StatusIcon = getStatusIcon(medication.status);
            
            return (
              <div key={medication.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className="h-4 w-4 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{medication.name}</h4>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} • {medication.frequency}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{medication.prescribedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Started {formatDate(medication.startDate)}</span>
                      </div>
                      {medication.endDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Ended {formatDate(medication.endDate)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </Badge>
                    </div>

                    {medication.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {medication.notes}
                        </p>
                      </div>
                    )}

                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Side Effects:</p>
                        <div className="flex flex-wrap gap-1">
                          {medication.sideEffects.map((sideEffect, index) => (
                            <Badge key={`${medication.id}-side-${index}`} variant="outline" className="text-xs">
                              {sideEffect}
                            </Badge>
                          ))}
                        </div>
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

        {/* Medication Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Active</span>
            </div>
            <p className="text-lg font-bold text-green-900">{activeMedications.length}</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Discontinued</span>
            </div>
            <p className="text-lg font-bold text-red-900">{discontinuedMedications.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
