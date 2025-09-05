"use client";

import { useState, useEffect, useCallback } from 'react';
import { DashboardState, UrgentAlert, PatientAlert, Appointment } from '@/types/doctor-dashboard';

interface UseDoctorDashboardProps {
  doctorId: string;
  initialAppointments: Appointment[];
}

export const useDoctorDashboard = ({ doctorId, initialAppointments }: UseDoctorDashboardProps) => {
  const [state, setState] = useState<DashboardState>({
    activeTab: 'overview',
    urgentAlerts: [],
    patientAlerts: [],
    todaySchedule: [],
    isLoading: false,
    error: undefined,
  });

  // Initialize dashboard data
  useEffect(() => {
    initializeDashboard();
  }, [doctorId, initialAppointments]);

  const initializeDashboard = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Filter today's appointments
      const today = new Date();
      const todayAppts = initialAppointments.filter(apt => 
        new Date(apt.appointment_date).toDateString() === today.toDateString()
      );

      // Fetch urgent alerts (in real app, this would be an API call)
      const urgentAlerts = await fetchUrgentAlerts(doctorId);
      
      // Fetch patient alerts
      const patientAlerts = await fetchPatientAlerts(doctorId);

      setState(prev => ({
        ...prev,
        todaySchedule: todayAppts,
        urgentAlerts,
        patientAlerts,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        isLoading: false,
      }));
    }
  }, [doctorId, initialAppointments]);

  const setActiveTab = useCallback((tabId: string) => {
    setState(prev => ({ ...prev, activeTab: tabId }));
  }, []);

  const markAlertAsRead = useCallback((alertId: number) => {
    setState(prev => ({
      ...prev,
      urgentAlerts: prev.urgentAlerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ),
    }));
  }, []);

  const resolvePatientAlert = useCallback((alertId: number) => {
    setState(prev => ({
      ...prev,
      patientAlerts: prev.patientAlerts.map(alert =>
        alert.id === alertId ? { ...alert, isResolved: true } : alert
      ),
    }));
  }, []);

  const refreshDashboard = useCallback(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  return {
    ...state,
    setActiveTab,
    markAlertAsRead,
    resolvePatientAlert,
    refreshDashboard,
  };
};

// Mock API functions (replace with actual API calls)
const fetchUrgentAlerts = async (doctorId: string): Promise<UrgentAlert[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: 1,
      type: 'CRITICAL',
      message: 'Patient John Doe - Blood pressure critical (180/110)',
      time: '2 minutes ago',
      patientId: 'patient-1',
      priority: 'HIGH',
      isRead: false,
    },
    {
      id: 2,
      type: 'URGENT',
      message: 'Lab results available for Sarah Wilson',
      time: '15 minutes ago',
      patientId: 'patient-2',
      priority: 'MEDIUM',
      isRead: false,
    },
  ];
};

const fetchPatientAlerts = async (doctorId: string): Promise<PatientAlert[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    {
      id: 1,
      patient: 'Alice Johnson',
      type: 'MEDICATION',
      message: 'Medication review due',
      priority: 'HIGH',
      isResolved: false,
    },
    {
      id: 2,
      patient: 'Bob Smith',
      type: 'FOLLOW_UP',
      message: 'Post-surgery follow-up scheduled',
      priority: 'MEDIUM',
      isResolved: false,
    },
  ];
};
