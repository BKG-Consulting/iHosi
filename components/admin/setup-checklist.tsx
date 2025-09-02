"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";

interface SetupItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'optional';
  route: string;
  required: boolean;
}

interface SetupChecklistProps {
  completedItems?: string[];
}

const SETUP_ITEMS: SetupItem[] = [
  {
    id: 'departments',
    title: 'Create Departments',
    description: 'Set up hospital departments and organizational structure',
    status: 'pending',
    route: '/admin/hospital/departments',
    required: true
  },
  {
    id: 'wards',
    title: 'Configure Wards',
    description: 'Set up patient wards and assign to departments',
    status: 'pending',
    route: '/admin/wards',
    required: true
  },
  {
    id: 'beds',
    title: 'Set up Beds',
    description: 'Configure patient beds and assign to wards',
    status: 'pending',
    route: '/admin/wards',
    required: true
  },
  {
    id: 'equipment',
    title: 'Equipment Setup',
    description: 'Define medical equipment categories and types',
    status: 'pending',
    route: '/admin/equipment',
    required: false
  },
  {
    id: 'staff',
    title: 'Register Staff',
    description: 'Create accounts for nurses, lab technicians, and other staff',
    status: 'pending',
    route: '/admin/staff',
    required: true
  },
  {
    id: 'doctors',
    title: 'Create Doctor Accounts',
    description: 'Register medical professionals and assign to departments',
    status: 'pending',
    route: '/record/doctors',
    required: true
  },
  {
    id: 'department-heads',
    title: 'Assign Department Heads',
    description: 'Assign doctors as department heads',
    status: 'pending',
    route: '/admin/hospital/departments',
    required: false
  },
  {
    id: 'services',
    title: 'Define Services',
    description: 'Set up medical services and pricing',
    status: 'pending',
    route: '/admin/services',
    required: false
  }
];

export const SetupChecklist = ({ completedItems = [] }: SetupChecklistProps) => {
  const getItemStatus = (itemId: string): 'pending' | 'completed' | 'optional' => {
    if (completedItems.includes(itemId)) return 'completed';
    return SETUP_ITEMS.find(item => item.id === itemId)?.status || 'pending';
  };

  const getStatusIcon = (status: 'pending' | 'completed' | 'optional') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'optional':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'completed' | 'optional') => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'optional':
        return <Badge className="bg-amber-100 text-amber-800">Optional</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const completedCount = completedItems.length;
  const totalRequired = SETUP_ITEMS.filter(item => item.required).length;
  const progressPercentage = Math.round((completedCount / totalRequired) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Setup Progress
        </CardTitle>
        <CardDescription>
          Track your hospital setup progress. Complete required items to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Setup Progress</span>
            <span className="text-sm text-gray-600">{completedCount}/{totalRequired} Required Items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {progressPercentage}% Complete
          </p>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {SETUP_ITEMS.map((item) => {
            const status = getItemStatus(item.id);
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(status)}
                  {status === 'pending' && (
                    <a 
                      href={item.route}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Setup →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
          {progressPercentage === 100 ? (
            <p className="text-sm text-blue-700">
              🎉 All required setup items are complete! Your hospital is ready for operations.
            </p>
          ) : (
            <p className="text-sm text-blue-700">
              Focus on completing the required items first. Optional items can be configured later as needed.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
