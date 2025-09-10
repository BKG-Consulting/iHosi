'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User,
  ChevronRight,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ProfileImage } from '@/components/profile-image';

interface DoctorPatient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: Date;
  img?: string;
  colorCode?: string;
  lastAppointment?: {
    id: number;
    appointment_date: Date;
    time: string;
    status: string;
    type: string;
    reason?: string;
  };
  nextAppointment?: {
    id: number;
    appointment_date: Date;
    time: string;
    status: string;
    type: string;
    reason?: string;
  };
  totalAppointments: number;
  lastVisit: Date | null;
}

interface PatientListProps {
  doctorId: string;
}

export function PatientList({ doctorId }: PatientListProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<DoctorPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'recent'>('all');

  useEffect(() => {
    fetchPatients();
  }, [doctorId]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filter]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}/patients`);
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(patient => patient.nextAppointment);
    } else if (filter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(patient => 
        patient.lastVisit && new Date(patient.lastVisit) >= thirtyDaysAgo
      );
    }

    setFilteredPatients(filtered);
  };

  const getStatusBadge = (patient: DoctorPatient) => {
    if (patient.nextAppointment) {
      return <Badge className="bg-green-100 text-green-800">Upcoming</Badge>;
    } else if (patient.lastVisit) {
      const daysSinceLastVisit = Math.floor(
        (new Date().getTime() - new Date(patient.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastVisit <= 30) {
        return <Badge className="bg-blue-100 text-blue-800">Recent</Badge>;
      }
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({patients.length})
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({patients.filter(p => p.nextAppointment).length})
          </Button>
          <Button
            variant={filter === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('recent')}
          >
            Recent ({patients.filter(p => p.lastVisit && 
              new Date(p.lastVisit) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length})
          </Button>
        </div>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              {searchTerm ? 'No patients found' : 'No patients yet'}
            </h3>
            <p className="text-slate-500">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Patients will appear here once they have appointments with you'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <ProfileImage
                      name={`${patient.first_name} ${patient.last_name}`}
                      url={patient.img}
                      bgColor={patient.colorCode}
                      className="w-12 h-12"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        {getStatusBadge(patient)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{patient.gender}, {calculateAge(patient.date_of_birth)} years</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{patient.totalAppointments} appointments</span>
                        </div>
                      </div>

                      {/* Next Appointment */}
                      {patient.nextAppointment && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                            <Clock className="w-4 h-4" />
                            Next Appointment
                          </div>
                          <p className="text-sm text-green-700">
                            {format(new Date(patient.nextAppointment.appointment_date), 'MMM dd, yyyy')} at {patient.nextAppointment.time}
                          </p>
                          <p className="text-xs text-green-600">{patient.nextAppointment.type} • {patient.nextAppointment.reason}</p>
                        </div>
                      )}

                      {/* Last Appointment */}
                      {patient.lastAppointment && !patient.nextAppointment && (
                        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-600 font-medium mb-1">
                            <Calendar className="w-4 h-4" />
                            Last Visit
                          </div>
                          <p className="text-sm text-slate-600">
                            {format(new Date(patient.lastAppointment.appointment_date), 'MMM dd, yyyy')} at {patient.lastAppointment.time}
                          </p>
                          <p className="text-xs text-slate-500">{patient.lastAppointment.type}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/doctor/patient/${patient.id}`)}
                    aria-label={`Open profile for ${patient.first_name} ${patient.last_name}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
