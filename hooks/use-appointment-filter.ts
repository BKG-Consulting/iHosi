'use client';

import { useState, useMemo } from 'react';
import { Appointment } from '@/types/schedule-types';

export function useAppointmentFilter(appointments: Appointment[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;

    const query = searchQuery.toLowerCase();
    return appointments.filter(appointment => {
      const patientName = `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.toLowerCase();
      const doctorName = appointment.doctor?.name?.toLowerCase() || '';
      const type = appointment.type?.toLowerCase() || '';
      
      return patientName.includes(query) || 
             doctorName.includes(query) || 
             type.includes(query);
    });
  }, [appointments, searchQuery]);

  const todayAppointments = useMemo(() => {
    return appointments.filter(apt => 
      new Date(apt.appointment_date).toDateString() === new Date().toDateString()
    );
  }, [appointments]);

  return {
    searchQuery,
    setSearchQuery,
    filteredAppointments,
    todayAppointments
  };
}


