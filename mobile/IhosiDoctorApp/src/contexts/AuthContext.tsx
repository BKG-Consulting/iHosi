import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Doctor, User } from '../types';

interface AuthContextType {
  user: User | null;
  doctor: Doctor | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDoctor: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is a doctor
  const isDoctor = user?.role === 'DOCTOR';
  const isAuthenticated = !!user;

  // Initialize authentication - check for stored token
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      // For now, we'll start with no authentication
      // In production, you'd check for stored tokens here
      setUser(null);
      setDoctor(null);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setDoctor(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctorProfile = async (doctorId: string) => {
    try {
      const response = await apiService.getDoctorProfile(doctorId);
      if (response.success && response.data) {
        setDoctor(response.data);
      }
    } catch (error) {
      console.error('Error loading doctor profile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // For demo purposes, create a mock doctor
      // In production, this would authenticate with your backend
      const mockDoctor: Doctor = {
        id: 'demo-doctor-1',
        name: 'Dr. John Smith',
        email: email,
        specialization: 'General Practice',
        phone: '+1-555-0123',
        workingDays: [],
        availabilityStatus: 'AVAILABLE',
      };

      const mockUser: User = {
        id: 'demo-doctor-1',
        email: email,
        firstName: 'John',
        lastName: 'Smith',
        role: 'DOCTOR',
      };

      setDoctor(mockDoctor);
      setUser(mockUser);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setUser(null);
      setDoctor(null);
      await apiService.clearAuthToken();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (isAuthenticated && user) {
      // Refresh user data
      console.log('Refreshing user data...');
    }
  };

  const value: AuthContextType = {
    user,
    doctor,
    isLoading,
    isAuthenticated,
    isDoctor,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
