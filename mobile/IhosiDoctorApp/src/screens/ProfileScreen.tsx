import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const { doctor, user } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>
        Dr. {doctor?.name || user?.firstName || 'Doctor'}
      </Text>
      <Text style={styles.specialization}>
        {doctor?.specialization || 'General Practice'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default ProfileScreen;

