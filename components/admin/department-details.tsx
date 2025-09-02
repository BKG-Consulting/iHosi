"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, Users, Stethoscope, Bed, Settings, Plus, Edit, 
  MapPin, Phone, Mail, Calendar, ArrowLeft, UserCheck, 
  AlertCircle, CheckCircle, XCircle, Wrench
} from "lucide-react";
import { DepartmentWithDetails } from "@/utils/services/department";
import { AddStaffDialog } from "./add-staff-dialog";
import { AddDoctorDialog } from "./add-doctor-dialog";
import { AddWardDialog } from "./add-ward-dialog";
import { toast } from "sonner";

interface DepartmentDetailsProps {
  department: DepartmentWithDetails;
}

export const DepartmentDetails = ({ department }: DepartmentDetailsProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddWardOpen, setIsAddWardOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Active", class: "bg-green-100 text-green-800" },
      INACTIVE: { label: "Inactive", class: "bg-gray-100 text-gray-800" },
      MAINTENANCE: { label: "Maintenance", class: "bg-yellow-100 text-yellow-800" },
      CLOSED: { label: "Closed", class: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    
    return (
      <Badge className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      NURSE: { label: "Nurse", class: "bg-blue-100 text-blue-800" },
      LAB_TECHNICIAN: { label: "Lab Technician", class: "bg-purple-100 text-purple-800" },
      ADMIN: { label: "Admin", class: "bg-orange-100 text-orange-800" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, class: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const getEquipmentStatusBadge = (status: string) => {
    const statusConfig = {
      OPERATIONAL: { label: "Operational", class: "bg-green-100 text-green-800" },
      MAINTENANCE: { label: "Maintenance", class: "bg-yellow-100 text-yellow-800" },
      OUT_OF_SERVICE: { label: "Out of Service", class: "bg-red-100 text-red-800" },
      RETIRED: { label: "Retired", class: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OUT_OF_SERVICE;
    
    return (
      <Badge className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-8 w-px bg-gray-300" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {department.name}
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Department Code: {department.code}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsAddWardOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ward
            </Button>
            <Button
              onClick={() => setIsAddStaffOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
            <Button
              onClick={() => setIsAddDoctorOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Wards</p>
                  <p className="text-2xl font-bold text-gray-900">{department.wards.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{department.staff.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Stethoscope className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">{department.doctors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Bed className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Beds</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {department.wards.reduce((sum, ward) => sum + ward.capacity, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wards">Wards</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Department Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(department.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Capacity</p>
                      <p className="text-lg font-semibold">{department.capacity}</p>
                    </div>
                  </div>
                  
                  {department.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Description</p>
                      <p className="mt-1 text-gray-900">{department.description}</p>
                    </div>
                  )}

                  {department.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{department.location}</span>
                    </div>
                  )}

                  {department.contact_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{department.contact_number}</span>
                    </div>
                  )}

                  {department.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{department.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      Created: {new Date(department.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Department Head */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    Department Head
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {department.head_doctor ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{department.head_doctor.name}</p>
                          <p className="text-sm text-gray-600">{department.head_doctor.specialization}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No department head assigned</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setIsAddDoctorOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Head
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Wards Tab */}
          <TabsContent value="wards" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-blue-600" />
                    Wards ({department.wards.length})
                  </span>
                  <Button
                    onClick={() => setIsAddWardOpen(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ward
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {department.wards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bed className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No wards created yet</p>
                    <Button
                      onClick={() => setIsAddWardOpen(true)}
                      className="mt-3 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Ward
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {department.wards.map((ward) => (
                      <Card key={ward.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{ward.name}</h4>
                            {getStatusBadge(ward.status)}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Capacity:</span>
                              <span className="font-medium">{ward.capacity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Occupied:</span>
                              <span className="font-medium">{ward.current_occupancy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Available:</span>
                              <span className="font-medium text-green-600">
                                {ward.capacity - ward.current_occupancy}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Staff Members ({department.staff.length})
                  </span>
                  <Button
                    onClick={() => setIsAddStaffOpen(true)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {department.staff.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No staff members assigned yet</p>
                    <Button
                      onClick={() => setIsAddStaffOpen(true)}
                      className="mt-3 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Staff Member
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {department.staff.map((member) => (
                      <Card key={member.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                            {getRoleBadge(member.role)}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{member.phone}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                    Doctors ({department.doctors.length})
                  </span>
                  <Button
                    onClick={() => setIsAddDoctorOpen(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Doctor
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {department.doctors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No doctors assigned yet</p>
                    <Button
                      onClick={() => setIsAddDoctorOpen(true)}
                      className="mt-3 bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Doctor
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {department.doctors.map((doctor) => (
                      <Card key={doctor.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                            {doctor.id === department.head_doctor_id && (
                              <Badge className="bg-green-100 text-green-800">Head</Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Specialization:</span>
                              <p className="font-medium">{doctor.specialization}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{doctor.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{doctor.phone}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-600" />
                  Equipment ({department.equipment.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {department.equipment.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No equipment assigned to this department</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {department.equipment.map((item) => (
                      <Card key={item.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            {getEquipmentStatusBadge(item.status)}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <p className="font-medium">{item.equipment_type}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddWardDialog
          open={isAddWardOpen}
          onOpenChange={setIsAddWardOpen}
          departmentId={department.id}
          onSuccess={handleRefresh}
        />

        <AddStaffDialog
          open={isAddStaffOpen}
          onOpenChange={setIsAddStaffOpen}
          departmentId={department.id}
          onSuccess={handleRefresh}
        />

        <AddDoctorDialog
          open={isAddDoctorOpen}
          onOpenChange={setIsAddDoctorOpen}
          departmentId={department.id}
          onSuccess={handleRefresh}
        />
      </div>
    </div>
  );
};
