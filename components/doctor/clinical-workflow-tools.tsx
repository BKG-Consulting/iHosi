"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  FileText, 
  Pill, 
  Microscope, 
  Camera, 
  Calendar,
  Users,
  Clipboard,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";

interface ClinicalWorkflowToolsProps {
  readonly patientId: string;
}

export function ClinicalWorkflowTools({ patientId }: ClinicalWorkflowToolsProps) {
  const clinicalTools = [
    {
      id: 'diagnosis',
      name: 'Write Diagnosis',
      description: 'Record medical diagnoses and conditions',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      status: 'available',
      requiresConsent: true
    },
    {
      id: 'prescription',
      name: 'Prescribe Medication',
      description: 'Prescribe and manage medications',
      icon: Pill,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      status: 'available',
      requiresConsent: true
    },
    {
      id: 'lab-test',
      name: 'Order Lab Test',
      description: 'Order laboratory tests and procedures',
      icon: Microscope,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      status: 'available',
      requiresConsent: true
    },
    {
      id: 'imaging',
      name: 'Order Imaging',
      description: 'Order X-rays, CT scans, MRI, and other imaging',
      icon: Camera,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      status: 'available',
      requiresConsent: true
    },
    {
      id: 'referral',
      name: 'Refer to Specialist',
      description: 'Refer patient to other medical specialists',
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      status: 'available',
      requiresConsent: true
    },
    {
      id: 'vitals',
      name: 'Record Vitals',
      description: 'Record and update vital signs',
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      status: 'available',
      requiresConsent: true
    },
    {
      id: 'assessment',
      name: 'Nursing Assessment',
      description: 'Complete nursing assessment forms',
      icon: Clipboard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      status: 'available',
      requiresConsent: true
    },
    {
      id: 'follow-up',
      name: 'Schedule Follow-up',
      description: 'Schedule follow-up appointments',
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      status: 'available',
      requiresConsent: false
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'restricted':
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'restricted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToolClick = (toolId: string) => {
    // In a real implementation, this would navigate to the specific tool or open a modal
    console.log(`Opening tool: ${toolId} for patient: ${patientId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-600" />
          Clinical Tools
        </CardTitle>
        <CardDescription>
          Available clinical workflow tools for this patient
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {clinicalTools.map((tool) => {
          const Icon = tool.icon;
          const StatusIcon = getStatusIcon(tool.status);
          
          return (
            <button
              key={tool.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full text-left"
              onClick={() => handleToolClick(tool.id)}
              type="button"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${tool.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${tool.color}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{tool.name}</h4>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {tool.requiresConsent && (
                  <Badge variant="outline" className="text-xs">
                    Requires Consent
                  </Badge>
                )}
                <Badge className={getStatusColor(tool.status)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {tool.status}
                </Badge>
              </div>
            </button>
          );
        })}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <Plus className="h-3 w-3 mr-1" />
              New Note
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              View History
            </Button>
          </div>
        </div>

        {/* Clinical Guidelines */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Clinical Guidelines</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
              <span>Verify patient consent before accessing medical records</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
              <span>Document all clinical decisions and treatments</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
              <span>Follow evidence-based clinical protocols</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
              <span>Maintain patient confidentiality and privacy</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
