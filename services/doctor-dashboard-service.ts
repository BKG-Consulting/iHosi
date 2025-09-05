import { 
  Doctor, 
  Appointment, 
  Patient, 
  DashboardAnalytics, 
  UrgentAlert, 
  PatientAlert,
  VitalSigns,
  LabResult 
} from '@/types/doctor-dashboard';

export class DoctorDashboardService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  /**
   * Get doctor's dashboard data
   */
  async getDashboardData(doctorId: string): Promise<{
    doctor: Doctor;
    appointments: Appointment[];
    patients: Patient[];
    analytics: DashboardAnalytics;
  }> {
    try {
      const [doctor, appointments, patients, analytics] = await Promise.all([
        this.getDoctor(doctorId),
        this.getDoctorAppointments(doctorId),
        this.getDoctorPatients(doctorId),
        this.getDashboardAnalytics(doctorId),
      ]);

      return { doctor, appointments, patients, analytics };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  /**
   * Get doctor profile
   */
  async getDoctor(doctorId: string): Promise<Doctor> {
    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch doctor data');
    }
    return response.json();
  }

  /**
   * Get doctor's appointments
   */
  async getDoctorAppointments(doctorId: string, dateRange?: { start: Date; end: Date }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start', dateRange.start.toISOString());
      params.append('end', dateRange.end.toISOString());
    }

    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/appointments?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    return response.json();
  }

  /**
   * Get doctor's patients
   */
  async getDoctorPatients(doctorId: string): Promise<Patient[]> {
    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/patients`);
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
    return response.json();
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(doctorId: string): Promise<DashboardAnalytics> {
    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/analytics`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    return response.json();
  }

  /**
   * Get urgent alerts
   */
  async getUrgentAlerts(doctorId: string): Promise<UrgentAlert[]> {
    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/alerts/urgent`);
    if (!response.ok) {
      throw new Error('Failed to fetch urgent alerts');
    }
    return response.json();
  }

  /**
   * Get patient alerts
   */
  async getPatientAlerts(doctorId: string): Promise<PatientAlert[]> {
    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/alerts/patients`);
    if (!response.ok) {
      throw new Error('Failed to fetch patient alerts');
    }
    return response.json();
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alerts/${alertId}/read`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to mark alert as read');
    }
  }

  /**
   * Resolve patient alert
   */
  async resolvePatientAlert(alertId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alerts/patients/${alertId}/resolve`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to resolve patient alert');
    }
  }

  /**
   * Get patient vital signs
   */
  async getPatientVitalSigns(patientId: string): Promise<VitalSigns[]> {
    const response = await fetch(`${this.baseUrl}/patients/${patientId}/vitals`);
    if (!response.ok) {
      throw new Error('Failed to fetch vital signs');
    }
    return response.json();
  }

  /**
   * Get lab results
   */
  async getLabResults(doctorId: string): Promise<LabResult[]> {
    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/lab-results`);
    if (!response.ok) {
      throw new Error('Failed to fetch lab results');
    }
    return response.json();
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId: number, status: string): Promise<Appointment> {
    const response = await fetch(`${this.baseUrl}/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update appointment status');
    }
    return response.json();
  }

  /**
   * Send message to patient
   */
  async sendMessageToPatient(patientId: string, message: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/patients/${patientId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
  }

  /**
   * Start video call with patient
   */
  async startVideoCall(patientId: string): Promise<{ roomId: string; token: string }> {
    const response = await fetch(`${this.baseUrl}/video-calls/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!response.ok) {
      throw new Error('Failed to start video call');
    }
    return response.json();
  }
}

// Export singleton instance
export const doctorDashboardService = new DoctorDashboardService();

