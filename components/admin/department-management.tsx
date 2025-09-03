"use client";

import { useState } from "react";
import { DepartmentList } from "@/components/lists/department-list";
import { DepartmentForm } from "@/components/forms/department-form";
import { DepartmentAnalytics } from "@/components/admin/department-analytics";
import { DepartmentResources } from "@/components/admin/department-resources";
import { DepartmentPatientFlow } from "@/components/admin/department-patient-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Plus, 
  Users, 
  Bed, 
  Truck, 
  Search, 
  Filter,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Stethoscope,
  UserCheck
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  contact_number?: string;
  email?: string;
  status: string;
  capacity: number;
  current_load: number;
  created_at: string;
  _count: {
    doctors: number;
    staff: number;
    wards: number;
    equipment: number;
  };
}

interface DepartmentManagementProps {
  departments: Department[];
}

export const DepartmentManagement = ({ departments }: DepartmentManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger refresh of resources
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter departments based on search and status
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || dept.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalStaff = departments.reduce((acc, dept) => acc + (dept._count?.doctors || 0) + (dept._count?.staff || 0), 0);
  const totalWards = departments.reduce((acc, dept) => acc + (dept._count?.wards || 0), 0);
  const totalEquipment = departments.reduce((acc, dept) => acc + (dept._count?.equipment || 0), 0);
  const activeDepartments = departments.filter(dept => dept.status === "ACTIVE").length;
  const averageUtilization = departments.length > 0 
    ? Math.round(departments.reduce((acc, dept) => acc + (dept.current_load / dept.capacity) * 100, 0) / departments.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Management</h1>
              <p className="text-gray-600">Manage hospital departments, wards, and resources</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
                <div className="text-sm text-gray-500">Total Departments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Departments</p>
                  <p className="text-2xl font-bold text-blue-900">{departments.length}</p>
                  <p className="text-xs text-blue-600">{activeDepartments} active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Total Staff</p>
                  <p className="text-2xl font-bold text-green-900">{totalStaff}</p>
                  <p className="text-xs text-green-600">Doctors & Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-500 text-white">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Wards</p>
                  <p className="text-2xl font-bold text-purple-900">{totalWards}</p>
                  <p className="text-xs text-purple-600">Patient areas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700">Equipment</p>
                  <p className="text-2xl font-bold text-orange-900">{totalEquipment}</p>
                  <p className="text-xs text-orange-600">Medical devices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-indigo-500 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700">Avg Utilization</p>
                  <p className="text-2xl font-bold text-indigo-900">{averageUtilization}%</p>
                  <p className="text-xs text-indigo-600">Capacity usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Filters */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search departments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Department Button */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Department</DialogTitle>
                      <DialogDescription>
                        Add a new department to your hospital system. Fill in the required information below.
                      </DialogDescription>
                    </DialogHeader>
                    <DepartmentForm onSuccess={() => setIsAddDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="patient-flow" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Patient Flow
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Departments
                      <Badge variant="secondary" className="ml-2">
                        {filteredDepartments.length} of {departments.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      View and manage all hospital departments
                    </CardDescription>
                  </div>
                  
                  {/* Status Summary */}
                  <div className="flex items-center gap-2">
                    {departments.filter(d => d.status === "ACTIVE").length > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {departments.filter(d => d.status === "ACTIVE").length} Active
                        </span>
                      </div>
                    )}
                    {departments.filter(d => d.status === "MAINTENANCE").length > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {departments.filter(d => d.status === "MAINTENANCE").length} Maintenance
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredDepartments.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm || statusFilter !== "all" ? "No departments found" : "No departments"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by creating your first department."
                      }
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <div className="mt-6">
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              Create First Department
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ) : (
                  <DepartmentList 
                    departments={filteredDepartments} 
                    onDepartmentSelect={setSelectedDepartment}
                    selectedDepartment={selectedDepartment}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {selectedDepartment ? (
              <DepartmentAnalytics 
                departmentId={selectedDepartment.id} 
                departmentName={selectedDepartment.name} 
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Department</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a department from the overview tab to view detailed analytics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            {selectedDepartment ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Resources for {selectedDepartment.name}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={triggerRefresh}
                    className="flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
                <DepartmentResources 
                  departmentId={selectedDepartment.id} 
                  departmentName={selectedDepartment.name}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Department</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a department from the overview tab to manage resources.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Patient Flow Tab */}
          <TabsContent value="patient-flow" className="space-y-6">
            {selectedDepartment ? (
              <DepartmentPatientFlow 
                departmentId={selectedDepartment.id} 
                departmentName={selectedDepartment.name} 
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Department</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a department from the overview tab to manage patient flow.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
