"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Plus, 
  Eye, 
  Download,
  FileImage,
  Calendar,
  User
} from "lucide-react";

interface ImagingResult {
  id: string;
  type: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'REVIEWED';
  findings: string;
  radiologist: string;
  images: string[];
  reportUrl?: string;
}

interface PatientImagingResultsProps {
  readonly patientId: string;
}

export function PatientImagingResults({ patientId }: PatientImagingResultsProps) {
  // Mock data - in a real implementation, this would come from props or API
  const imagingResults: ImagingResult[] = [
    {
      id: '1',
      type: 'Chest X-Ray',
      date: '2024-01-15',
      status: 'REVIEWED',
      findings: 'Clear lung fields, no acute abnormalities. Heart size normal.',
      radiologist: 'Dr. Johnson',
      images: ['chest-xray-1.jpg', 'chest-xray-2.jpg'],
      reportUrl: '/reports/chest-xray-2024-01-15.pdf'
    },
    {
      id: '2',
      type: 'CT Scan - Abdomen',
      date: '2024-01-10',
      status: 'COMPLETED',
      findings: 'No acute findings. Liver, spleen, and kidneys appear normal.',
      radiologist: 'Dr. Johnson',
      images: ['ct-abdomen-1.jpg', 'ct-abdomen-2.jpg', 'ct-abdomen-3.jpg']
    },
    {
      id: '3',
      type: 'MRI - Brain',
      date: '2024-01-05',
      status: 'PENDING',
      findings: 'Study in progress, preliminary results pending.',
      radiologist: 'Dr. Williams',
      images: []
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
      case 'REVIEWED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (imagingResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Imaging Results
          </CardTitle>
          <CardDescription>
            Patient imaging studies and radiology reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Imaging Results</h3>
            <p className="text-gray-600 mb-4">
              No imaging studies have been performed for this patient.
            </p>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Order Imaging
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Imaging Results
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {imagingResults.length} results
            </Badge>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Order
            </Button>
          </div>
        </div>
        <CardDescription>
          Radiology studies, imaging reports, and diagnostic findings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {imagingResults.map((result) => (
            <div key={result.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileImage className="h-4 w-4 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{result.type}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(result.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{result.radiologist}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(result.date)}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-700">
                      <strong>Findings:</strong> {result.findings}
                    </p>
                  </div>

                  {result.images.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Images ({result.images.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {result.images.map((image, index) => (
                          <div key={`${result.id}-${index}`} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                            <FileImage className="h-3 w-3" />
                            <span>{image}</span>
                          </div>
                        ))}
                      </div>
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
                    {result.reportUrl && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Imaging Statistics */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Reviewed</span>
            </div>
            <p className="text-lg font-bold text-green-900">
              {imagingResults.filter(result => result.status === 'REVIEWED').length}
            </p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Completed</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {imagingResults.filter(result => result.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Pending</span>
            </div>
            <p className="text-lg font-bold text-yellow-900">
              {imagingResults.filter(result => result.status === 'PENDING').length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
