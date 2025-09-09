"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  X, 
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

interface RealTimeNotificationsProps {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
}

export const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({
  doctorId,
  doctorName,
  doctorEmail
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const {
    isConnected,
    notifications,
    isLoading,
    clearNotification,
    clearAllNotifications
  } = useNotifications(doctorId, 'DOCTOR');

  // Track new notifications
  useEffect(() => {
    console.log('🔔 Notifications updated:', notifications.length, notifications);
    if (notifications.length > 0) {
      setHasNewNotifications(true);
    }
  }, [notifications]);

  const handleNotificationClick = () => {
    setIsExpanded(!isExpanded);
    if (hasNewNotifications) {
      setHasNewNotifications(false);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_request':
        return <BellRing className="w-4 h-4 text-blue-500" />;
      case 'appointment_scheduled':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'availability_change':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment_request':
        return 'border-l-blue-500 bg-blue-50';
      case 'appointment_scheduled':
        return 'border-l-green-500 bg-green-50';
      case 'availability_change':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const totalNotifications = notifications.length;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNotificationClick}
        className={cn(
          "relative border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2] transition-all duration-200",
          hasNewNotifications && "border-[#2EB6B0] bg-[#2EB6B0]/10"
        )}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 mr-2 text-blue-500 animate-spin" />
        ) : isConnected ? (
          <Wifi className="w-4 h-4 mr-2 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 mr-2 text-red-500" />
        )}
        <Bell className="w-4 h-4" />
        {totalNotifications > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {totalNotifications}
          </Badge>
        )}
        {hasNewNotifications && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#2EB6B0] rounded-full animate-pulse" />
        )}
      </Button>


      {/* Notifications Panel */}
      {isExpanded && (
        <Card className="absolute top-12 right-0 z-50 w-96 border-[#D1F1F2] shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Real-time Notifications</CardTitle>
                <CardDescription className="text-white/90">
                  {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {totalNotifications === 0 ? (
                <div className="p-6 text-center text-[#3E4C4B]">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-[#2EB6B0]" />
                  <p className="font-medium">No notifications</p>
                  <p className="text-sm text-[#3E4C4B]/70">
                    You'll receive real-time updates here
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md",
                        getNotificationColor(notification.type)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[#046658]">{notification.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatTime(notification.timestamp)}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#3E4C4B] mb-1">
                            {notification.message}
                          </p>
                          {notification.data && (
                            <div className="text-xs text-[#3E4C4B]/70 space-y-1">
                              {notification.data.appointmentDate && (
                                <p>📅 {formatDate(notification.data.appointmentDate)} at {notification.data.appointmentTime}</p>
                              )}
                              {notification.data.appointmentType && (
                                <p>🏥 {notification.data.appointmentType}</p>
                              )}
                              {notification.data.reason && <p>💬 {notification.data.reason}</p>}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => clearNotification(notification.id)}
                          className="text-[#3E4C4B]/50 hover:text-[#3E4C4B]"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
