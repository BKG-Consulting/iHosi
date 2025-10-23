'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  UserCog,
  Activity,
  BarChart3,
  Edit,
  ExternalLink,
  CheckCircle,
  Clock,
  Palette,
  Settings,
  Shield,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FacilityDetailsViewProps {
  facility: any;
  recentAppointments: any[];
}

export function FacilityDetailsView({ facility, recentAppointments }: FacilityDetailsViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Facilities
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
              style={{ backgroundColor: facility.primary_color }}
            >
              {facility.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
              <p className="text-gray-600 mt-1">{facility.legal_name}</p>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(facility.status)}
                {facility.is_verified && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline">
                  {facility.facility_code}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => window.open(`http://${facility.slug}.localhost:3000`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Portal
            </Button>
            <Button onClick={() => router.push(`/super-admin/facilities/${facility.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Facility
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">{facility._count.doctor_facilities}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserCog className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{facility._count.patient_facilities}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{facility._count.appointments}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{facility._count.staff_facilities}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-white">
            <TabsTrigger value="overview">
              <Building2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Shield className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Facility Information */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Facility Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Facility Code</p>
                      <p className="font-mono font-medium">{facility.facility_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Subdomain</p>
                      <p className="font-medium">{facility.slug}.ihosi.com</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Legal Name</p>
                      <p className="font-medium">{facility.legal_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{facility.address}</p>
                      <p className="text-sm text-gray-600">{facility.city}, {facility.state} {facility.zip_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{facility.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{facility.email}</p>
                  </div>
                  {facility.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a href={facility.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                        {facility.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Branding */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Primary Color</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded border shadow-sm"
                          style={{ backgroundColor: facility.primary_color }}
                        />
                        <span className="text-sm font-mono">{facility.primary_color}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Secondary Color</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded border shadow-sm"
                          style={{ backgroundColor: facility.secondary_color }}
                        />
                        <span className="text-sm font-mono">{facility.secondary_color}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Accent Color</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded border shadow-sm"
                          style={{ backgroundColor: facility.accent_color }}
                        />
                        <span className="text-sm font-mono">{facility.accent_color}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Timezone</p>
                      <p className="font-medium">{facility.timezone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Language</p>
                      <p className="font-medium">{facility.language}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Currency</p>
                      <p className="font-medium">{facility.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Subscription</p>
                      <Badge variant="outline">{facility.subscription_tier}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Appointments
                </CardTitle>
                <CardDescription>
                  Last 10 appointments at this facility
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No appointments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-all">
                        <div>
                          <p className="font-medium">
                            {appointment.patient?.first_name} {appointment.patient?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Dr. {appointment.doctor?.name} • {appointment.doctor?.specialization}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                        <Badge>{appointment.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            {/* Facility Admins */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Facility Administrators
                    </CardTitle>
                    <CardDescription>
                      {facility._count.admins} admin(s) for this facility
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <UserCog className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {facility.admins.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No administrators assigned</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {facility.admins.map((admin: any) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all">
                        <div>
                          <p className="font-medium text-gray-900">{admin.name}</p>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{admin.role}</Badge>
                            {admin.last_login_at && (
                              <span className="text-xs text-gray-500">
                                Last login: {new Date(admin.last_login_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={admin.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}>
                          {admin.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doctors */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Doctors ({facility._count.doctor_facilities})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {facility.doctor_facilities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No doctors assigned</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {facility.doctor_facilities.map((df: any) => (
                      <div key={df.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{df.doctor.name}</p>
                          <p className="text-sm text-gray-600">{df.doctor.specialization}</p>
                          <p className="text-xs text-gray-500">{df.doctor.email}</p>
                        </div>
                        <Badge variant="outline">{df.employment_type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="py-12">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Facility Analytics</h3>
                  <p className="text-gray-500">
                    Detailed analytics for {facility.name} coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Facility Settings</CardTitle>
                <CardDescription>
                  Configure facility preferences and limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Max Doctors</p>
                    <p className="text-2xl font-bold">{facility.max_doctors}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Max Patients</p>
                    <p className="text-2xl font-bold">{facility.max_patients}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Default Open Time</p>
                    <p className="font-medium">{facility.default_open_time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Default Close Time</p>
                    <p className="font-medium">{facility.default_close_time}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Subscription</p>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{facility.subscription_tier.toUpperCase()}</p>
                      <p className="text-sm text-gray-600">Status: {facility.subscription_status}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Upgrade
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Created</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{new Date(facility.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6 mt-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Logs</h3>
                  <p className="text-gray-500">
                    Activity logs for {facility.name} coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

