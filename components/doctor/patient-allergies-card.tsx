"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Plus, 
  Edit, 
  X,
  Shield,
  AlertCircle
} from "lucide-react";

interface PatientAllergiesCardProps {
  readonly allergies: string[];
}

export function PatientAllergiesCard({ allergies }: PatientAllergiesCardProps) {
  const getSeverityColor = (allergy: string) => {
    const lowerAllergy = allergy.toLowerCase();
    if (lowerAllergy.includes('severe') || lowerAllergy.includes('anaphylaxis')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (lowerAllergy.includes('moderate') || lowerAllergy.includes('severe')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getSeverityIcon = (allergy: string) => {
    const lowerAllergy = allergy.toLowerCase();
    if (lowerAllergy.includes('severe') || lowerAllergy.includes('anaphylaxis')) {
      return AlertCircle;
    }
    if (lowerAllergy.includes('moderate')) {
      return AlertTriangle;
    }
    return Shield;
  };

  const getSeverityLevel = (allergy: string) => {
    const lowerAllergy = allergy.toLowerCase();
    if (lowerAllergy.includes('severe') || lowerAllergy.includes('anaphylaxis')) {
      return 'Severe';
    }
    if (lowerAllergy.includes('moderate')) {
      return 'Moderate';
    }
    return 'Mild';
  };

  if (allergies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Allergies
          </CardTitle>
          <CardDescription>
            Patient allergy information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Known Allergies</h3>
            <p className="text-gray-600 mb-4">
              No allergies have been recorded for this patient.
            </p>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Allergy
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const severeAllergies = allergies.filter(allergy => 
    allergy.toLowerCase().includes('severe') || 
    allergy.toLowerCase().includes('anaphylaxis')
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Allergies
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {allergies.length} {allergies.length === 1 ? 'allergy' : 'allergies'}
            </Badge>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
        <CardDescription>
          Patient allergy information and severity levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {severeAllergies.length > 0 && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This patient has severe allergies that require immediate attention.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {allergies.map((allergy) => {
            const severity = getSeverityLevel(allergy);
            const color = getSeverityColor(allergy);
            const Icon = getSeverityIcon(allergy);
            
            return (
              <div key={`${allergy}-${severity}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{allergy}</p>
                    <p className="text-sm text-gray-600">Severity: {severity}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={color}>
                    {severity}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Allergy Management Tips</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Always verify allergies before prescribing medications</li>
            <li>• Check for cross-reactivity with similar substances</li>
            <li>• Document any adverse reactions immediately</li>
            <li>• Ensure emergency medications are available for severe allergies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
