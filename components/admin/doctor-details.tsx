'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Star,
  Award,
  Languages,
  DollarSign,
  Stethoscope,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useFacility } from '@/lib/facility-context';
import { toast } from 'sonner';
import Link from 'next/link';

interface DoctorDetailsProps {
  doctorId: string;
}

export function DoctorDetails({ doctorId }: DoctorDetailsProps) {
  const facility = useFacility();
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const brandColor = facility?.branding?.primaryColor || facility?.primary_color || '#3b82f6';

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/doctors/${doctorId}`);
      const data = await response.json();

      if (data.success) {
        setDoctor(data.doctor);
      } else {
        toast.error('Failed to fetch doctor details');
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to fetch doctor details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: brandColor }}></div>
        <p className="text-gray-600 mt-4">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Doctor Not Found</h3>
            <p className="text-gray-500 mb-6">
              The doctor you're looking for doesn't exist or is not assigned to this facility.
            </p>
            <Link href="/admin/doctors">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Doctors
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/doctors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold" style={{ color: brandColor }}>
                {doctor.name}
              </h1>
              {getStatusBadge(doctor.facility_status)}
            </div>
            <p className="text-gray-600">{doctor.specialization}</p>
          </div>
        </div>
        <Button
          onClick={() => toast.info('Edit functionality coming soon')}
          style={{ backgroundColor: brandColor, color: 'white' }}
          className="hover:opacity-90"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Doctor
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Appointments</p>
                <p className="text-3xl font-bold" style={{ color: brandColor }}>
                  {doctor._count.appointments}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <Calendar className="h-8 w-8" style={{ color: brandColor }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Patient Ratings</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {doctor._count.ratings}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-100">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Consultation Fee</p>
                <p className="text-3xl font-bold text-green-600">
                  ${doctor.consultation_fee}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-green-100">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Experience</p>
                <p className="text-3xl font-bold text-purple-600">
                  {doctor.experience_years}y
                </p>
              </div>
              <div className="p-4 rounded-xl bg-purple-100">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" style={{ color: brandColor }} />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{doctor.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">{doctor.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-gray-900">{doctor.address}</p>
                  </div>
                </div>

                {doctor.office_number && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Office</p>
                      <p className="text-gray-900">{doctor.office_number}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" style={{ color: brandColor }} />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Specialization</p>
                  <p className="text-gray-900 font-medium">{doctor.specialization}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">License Number</p>
                  <p className="text-gray-900 font-mono">{doctor.license_number}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Qualifications</p>
                  <p className="text-gray-900">{doctor.qualifications}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Experience</p>
                  <p className="text-gray-900">{doctor.experience_years} years</p>
                </div>

                {doctor.languages && doctor.languages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang: string) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Department Assignment */}
            {doctor.department_ref && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" style={{ color: brandColor }} />
                    Department Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {doctor.department_ref.name}
                    </h4>
                    <p className="text-sm text-gray-600">Code: {doctor.department_ref.code}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employment Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" style={{ color: brandColor }} />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Employment Type</p>
                  <p className="text-gray-900">{doctor.employment_type.replace('_', ' ')}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Status at Facility</p>
                  {getStatusBadge(doctor.facility_status)}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Start Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {new Date(doctor.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Accepts New Patients</span>
                  {doctor.accepts_new_patients ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Online Booking</span>
                  {doctor.online_booking_enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                {doctor.is_primary_facility && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ⭐ This is the doctor's primary facility
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Working Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {doctor.facility_working_days && doctor.facility_working_days.length > 0 ? (
                <div className="space-y-3">
                  {doctor.facility_working_days.map((day: any) => (
                    <div key={day.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{day.day_of_week}</p>
                          <p className="text-sm text-gray-600">
                            {day.start_time} - {day.end_time}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {day.max_appointments} appointments
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : doctor.working_days && doctor.working_days.length > 0 ? (
                <div className="space-y-3">
                  {doctor.working_days.map((day: any) => (
                    <div key={day.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{day.day_of_week}</p>
                          <p className="text-sm text-gray-600">
                            {day.start_time} - {day.end_time}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {day.max_appointments} appointments
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No schedule configured yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Patient Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Appointments</span>
                  <span className="text-2xl font-bold" style={{ color: brandColor }}>
                    {doctor._count.appointments}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Patient Ratings</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {doctor._count.ratings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${doctor.consultation_fee}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Contact Name</p>
                  <p className="text-gray-900">{doctor.emergency_contact}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">{doctor.emergency_phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

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
}


