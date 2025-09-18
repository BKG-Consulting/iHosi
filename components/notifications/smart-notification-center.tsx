'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Brain,
  Calendar,
  User,
  Zap,
  X
} from 'lucide-react';

interface SmartNotificationCenterProps {
  userId: string;
  userRole: string;
  className?: string;
}

interface Notification {
  id: string;
  type: 'APPOINTMENT' | 'AI_INSIGHT' | 'REMINDER' | 'ALERT';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  actionRequired: boolean;
  aiGenerated?: boolean;
  data?: any;
}

export default function SmartNotificationCenter({ userId, userRole, className }: SmartNotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications
  useEffect(() => {
    loadNotifications();
    
    // Set up real-time updates (WebSocket or polling)
    const interval = setInterval(loadNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&role=${userRole}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-5 w-5 ${
      priority === 'URGENT' ? 'text-red-600' :
      priority === 'HIGH' ? 'text-orange-600' :
      priority === 'MEDIUM' ? 'text-yellow-600' :
      'text-blue-600'
    }`;

    switch (type) {
      case 'APPOINTMENT':
        return <Calendar className={iconClass} />;
      case 'AI_INSIGHT':
        return <Brain className={iconClass} />;
      case 'REMINDER':
        return <Clock className={iconClass} />;
      case 'ALERT':
        return <AlertTriangle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* AI Insights Summary */}
      {notifications.some(n => n.type === 'AI_INSIGHT' && !n.read) && (
        <Alert className="bg-purple-50 border-purple-200">
          <Brain className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>AI Insights Available:</strong> You have new AI-powered recommendations for your schedule optimization.
          </AlertDescription>
        </Alert>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {notification.aiGenerated && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Quick Actions */}
      {notifications.some(n => n.actionRequired && !n.read) && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-medium text-orange-800">Action Required</h3>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              You have {notifications.filter(n => n.actionRequired && !n.read).length} notifications requiring your attention.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                View All
              </Button>
              <Button size="sm">
                Take Action
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


