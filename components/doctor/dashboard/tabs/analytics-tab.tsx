import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Analytics } from '@/types/doctor-dashboard';

interface AnalyticsTabProps {
  analytics: Analytics;
}

export function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Completion Rate</span>
            <span className="text-lg font-bold text-green-600">
              {Math.round(analytics.completionRate)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Cancellation Rate</span>
            <span className="text-lg font-bold text-red-600">
              {Math.round(analytics.cancellationRate)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Avg. Duration</span>
            <span className="text-lg font-bold text-blue-600">
              {analytics.averageAppointmentDuration} min
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Patient Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Patient outcome analytics coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


