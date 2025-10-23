'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  UserCog,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building2,
  ChevronRight,
  Star,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useFacility } from '@/lib/facility-context';
import { AssignDoctorDialog } from './assign-doctor-dialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  license_number: string;
  consultation_fee: number;
  employment_type: string;
  facility_status: string;
  office_number?: string;
  accepts_new_patients: boolean;
  online_booking_enabled: boolean;
  is_primary_facility: boolean;
  availability_status: string;
  department_ref?: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    appointments: number;
    ratings: number;
  };
}

export function DoctorList() {
  const facility = useFacility();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const brandColor = facility?.branding?.primaryColor || facility?.primary_color || '#3b82f6';

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (specializationFilter !== 'all') params.append('specialization', specializationFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/doctors?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specializationFilter, statusFilter, searchQuery]);

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove Dr. ${name} from this facility? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/doctors/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Doctor removed from facility successfully');
        fetchDoctors();
      } else {
        toast.error(data.error || 'Failed to remove doctor');
      }
    } catch (error) {
      console.error('Error removing doctor:', error);
      toast.error('Failed to remove doctor');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      ON_LEAVE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || styles.INACTIVE}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getAvailabilityBadge = (status: string) => {
    const styles = {
      AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
      BUSY: 'bg-red-100 text-red-800 border-red-200',
      OFFLINE: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {status}
      </Badge>
    );
  };

  // Get unique specializations for filter
  const specializations = Array.from(new Set(doctors.map(d => d.specialization)));

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
          <p className="text-gray-600 mt-1">
            Manage doctors at {facility?.name || 'your facility'}
          </p>
        </div>
        <Button
          onClick={() => setAssignDialogOpen(true)}
          style={{ backgroundColor: brandColor, color: 'white' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Doctor
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, specialization, or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctor List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: brandColor }}></div>
          <p className="text-gray-600 mt-4">Loading doctors...</p>
        </div>
      ) : doctors.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || specializationFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by assigning your first doctor'}
              </p>
              {!searchQuery && specializationFilter === 'all' && statusFilter === 'all' && (
                <Button
                  onClick={() => setAssignDialogOpen(true)}
                  style={{ backgroundColor: brandColor, color: 'white' }}
                  className="hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign First Doctor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ borderLeft: `4px solid ${brandColor}` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                      style={{ backgroundColor: brandColor }}
                    >
                      Dr
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                        {getStatusBadge(doctor.facility_status)}
                        {getAvailabilityBadge(doctor.availability_status)}
                      </div>
                      <p className="text-sm font-medium" style={{ color: brandColor }}>
                        {doctor.specialization}
                      </p>
                      <p className="text-sm text-gray-600">
                        License: {doctor.license_number}
                      </p>
                      {doctor.department_ref && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Building2 className="h-3 w-3" />
                          <span>{doctor.department_ref.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/doctors/${doctor.id}`}>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info('Edit functionality coming soon')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(doctor.id, doctor.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{doctor.phone}</span>
                  </div>
                  {doctor.office_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>Office: {doctor.office_number}</span>
                    </div>
                  )}
                </div>

                {/* Stats & Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4" style={{ color: brandColor }} />
                      <p className="text-xs text-gray-600">Appointments</p>
                    </div>
                    <p className="text-xl font-bold" style={{ color: brandColor }}>
                      {doctor._count.appointments}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <p className="text-xs text-gray-600">Ratings</p>
                    </div>
                    <p className="text-xl font-bold text-yellow-600">
                      {doctor._count.ratings}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-gray-600">New Patients</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">
                      {doctor.accepts_new_patients ? (
                        <CheckCircle className="h-5 w-5 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 mx-auto" />
                      )}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-600">Online Booking</p>
                    </div>
                    <p className="text-sm font-medium text-blue-600">
                      {doctor.online_booking_enabled ? (
                        <CheckCircle className="h-5 w-5 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 mx-auto" />
                      )}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-sm text-gray-600">
                  <span className="font-medium">
                    Employment: {doctor.employment_type.replace('_', ' ')}
                  </span>
                  <span>•</span>
                  <span>
                    Consultation Fee: ${doctor.consultation_fee}
                  </span>
                  {doctor.is_primary_facility && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Primary Facility
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Doctor Dialog */}
      <AssignDoctorDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSuccess={fetchDoctors}
      />
    </div>
  );
}




