import { useState, useEffect, useCallback } from 'react';
import { 
  AppointmentDetails, 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest,
  RescheduleAppointmentRequest,
  CancelAppointmentRequest,
  DoctorAvailability,
  TimeSlot,
  SchedulingConflict
} from '@/types/scheduling';
import { schedulingService } from '@/services/scheduling-service';

interface UseSchedulingOptions {
  doctorId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseSchedulingReturn {
  // State
  appointments: AppointmentDetails[];
  availability: DoctorAvailability | null;
  availableSlots: TimeSlot[];
  conflicts: SchedulingConflict[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalAppointments: number;
  
  // Actions
  loadAppointments: (params?: {
    page?: number;
    limit?: number;
    status?: string[];
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  
  loadAvailability: (startDate: string, endDate: string) => Promise<void>;
  loadAvailableSlots: (date: string, duration?: number) => Promise<void>;
  
  createAppointment: (appointment: CreateAppointmentRequest) => Promise<AppointmentDetails>;
  updateAppointment: (appointment: UpdateAppointmentRequest) => Promise<AppointmentDetails>;
  rescheduleAppointment: (appointmentId: number, data: Omit<RescheduleAppointmentRequest, 'appointmentId'>) => Promise<AppointmentDetails>;
  cancelAppointment: (appointmentId: number, data: Omit<CancelAppointmentRequest, 'appointmentId'>) => Promise<AppointmentDetails>;
  deleteAppointment: (appointmentId: number) => Promise<void>;
  
  // Utilities
  checkConflicts: (appointmentDate: string, time: string, duration?: number) => Promise<boolean>;
  validateAppointmentTime: (appointmentDate: string, time: string, duration?: number) => Promise<boolean>;
  getNextAvailableSlot: (fromDate: string, duration?: number) => Promise<TimeSlot | null>;
  
  // State management
  setPage: (page: number) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export const useScheduling = (options: UseSchedulingOptions): UseSchedulingReturn => {
  const { doctorId, autoRefresh = true, refreshInterval = 30000 } = options;
  
  // State
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  
  // Error handling
  const handleError = useCallback((error: any) => {
    console.error('Scheduling error:', error);
    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }, []);
  
  // Load appointments
  const loadAppointments = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string[];
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await schedulingService.getAppointments({
        doctorId,
        page: params?.page || currentPage,
        limit: params?.limit || 10,
        status: params?.status,
        startDate: params?.startDate,
        endDate: params?.endDate,
      });
      
      // Safely handle the result structure
      if (result && typeof result === 'object') {
        setAppointments(Array.isArray(result.appointments) ? result.appointments : []);
        
        if (result.pagination && typeof result.pagination === 'object') {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalAppointments(result.pagination.total || 0);
        } else {
          setTotalPages(1);
          setTotalAppointments(0);
        }
      } else {
        // Fallback if result is not an object
        setAppointments([]);
        setTotalPages(1);
        setTotalAppointments(0);
      }
      
      if (params?.page) {
        setCurrentPage(params.page);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      handleError(error);
      // Set fallback values on error
      setAppointments([]);
      setTotalPages(1);
      setTotalAppointments(0);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, currentPage, handleError]);
  
  // Load availability
  const loadAvailability = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await schedulingService.getDoctorAvailability({
        doctorId,
        startDate,
        endDate,
        includeBreaks: true,
        includeLeave: true,
      });
      
      setAvailability(result.availability);
      setAvailableSlots(result.availableSlots);
      setConflicts(result.conflicts);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, handleError]);
  
  // Load available slots
  const loadAvailableSlots = useCallback(async (date: string, duration: number = 30) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await schedulingService.getAvailableSlots({
        doctorId,
        date,
        duration,
      });
      
      setAvailableSlots(result.availableSlots);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, handleError]);
  
  // Create appointment
  const createAppointment = useCallback(async (appointment: CreateAppointmentRequest): Promise<AppointmentDetails> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const created = await schedulingService.createAppointment(appointment);
      
      // Refresh appointments list
      await loadAppointments();
      
      return created;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadAppointments, handleError]);
  
  // Update appointment
  const updateAppointment = useCallback(async (appointment: UpdateAppointmentRequest): Promise<AppointmentDetails> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updated = await schedulingService.updateAppointment(appointment);
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => apt.id === appointment.appointmentId ? updated : apt)
      );
      
      return updated;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);
  
  // Reschedule appointment
  const rescheduleAppointment = useCallback(async (
    appointmentId: number, 
    data: Omit<RescheduleAppointmentRequest, 'appointmentId'>
  ): Promise<AppointmentDetails> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const rescheduled = await schedulingService.rescheduleAppointment(appointmentId, data);
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? rescheduled : apt)
      );
      
      return rescheduled;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);
  
  // Cancel appointment
  const cancelAppointment = useCallback(async (
    appointmentId: number, 
    data: Omit<CancelAppointmentRequest, 'appointmentId'>
  ): Promise<AppointmentDetails> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cancelled = await schedulingService.cancelAppointment(appointmentId, data);
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? cancelled : apt)
      );
      
      return cancelled;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);
  
  // Delete appointment
  const deleteAppointment = useCallback(async (appointmentId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Note: This would need to be implemented in the API
      // For now, we'll just remove from local state
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      // Refresh appointments list
      await loadAppointments();
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadAppointments, handleError]);
  
  // Check conflicts
  const checkConflicts = useCallback(async (
    appointmentDate: string, 
    time: string, 
    duration: number = 30
  ): Promise<boolean> => {
    try {
      const result = await schedulingService.checkConflicts(doctorId, appointmentDate, time, duration);
      setConflicts(result.conflicts);
      return result.hasConflicts;
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [doctorId, handleError]);
  
  // Validate appointment time
  const validateAppointmentTime = useCallback(async (
    appointmentDate: string, 
    time: string, 
    duration: number = 30
  ): Promise<boolean> => {
    try {
      return await schedulingService.validateAppointmentTime(doctorId, appointmentDate, time, duration);
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [doctorId, handleError]);
  
  // Get next available slot
  const getNextAvailableSlot = useCallback(async (
    fromDate: string, 
    duration: number = 30
  ): Promise<TimeSlot | null> => {
    try {
      return await schedulingService.getNextAvailableSlot(doctorId, fromDate, duration);
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [doctorId, handleError]);
  
  // Set page
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    loadAppointments({ page });
  }, [loadAppointments]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Refresh
  const refresh = useCallback(async () => {
    await loadAppointments();
  }, [loadAppointments]);
  
  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        loadAppointments();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadAppointments]);
  
  // Initial load with fallback
  useEffect(() => {
    // Try to load appointments, but don't fail if the API is not available
    loadAppointments().catch((error) => {
      console.warn('Initial appointment load failed, using fallback data:', error);
      // Set some mock data for development
      setAppointments([]);
      setTotalPages(1);
      setTotalAppointments(0);
    });
  }, [loadAppointments]);
  
  return {
    // State
    appointments,
    availability,
    availableSlots,
    conflicts,
    isLoading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalAppointments,
    
    // Actions
    loadAppointments,
    loadAvailability,
    loadAvailableSlots,
    createAppointment,
    updateAppointment,
    rescheduleAppointment,
    cancelAppointment,
    deleteAppointment,
    
    // Utilities
    checkConflicts,
    validateAppointmentTime,
    getNextAvailableSlot,
    
    // State management
    setPage,
    clearError,
    refresh,
  };
};
