import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Appointment } from '../types';

const DashboardScreen: React.FC = () => {
  const { doctor, user, refreshUser } = useAuthContext();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [doctor]);

  const loadDashboardData = async () => {
    if (!doctor) return;

    try {
      setIsLoading(true);
      const response = await apiService.getTodayAppointments(doctor.id);
      
      if (response.success && response.data) {
        setTodayAppointments(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    await refreshUser();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getNextAppointment = () => {
    const now = new Date();
    const upcoming = todayAppointments
      .filter(apt => {
        const aptTime = new Date(`${apt.appointment_date}T${apt.time}`);
        return aptTime > now && apt.status === 'SCHEDULED';
      })
      .sort((a, b) => {
        const timeA = new Date(`${a.appointment_date}T${a.time}`);
        const timeB = new Date(`${b.appointment_date}T${b.time}`);
        return timeA.getTime() - timeB.getTime();
      });

    return upcoming[0] || null;
  };

  const nextAppointment = getNextAppointment();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.doctorName}>
            Dr. {doctor?.name || user?.firstName || 'Doctor'}
          </Text>
          <Text style={styles.specialization}>
            {doctor?.specialization || 'General Practice'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.statusText}>Available</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#2563eb" />
          <Text style={styles.statNumber}>{todayAppointments.length}</Text>
          <Text style={styles.statLabel}>Today's Appointments</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>
            {todayAppointments.filter(apt => apt.status === 'PENDING').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text style={styles.statNumber}>
            {todayAppointments.filter(apt => apt.status === 'COMPLETED').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Next Appointment */}
      {nextAppointment && (
        <View style={styles.nextAppointmentCard}>
          <Text style={styles.cardTitle}>Next Appointment</Text>
          <View style={styles.appointmentInfo}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>
                {nextAppointment.patient.first_name} {nextAppointment.patient.last_name}
              </Text>
              <Text style={styles.appointmentType}>{nextAppointment.type}</Text>
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.appointmentTime}>{nextAppointment.time}</Text>
              <Text style={styles.appointmentDate}>
                {new Date(nextAppointment.appointment_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
          {nextAppointment.note && (
            <Text style={styles.appointmentNote}>{nextAppointment.note}</Text>
          )}
        </View>
      )}

      {/* Today's Schedule */}
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.cardTitle}>Today's Schedule</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {todayAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No appointments today</Text>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {todayAppointments.slice(0, 3).map((appointment) => (
              <View key={appointment.id} style={styles.appointmentItem}>
                <View style={styles.appointmentTime}>
                  <Text style={styles.timeText}>{appointment.time}</Text>
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.patientName}>
                    {appointment.patient.first_name} {appointment.patient.last_name}
                  </Text>
                  <Text style={styles.appointmentType}>{appointment.type}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(appointment.status) }
                ]}>
                  <Text style={styles.statusText}>{appointment.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-plus" size={24} color="#2563eb" />
            <Text style={styles.actionText}>Add Availability</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications" size={24} color="#f59e0b" />
            <Text style={styles.actionText}>Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="analytics" size={24} color="#10b981" />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings" size={24} color="#6b7280" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SCHEDULED': return '#3b82f6';
    case 'PENDING': return '#f59e0b';
    case 'COMPLETED': return '#10b981';
    case 'CANCELLED': return '#ef4444';
    default: return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 24,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  nextAppointmentCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  appointmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  appointmentType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  appointmentTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  appointmentDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  appointmentNote: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  scheduleCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  appointmentTime: {
    width: 60,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  appointmentDetails: {
    flex: 1,
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quickActions: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;

