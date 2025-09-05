import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, Appointment, Doctor, PaginatedResponse } from '../types';

// Base API configuration
const API_BASE_URL = 'https://ihosi.com/api';

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadAuthToken();
  }

  // Load auth token from storage
  private async loadAuthToken() {
    try {
      this.authToken = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error loading auth token:', error);
    }
  }

  // Set auth token
  async setAuthToken(token: string) {
    this.authToken = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  // Clear auth token
  async clearAuthToken() {
    this.authToken = null;
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          message: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: 'Network error',
        message: 'Unable to connect to server',
      };
    }
  }

  // Authentication methods
  async verifyDoctorToken(token: string): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>('/auth/verify-doctor', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Doctor methods
  async getDoctorProfile(doctorId: string): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>(`/doctors/${doctorId}`);
  }

  async updateDoctorProfile(
    doctorId: string,
    data: Partial<Doctor>
  ): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>(`/doctors/${doctorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateDoctorAvailability(
    doctorId: string,
    status: string
  ): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>(`/doctors/${doctorId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Appointment methods
  async getDoctorAppointments(
    doctorId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    return this.request<PaginatedResponse<Appointment>>(
      `/doctors/${doctorId}/appointments?page=${page}&limit=${limit}`
    );
  }

  async getTodayAppointments(doctorId: string): Promise<ApiResponse<Appointment[]>> {
    const today = new Date().toISOString().split('T')[0];
    return this.request<Appointment[]>(
      `/doctors/${doctorId}/appointments?date=${today}`
    );
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: string
  ): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/appointments/${appointmentId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        appointment_date: newDate,
        time: newTime 
      }),
    });
  }

  // Calendar sync methods
  async enableCalendarSync(
    doctorId: string,
    calendarId: string
  ): Promise<ApiResponse<{ syncEnabled: boolean }>> {
    return this.request<{ syncEnabled: boolean }>(
      `/doctors/${doctorId}/calendar-sync`,
      {
        method: 'POST',
        body: JSON.stringify({ calendarId, syncEnabled: true }),
      }
    );
  }

  async disableCalendarSync(doctorId: string): Promise<ApiResponse<{ syncEnabled: boolean }>> {
    return this.request<{ syncEnabled: boolean }>(
      `/doctors/${doctorId}/calendar-sync`,
      {
        method: 'POST',
        body: JSON.stringify({ syncEnabled: false }),
      }
    );
  }

  // Analytics methods
  async getDoctorAnalytics(doctorId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/doctors/${doctorId}/analytics`);
  }

  async getAppointmentStats(doctorId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/doctors/${doctorId}/appointment-stats`);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
