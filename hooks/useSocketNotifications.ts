'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketNotification {
  id: string;
  type: 'appointment_request' | 'appointment_scheduled' | 'appointment_cancelled' | 'appointment_rescheduled' | 'doctor_availability_changed';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export function useSocketNotifications(userId?: string, userRole?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !userRole) return;

    // Only connect on client side
    if (typeof window === 'undefined') return;

    console.log('🔌 Attempting to connect to socket server...');
    
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 5000,
      forceNew: true
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      
      // Join appropriate room based on user role
      const room = userRole === 'DOCTOR' ? `doctor_${userId}` : 
                   userRole === 'PATIENT' ? `patient_${userId}` : 
                   userRole === 'ADMIN' ? 'admin' : 'general';
      
      socketInstance.emit('join_room', {
        user: {
          id: userId,
          role: userRole,
          name: 'User', // This should come from user context
          email: 'user@example.com' // This should come from user context
        },
        room: room
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('🔌 Socket error:', error);
    });

    // Listen for appointment requests (for doctors)
    socketInstance.on('appointment_request', (data: any) => {
      const notification: SocketNotification = {
        id: `appointment_request_${data.appointmentId}_${Date.now()}`,
        type: 'appointment_request',
        title: 'New Appointment Request',
        message: `${data.patientName} has requested an appointment for ${data.appointmentDate} at ${data.appointmentTime}`,
        timestamp: new Date(data.timestamp),
        data
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
    });

    // Listen for appointment scheduled (for patients)
    socketInstance.on('appointment_scheduled', (data: any) => {
      const notification: SocketNotification = {
        id: `appointment_scheduled_${data.appointmentId}_${Date.now()}`,
        type: 'appointment_scheduled',
        title: 'Appointment Scheduled',
        message: `Your appointment with Dr. ${data.doctorName} has been scheduled for ${data.appointmentDate} at ${data.appointmentTime}`,
        timestamp: new Date(data.timestamp),
        data
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    });

    // Listen for appointment cancellations
    socketInstance.on('appointment_cancelled', (data: any) => {
      const notification: SocketNotification = {
        id: `appointment_cancelled_${data.appointmentId}_${Date.now()}`,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Your appointment for ${data.appointmentDate} at ${data.appointmentTime} has been cancelled`,
        timestamp: new Date(data.timestamp),
        data
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    });

    // Listen for appointment rescheduling
    socketInstance.on('appointment_rescheduled', (data: any) => {
      const notification: SocketNotification = {
        id: `appointment_rescheduled_${data.appointmentId}_${Date.now()}`,
        type: 'appointment_rescheduled',
        title: 'Appointment Rescheduled',
        message: `Your appointment has been rescheduled to ${data.appointmentDate} at ${data.appointmentTime}`,
        timestamp: new Date(data.timestamp),
        data
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    });

    // Listen for doctor availability changes
    socketInstance.on('doctor_availability_changed', (data: any) => {
      const notification: SocketNotification = {
        id: `doctor_availability_${data.doctorId}_${Date.now()}`,
        type: 'doctor_availability_changed',
        title: 'Doctor Availability Changed',
        message: `Dr. ${data.doctorName} is now ${data.availabilityStatus.toLowerCase()}`,
        timestamp: new Date(data.timestamp),
        data
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, userRole]);

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
    socket,
    notifications,
    isConnected,
    clearNotification,
    clearAllNotifications,
    markAsRead
  };
}