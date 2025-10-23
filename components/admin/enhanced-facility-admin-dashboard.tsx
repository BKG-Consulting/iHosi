'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  UserCog,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Bed,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  FileText,
  Settings,
  BarChart3,
  PieChart,
  Stethoscope,
  UserPlus,
  CalendarPlus,
  Ambulance,
  ClipboardList,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { useFacility } from '@/lib/facility-context';
import { DepartmentList } from './department-list';
import { CreateDepartmentDialog } from './create-department-dialog';
import { StaffList } from './staff-list';
import { AddStaffDialog } from './add-staff-dialog';
import { DoctorList } from './doctor-list';
import { AssignDoctorDialog } from './assign-doctor-dialog';
import { toast } from 'sonner';

interface DashboardStats {
  totalPatient: number;
  totalDoctors: number;
  totalAppointments: number;
  availableDoctors: any[];
  last5Records: any[];
  appointmentCounts: any;
  monthlyData: any;
}

interface EnhancedFacilityAdminDashboardProps {
  initialStats: DashboardStats;
  facility?: any;
}

export function EnhancedFacilityAdminDashboard({ initialStats, facility }: EnhancedFacilityAdminDashboardProps) {
  const [stats] = useState(initialStats);
  const [createDeptDialogOpen, setCreateDeptDialogOpen] = useState(false);
  const [addStaffDialogOpen, setAddStaffDialogOpen] = useState(false);
  const [assignDoctorDialogOpen, setAssignDoctorDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(true);
  const facilityContext = useFacility();
  
  // Use facility from context or props
  const currentFacility = facilityContext || facility;

  // Fetch real departments from API
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsDepartmentsLoading(true);
      const response = await fetch('/api/admin/departments');
      const data = await response.json();
      
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setIsDepartmentsLoading(false);
    }
  };
  
  // Dynamic branding
  const brandColors = {
    primary: currentFacility?.branding?.primaryColor || currentFacility?.primary_color || '#3b82f6',
    secondary: currentFacility?.branding?.secondaryColor || currentFacility?.secondary_color || '#8b5cf6',
    accent: currentFacility?.branding?.accentColor || currentFacility?.accent_color || '#10b981',
  };

  // Mock data for demonstration (will be replaced with real data)
  const todayStats = {
    newPatients: 5,
    completedAppointments: 32,
    currentAdmissions: 23,
    todayRevenue: 12500,
    bedOccupancy: 85,
    onTimeRate: 98,
  };

  const alerts = [
    { id: 1, type: 'warning', message: 'ICU at 95% capacity', time: '10 mins ago' },
    { id: 2, type: 'info', message: '2 staff members on sick leave today', time: '1 hour ago' },
    { id: 3, type: 'warning', message: 'Equipment maintenance due tomorrow', time: '2 hours ago' },
  ];

  const todaySchedule = [
    { time: '09:00', doctor: 'Dr. Smith', patients: 5, department: 'Cardiology' },
    { time: '10:00', doctor: 'Dr. Chen', patients: 3, department: 'Neurology' },
    { time: '11:00', doctor: 'Dr. Davis', patients: 4, department: 'Emergency' },
    { time: '14:00', doctor: 'Dr. Johnson', patients: 6, department: 'Pediatrics' },
  ];

  const recentActivity = [
    { id: 1, type: 'patient', message: 'New patient registered: John Doe', time: '5 mins ago', icon: UserPlus },
    { id: 2, type: 'appointment', message: 'Appointment booked with Dr. Smith', time: '12 mins ago', icon: CalendarPlus },
    { id: 3, type: 'admission', message: 'Patient admitted to ICU', time: '25 mins ago', icon: Ambulance },
    { id: 4, type: 'staff', message: 'New nurse added: Sarah Johnson', time: '1 hour ago', icon: Users },
  ];

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }: any) => (
    <Card 
      className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
      style={{ borderTop: `4px solid ${brandColors.primary}` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {changeType === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="font-medium">{change}</span>
              </div>
            )}
          </div>
          <div 
            className="p-4 rounded-xl shadow-sm"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-8 w-8" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Facility Branding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentFacility && (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                style={{ backgroundColor: brandColors.primary }}
              >
                {currentFacility.name?.charAt(0) || 'F'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 
                  className="text-3xl font-bold"
                  style={{ color: brandColors.primary }}
                >
                  {currentFacility?.name || 'Facility Admin Dashboard'}
                </h1>
                {currentFacility?.is_verified && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {currentFacility?.city}, {currentFacility?.state} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => toast.info('Report generation feature coming soon')}
              style={{ 
                borderColor: brandColors.primary,
                color: brandColors.primary
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button 
              onClick={() => toast.info('Announcements feature coming soon')}
              style={{ 
                backgroundColor: brandColors.primary,
                color: 'white'
              }}
              className="hover:opacity-90"
            >
              <Bell className="h-4 w-4 mr-2" />
              Announcements
            </Button>
          </div>
        </div>

        {/* Key Metrics - 2 rows of 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={stats.totalPatient || 0}
            change="+12% vs last month"
            changeType="up"
            icon={Users}
            color={brandColors.primary}
          />
          <StatCard
            title="Active Doctors"
            value={stats.totalDoctors || 0}
            change="2 on leave"
            changeType="down"
            icon={UserCog}
            color={brandColors.secondary}
          />
          <StatCard
            title="Staff Members"
            value="25"
            change="+3 this month"
            changeType="up"
            icon={Users}
            color={brandColors.accent}
          />
          <StatCard
            title="Today's Appointments"
            value={todayStats.completedAppointments}
            change={`${stats.totalAppointments || 0} total`}
            changeType="up"
            icon={Calendar}
            color="#f59e0b"
          />
          <StatCard
            title="Current Admissions"
            value={todayStats.currentAdmissions}
            change="3 pending discharge"
            changeType="up"
            icon={Bed}
            color="#ef4444"
          />
          <StatCard
            title="Bed Occupancy"
            value={`${todayStats.bedOccupancy}%`}
            change="15 beds available"
            changeType="up"
            icon={Percent}
            color="#8b5cf6"
          />
          <StatCard
            title="Today's Revenue"
            value={`$${(todayStats.todayRevenue / 1000).toFixed(1)}K`}
            change="+18% vs yesterday"
            changeType="up"
            icon={DollarSign}
            color="#10b981"
          />
          <StatCard
            title="On-Time Rate"
            value={`${todayStats.onTimeRate}%`}
            change="Excellent"
            changeType="up"
            icon={Clock}
            color="#06b6d4"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" style={{ color: brandColors.primary }} />
                    Today's Schedule
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    style={{ 
                      borderColor: brandColors.primary,
                      color: brandColors.primary
                    }}
                  >
                    View Full Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaySchedule.map((slot, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all"
                      style={{ borderLeft: `4px solid ${brandColors.primary}` }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="px-3 py-1 rounded font-medium text-sm"
                          style={{ 
                            backgroundColor: `${brandColors.primary}20`,
                            color: brandColors.primary
                          }}
                        >
                          {slot.time}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{slot.doctor}</p>
                          <p className="text-sm text-gray-600">{slot.department}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{slot.patients} patients</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Department Overview */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" style={{ color: brandColors.secondary }} />
                    Departments
                  </CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => setCreateDeptDialogOpen(true)}
                    style={{ 
                      backgroundColor: brandColors.secondary,
                      color: 'white'
                    }}
                    className="hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isDepartmentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3" style={{ borderColor: brandColors.primary }}></div>
                    <p className="text-sm text-gray-500">Loading departments...</p>
                  </div>
                ) : departments.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-600 mb-3">No departments yet</p>
                    <Button
                      size="sm"
                      onClick={() => setCreateDeptDialogOpen(true)}
                      style={{ 
                        backgroundColor: brandColors.secondary,
                        color: 'white'
                      }}
                      className="hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Department
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {departments.map((dept) => (
                      <div 
                        key={dept.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                            <p className="text-sm text-gray-600">Code: {dept.code}</p>
                          </div>
                          <Badge 
                            className={
                              dept.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }
                          >
                            {dept.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                              {dept.current_load || 0}
                            </p>
                            <p className="text-xs text-gray-500">Patients</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold" style={{ color: brandColors.secondary }}>
                              {dept._count?.doctors || 0}
                            </p>
                            <p className="text-xs text-gray-500">Doctors</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold" style={{ color: brandColors.accent }}>
                              {dept._count?.staff || 0}
                            </p>
                            <p className="text-xs text-gray-500">Staff</p>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Capacity</span>
                            <span>{dept.current_load || 0}/{dept.capacity}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(((dept.current_load || 0) / dept.capacity) * 100, 100)}%`,
                                backgroundColor: ((dept.current_load || 0) / dept.capacity) > 0.8 ? '#ef4444' : brandColors.accent
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" style={{ color: brandColors.accent }} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${brandColors.primary}15` }}
                      >
                        <activity.icon className="h-4 w-4" style={{ color: brandColors.primary }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card 
              className="border-0 shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.primary}15 0%, ${brandColors.secondary}15 100%)`
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info('Patient registration feature coming soon')}
                  style={{ 
                    borderColor: brandColors.primary,
                    color: brandColors.primary
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Patient
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info('Appointment booking feature coming soon')}
                  style={{ 
                    borderColor: brandColors.primary,
                    color: brandColors.primary
                  }}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info('Patient admission feature coming soon')}
                  style={{ 
                    borderColor: brandColors.primary,
                    color: brandColors.primary
                  }}
                >
                  <Ambulance className="h-4 w-4 mr-2" />
                  Admit Patient
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setAddStaffDialogOpen(true)}
                  style={{ 
                    borderColor: brandColors.primary,
                    color: brandColors.primary
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => toast.info('Report generation feature coming soon')}
                  style={{ 
                    borderColor: brandColors.primary,
                    color: brandColors.primary
                  }}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.type === 'warning' 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`h-4 w-4 mt-0.5 ${
                          alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            alert.type === 'warning' ? 'text-orange-900' : 'text-blue-900'
                          }`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bed Availability */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" style={{ color: brandColors.accent }} />
                  Bed Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold" style={{ color: brandColors.accent }}>
                      {todayStats.bedOccupancy}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Occupancy Rate</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Beds</span>
                      <span className="font-medium">100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Occupied</span>
                      <span className="font-medium text-red-600">85</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available</span>
                      <span className="font-medium text-green-600">15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cleaning</span>
                      <span className="font-medium text-yellow-600">0</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    style={{ 
                      borderColor: brandColors.accent,
                      color: brandColors.accent
                    }}
                  >
                    View Bed Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList 
            className="grid w-full grid-cols-6 bg-white shadow-sm"
            style={{ borderBottom: `2px solid ${brandColors.primary}20` }}
          >
            <TabsTrigger value="overview" className="data-[state=active]:text-white" style={{ 
              '--active-bg': brandColors.primary 
            } as any}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="doctors">
              <UserCog className="h-4 w-4 mr-2" />
              Doctors
            </TabsTrigger>
            <TabsTrigger value="patients">
              <Stethoscope className="h-4 w-4 mr-2" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-gray-600">
                    Overview tab content - Charts and detailed analytics will go here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentList />
          </TabsContent>

          <TabsContent value="staff">
            <StaffList />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorList />
          </TabsContent>

          <TabsContent value="patients">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="py-8">
                <div className="text-center">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Management</h3>
                  <p className="text-gray-500">
                    Register and manage patients at your facility
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
                  <p className="text-gray-500">
                    Generate reports and view analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Department Dialog */}
        <CreateDepartmentDialog
          open={createDeptDialogOpen}
          onOpenChange={setCreateDeptDialogOpen}
          onSuccess={() => {
            // Refetch departments to show the new one
            fetchDepartments();
          }}
        />

        {/* Add Staff Dialog */}
        <AddStaffDialog
          open={addStaffDialogOpen}
          onOpenChange={setAddStaffDialogOpen}
          onSuccess={() => {
            // Success handled by StaffList component
          }}
        />

        {/* Assign Doctor Dialog */}
        <AssignDoctorDialog
          open={assignDoctorDialogOpen}
          onOpenChange={setAssignDoctorDialogOpen}
          onSuccess={() => {
            // Success handled by DoctorList component
          }}
        />
      </div>
    </div>
  );
}

