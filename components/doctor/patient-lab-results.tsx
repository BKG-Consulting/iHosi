"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TestTube, 
  Plus, 
  Eye, 
  Download,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  date: string;
  lab: string;
  notes?: string;
}

interface PatientLabResultsProps {
  readonly patientId: string;
}

export function PatientLabResults({ patientId }: PatientLabResultsProps) {
  // Mock data - in a real implementation, this would come from props or API
  const labResults: LabResult[] = [
    {
      id: '1',
      testName: 'Complete Blood Count (CBC)',
      value: '4.2',
      unit: 'x10^9/L',
      referenceRange: '4.0-11.0',
      status: 'normal',
      date: '2024-01-15',
      lab: 'Central Lab',
      notes: 'Within normal limits'
    },
    {
      id: '2',
      testName: 'Hemoglobin',
      value: '14.5',
      unit: 'g/dL',
      referenceRange: '12.0-16.0',
      status: 'normal',
      date: '2024-01-15',
      lab: 'Central Lab'
    },
    {
      id: '3',
      testName: 'Glucose (Fasting)',
      value: '95',
      unit: 'mg/dL',
      referenceRange: '70-100',
      status: 'normal',
      date: '2024-01-10',
      lab: 'Central Lab'
    },
    {
      id: '4',
      testName: 'Cholesterol Total',
      value: '220',
      unit: 'mg/dL',
      referenceRange: '<200',
      status: 'abnormal',
      date: '2024-01-10',
      lab: 'Central Lab',
      notes: 'Elevated, recommend dietary changes'
    },
    {
      id: '5',
      testName: 'Creatinine',
      value: '1.8',
      unit: 'mg/dL',
      referenceRange: '0.6-1.2',
      status: 'critical',
      date: '2024-01-08',
      lab: 'Central Lab',
      notes: 'Elevated, possible kidney dysfunction'
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
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return CheckCircle;
      case 'abnormal':
        return AlertTriangle;
      case 'critical':
        return AlertTriangle;
      default:
        return TestTube;
    }
  };

  if (labResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            Lab Results
          </CardTitle>
          <CardDescription>
            Patient laboratory test results and values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Results</h3>
            <p className="text-gray-600 mb-4">
              No laboratory tests have been performed for this patient.
            </p>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Order Lab Test
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const normalResults = labResults.filter(result => result.status === 'normal');
  const abnormalResults = labResults.filter(result => result.status === 'abnormal');
  const criticalResults = labResults.filter(result => result.status === 'critical');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            Lab Results
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {labResults.length} results
            </Badge>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Order
            </Button>
          </div>
        </div>
        <CardDescription>
          Laboratory test results, values, and reference ranges
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Critical Results Alert */}
        {criticalResults.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Critical Results: {criticalResults.length} test(s) require immediate attention
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {labResults.map((result) => {
            const StatusIcon = getStatusIcon(result.status);
            
            return (
              <div key={result.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className="h-4 w-4 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{result.testName}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(result.date)} • {result.lab}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Value</p>
                        <p className="font-medium text-gray-900">
                          {result.value} {result.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reference Range</p>
                        <p className="font-medium text-gray-900">{result.referenceRange}</p>
                      </div>
                    </div>

                    {result.notes && (
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                        <strong className="text-gray-800">Notes:</strong>
                        <p className="text-gray-700 mt-1">{result.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lab Results Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Normal</span>
            </div>
            <p className="text-lg font-bold text-green-900">{normalResults.length}</p>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Abnormal</span>
            </div>
            <p className="text-lg font-bold text-yellow-900">{abnormalResults.length}</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Critical</span>
            </div>
            <p className="text-lg font-bold text-red-900">{criticalResults.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
