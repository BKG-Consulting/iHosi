import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, X } from 'lucide-react';
import { UrgentAlert } from '@/types/doctor-dashboard';
import { cn } from '@/lib/utils';

interface UrgentAlertsProps {
  alerts: UrgentAlert[];
  onMarkAsRead: (alertId: number) => void;
  onDismiss: (alertId: number) => void;
  onViewDetails: (alertId: number) => void;
  className?: string;
}

export const UrgentAlerts: React.FC<UrgentAlertsProps> = ({
  alerts,
  onMarkAsRead,
  onDismiss,
  onViewDetails,
  className,
}) => {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: UrgentAlert['type']) => {
    switch (type) {
      case 'CRITICAL':
        return '🔴';
      case 'URGENT':
        return '🟡';
      case 'WARNING':
        return '🟠';
      default:
        return '🔵';
    }
  };

  const getAlertColor = (type: UrgentAlert['type']) => {
    switch (type) {
      case 'CRITICAL':
        return 'border-red-200 bg-red-50';
      case 'URGENT':
        return 'border-yellow-200 bg-yellow-50';
      case 'WARNING':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card className={cn("border-2", getAlertColor(alerts[0]?.type), className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Urgent Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={cn(
                "flex items-center justify-between p-3 bg-white rounded-lg border transition-all",
                alert.isRead ? "opacity-60" : "shadow-sm"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-lg">{getAlertIcon(alert.type)}</span>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={alert.type === 'CRITICAL' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.type}
                    </Badge>
                    <Badge 
                      variant={alert.priority === 'HIGH' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {alert.message}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {alert.time}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(alert.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                {!alert.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsRead(alert.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


