import db from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Thermometer, Droplets, Wind } from 'lucide-react';
import { format } from 'date-fns';

interface RecentVitalsWidgetProps {
  patientId: string;
}

export async function RecentVitalsWidget({ patientId }: RecentVitalsWidgetProps) {
  // Get most recent vital signs across all appointments
  const recentVital = await db.vitalSigns.findFirst({
    where: { patient_id: patientId },
    orderBy: { created_at: 'desc' },
    include: {
      medical: {
        include: {
          appointment: {
            include: {
              doctor: true
            }
          }
        }
      }
    }
  });

  if (!recentVital) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#D1F1F2]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#046658]">
            <Activity className="h-5 w-5" />
            Recent Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No vital signs recorded yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Vitals will be recorded during your next consultation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#D1F1F2] to-white rounded-2xl shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-4">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <Activity className="h-5 w-5" />
          Most Recent Vitals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Vital Signs Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Blood Pressure */}
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-[#D1F1F2]">
            <div className="p-2 bg-red-100 rounded-full">
              <Heart className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Blood Pressure</p>
              <p className="text-lg font-bold text-[#046658]">
                {recentVital.systolic}/{recentVital.diastolic}
              </p>
              <p className="text-xs text-gray-500">mmHg</p>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-[#D1F1F2]">
            <div className="p-2 bg-pink-100 rounded-full">
              <Heart className="h-4 w-4 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Heart Rate</p>
              <p className="text-lg font-bold text-[#046658]">
                {recentVital.heartRate}
              </p>
              <p className="text-xs text-gray-500">bpm</p>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-[#D1F1F2]">
            <div className="p-2 bg-orange-100 rounded-full">
              <Thermometer className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Temperature</p>
              <p className="text-lg font-bold text-[#046658]">
                {recentVital.body_temperature}
              </p>
              <p className="text-xs text-gray-500">°C</p>
            </div>
          </div>

          {/* Oxygen Saturation */}
          {recentVital.oxygen_saturation && (
            <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-[#D1F1F2]">
              <div className="p-2 bg-blue-100 rounded-full">
                <Droplets className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">SpO2</p>
                <p className="text-lg font-bold text-[#046658]">
                  {recentVital.oxygen_saturation}
                </p>
                <p className="text-xs text-gray-500">%</p>
              </div>
            </div>
          )}

          {/* Respiratory Rate */}
          {recentVital.respiratory_rate && (
            <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-[#D1F1F2]">
              <div className="p-2 bg-cyan-100 rounded-full">
                <Wind className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Resp. Rate</p>
                <p className="text-lg font-bold text-[#046658]">
                  {recentVital.respiratory_rate}
                </p>
                <p className="text-xs text-gray-500">/min</p>
              </div>
            </div>
          )}

          {/* Weight */}
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-[#D1F1F2]">
            <div className="p-2 bg-purple-100 rounded-full">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Weight</p>
              <p className="text-lg font-bold text-[#046658]">
                {recentVital.weight}
              </p>
              <p className="text-xs text-gray-500">kg</p>
            </div>
          </div>
        </div>

        {/* Record Info */}
        <div className="pt-3 border-t border-[#D1F1F2]">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Recorded:</span>{' '}
            {format(recentVital.created_at, 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <span className="font-medium">During consultation with:</span>{' '}
            Dr. {recentVital.medical.appointment.doctor.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

