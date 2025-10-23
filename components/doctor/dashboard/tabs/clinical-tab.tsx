import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, PillBottle, TestTube } from 'lucide-react';

export function ClinicalTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Diagnoses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Diagnosis management</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PillBottle className="h-5 w-5" />
            Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <PillBottle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Prescription management</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Lab Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Lab results management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


