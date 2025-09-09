'use client';

import { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: 'appointment_request' | 'appointment_scheduled' | 'appointment_cancelled' | 'appointment_rescheduled' | 'doctor_availability_changed';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
  read?: boolean;
}

export function useNotifications(userId?: string, userRole?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  // Poll for notifications every 15 seconds
  useEffect(() => {
    if (!userId || !userRole) return;

    const pollNotifications = async () => {
      try {
        setIsLoading(true);
        const url = lastCheck 
          ? `/api/notifications?lastCheck=${encodeURIComponent(lastCheck)}`
          : '/api/notifications';
          
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setIsConnected(true);
          
          // Update last check time
          if (data.lastCheck) {
            setLastCheck(data.lastCheck);
          }
          
          // Add new notifications to existing ones
          if (data.notifications && data.notifications.length > 0) {
            console.log('🔔 New notifications received:', data.notifications);
            setNotifications(prev => {
              const existingIds = new Set(prev.map(n => n.id));
              const newNotifications = data.notifications.filter((n: Notification) => !existingIds.has(n.id));
              console.log('🔔 Adding new notifications:', newNotifications);
              return [...newNotifications, ...prev].slice(0, 50); // Keep last 50 notifications
            });
          } else {
            console.log('🔔 No new notifications');
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    pollNotifications();

    // Set up polling interval
    const interval = setInterval(pollNotifications, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [userId, userRole, lastCheck]);

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  return {
    notifications,
    isConnected,
    isLoading,
    clearNotification,
    clearAllNotifications,
    markAsRead
  };
}
