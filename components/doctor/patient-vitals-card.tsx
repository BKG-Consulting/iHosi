"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Weight, 
  Droplets, 
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Edit
} from "lucide-react";

interface VitalsData {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  bmi: number;
  oxygenSaturation: number;
  lastUpdated: string;
}

interface PatientVitalsCardProps {
  vitals: VitalsData;
}

export function PatientVitalsCard({ vitals }: PatientVitalsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVitalStatus = (value: number, normalRange: { min: number; max: number }) => {
    if (value < normalRange.min) return { status: 'low', color: 'bg-blue-100 text-blue-800', icon: TrendingDown };
    if (value > normalRange.max) return { status: 'high', color: 'bg-red-100 text-red-800', icon: TrendingUp };
    return { status: 'normal', color: 'bg-green-100 text-green-800', icon: Minus };
  };

  const getBloodPressureStatus = (bp: string) => {
    const [systolic, diastolic] = bp.split('/').map(Number);
    if (systolic < 90 || diastolic < 60) return { status: 'low', color: 'bg-blue-100 text-blue-800', icon: TrendingDown };
    if (systolic > 140 || diastolic > 90) return { status: 'high', color: 'bg-red-100 text-red-800', icon: TrendingUp };
    return { status: 'normal', color: 'bg-green-100 text-green-800', icon: Minus };
  };

  const heartRateStatus = getVitalStatus(vitals.heartRate, { min: 60, max: 100 });
  const temperatureStatus = getVitalStatus(vitals.temperature, { min: 97, max: 99.5 });
  const oxygenStatus = getVitalStatus(vitals.oxygenSaturation, { min: 95, max: 100 });
  const bmiStatus = getVitalStatus(vitals.bmi, { min: 18.5, max: 24.9 });
  const bloodPressureStatus = getBloodPressureStatus(vitals.bloodPressure);

  const HeartRateIcon = heartRateStatus.icon;
  const TemperatureIcon = temperatureStatus.icon;
  const OxygenIcon = oxygenStatus.icon;
  const BMIIcon = bmiStatus.icon;
  const BloodPressureIcon = bloodPressureStatus.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Vital Signs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Last updated: {formatDate(vitals.lastUpdated)}
            </Badge>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-1" />
              Update
            </Button>
          </div>
        </div>
        <CardDescription>
          Current vital signs and health metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blood Pressure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
              </div>
              <Badge className={bloodPressureStatus.color}>
                <BloodPressureIcon className="h-3 w-3 mr-1" />
                {bloodPressureStatus.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{vitals.bloodPressure}</div>
            <div className="text-xs text-gray-500">mmHg</div>
          </div>

          {/* Heart Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Heart Rate</span>
              </div>
              <Badge className={heartRateStatus.color}>
                <HeartRateIcon className="h-3 w-3 mr-1" />
                {heartRateStatus.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{vitals.heartRate}</div>
            <div className="text-xs text-gray-500">bpm</div>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Temperature</span>
              </div>
              <Badge className={temperatureStatus.color}>
                <TemperatureIcon className="h-3 w-3 mr-1" />
                {temperatureStatus.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{vitals.temperature}°F</div>
            <div className="text-xs text-gray-500">Fahrenheit</div>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Weight</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{vitals.weight}</div>
            <div className="text-xs text-gray-500">lbs</div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Height</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{vitals.height}</div>
            <div className="text-xs text-gray-500">inches</div>
          </div>

          {/* BMI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">BMI</span>
              </div>
              <Badge className={bmiStatus.color}>
                <BMIIcon className="h-3 w-3 mr-1" />
                {bmiStatus.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{vitals.bmi.toFixed(1)}</div>
            <div className="text-xs text-gray-500">kg/m²</div>
          </div>

          {/* Oxygen Saturation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-medium text-gray-700">Oxygen Sat</span>
              </div>
              <Badge className={oxygenStatus.color}>
                <OxygenIcon className="h-3 w-3 mr-1" />
                {oxygenStatus.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">{vitals.oxygenSaturation}%</div>
            <div className="text-xs text-gray-500">SpO₂</div>
          </div>
        </div>

        {/* Normal Ranges Reference */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Normal Ranges</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Blood Pressure:</span>
              <br />90-140/60-90 mmHg
            </div>
            <div>
              <span className="font-medium">Heart Rate:</span>
              <br />60-100 bpm
            </div>
            <div>
              <span className="font-medium">Temperature:</span>
              <br />97-99.5°F
            </div>
            <div>
              <span className="font-medium">Oxygen Sat:</span>
              <br />95-100%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
