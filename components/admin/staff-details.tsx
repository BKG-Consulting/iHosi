'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useFacility } from '@/lib/facility-context';
import { toast } from 'sonner';
import Link from 'next/link';

interface StaffDetailsProps {
  staffId: string;
}

export function StaffDetails({ staffId }: StaffDetailsProps) {
  const facility = useFacility();
  const [staff, setStaff] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const brandColor = facility?.branding?.primaryColor || facility?.primary_color || '#3b82f6';

  useEffect(() => {
    fetchStaff();
  }, [staffId]);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/staff/${staffId}`);
      const data = await response.json();

      if (data.success) {
        setStaff(data.staff);
      } else {
        toast.error('Failed to fetch staff details');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: brandColor }}></div>
        <p className="text-gray-600 mt-4">Loading staff details...</p>
      </div>
    );
  }

  if (!staff) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Member Not Found</h3>
            <p className="text-gray-500 mb-6">
              The staff member you're looking for doesn't exist or you don't have access to view them.
            </p>
            <Link href="/admin/staff">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Staff List
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  const getRoleLabel = (role: string) => {
    const labels: any = {
      NURSE: 'Nurse',
      LAB_TECHNICIAN: 'Lab Technician',
      CASHIER: 'Cashier',
      ADMIN_ASSISTANT: 'Admin Assistant',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/staff">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold" style={{ color: brandColor }}>
                {staff.name}
              </h1>
              {getStatusBadge(staff.facility_status)}
            </div>
            <p className="text-gray-600">{getRoleLabel(staff.role)}</p>
          </div>
        </div>
        <Button
          onClick={() => toast.info('Edit functionality coming soon')}
          style={{ backgroundColor: brandColor, color: 'white' }}
          className="hover:opacity-90"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Staff Member
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" style={{ color: brandColor }} />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                  <p className="text-gray-900">{staff.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Role</p>
                  <p className="text-gray-900">{getRoleLabel(staff.role)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{staff.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-900">{staff.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-gray-900">{staff.address}</p>
                </div>
              </div>

              {staff.license_number && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">License Number</p>
                  <p className="text-gray-900 font-mono">{staff.license_number}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Info */}
          {staff.department_ref && (
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
                    {staff.department_ref.name}
                  </h4>
                  <p className="text-sm text-gray-600">Code: {staff.department_ref.code}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Info */}
        <div className="space-y-6">
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
                <p className="text-gray-900">{staff.employment_type.replace('_', '-')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                {getStatusBadge(staff.facility_status)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Start Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">
                    {new Date(staff.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {staff.end_date && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">End Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {new Date(staff.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" style={{ color: brandColor }} />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Created</p>
                <p className="text-sm text-gray-900">
                  {new Date(staff.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
                <p className="text-sm text-gray-900">
                  {new Date(staff.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}




