'use client';

import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { Doctor } from '@/types/doctor-dashboard';

interface DashboardHeaderProps {
  doctor: Doctor;
  isAvailable: boolean;
  aiEnabled: boolean;
  onAvailabilityToggle: () => void;
  onAiToggle: () => void;
}

export function DashboardHeader({
  doctor,
  isAvailable,
  aiEnabled,
  onAvailabilityToggle,
  onAiToggle
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, Dr. {doctor.name.split(' ').pop()}
        </h1>
        <p className="text-gray-600 mt-1">
          {doctor.specialization} • {doctor.department}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* AI Toggle */}
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium">AI</span>
          <Button
            variant={aiEnabled ? "default" : "outline"}
            size="sm"
            onClick={onAiToggle}
            className={`h-8 px-3 text-xs ${aiEnabled ? "bg-purple-600 hover:bg-purple-700" : ""}`}
          >
            {aiEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>
        
        {/* Compact Availability Status */}
        <button
          onClick={onAvailabilityToggle}
          className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${
            isAvailable ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm font-medium text-gray-600">
            {isAvailable ? 'Available' : 'Busy'}
          </span>
        </button>
      </div>
    </div>
  );
}


