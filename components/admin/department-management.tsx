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
        return "bg-[#D1F1F2] text-[#046658] border-[#5AC5C8]";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "MAINTENANCE":
        return "bg-[#2EB6B0]/10 text-[#2EB6B0] border-[#2EB6B0]";
      case "CLOSED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#3E4C4B]">Department Management</h1>
                  <p className="text-[#3E4C4B]/70 text-sm">Ihosi Healthcare Management System</p>
                </div>
              </div>
              <p className="text-[#3E4C4B]/80">Manage hospital departments, wards, and resources with precision</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-[#D1F1F2] shadow-sm">
                <div className="text-2xl font-bold text-[#046658]">{departments.length}</div>
                <div className="text-sm text-[#3E4C4B]/70">Total Departments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 border-[#D1F1F2] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#046658] to-[#2EB6B0] text-white shadow-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Departments</p>
                  <p className="text-2xl font-bold text-[#046658]">{departments.length}</p>
                  <p className="text-xs text-[#5AC5C8]">{activeDepartments} active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#5AC5C8]/10 to-[#2EB6B0]/10 border-[#D1F1F2] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#5AC5C8] to-[#2EB6B0] text-white shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Total Staff</p>
                  <p className="text-2xl font-bold text-[#046658]">{totalStaff}</p>
                  <p className="text-xs text-[#5AC5C8]">Doctors & Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2EB6B0]/10 to-[#5AC5C8]/10 border-[#D1F1F2] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#2EB6B0] to-[#5AC5C8] text-white shadow-lg">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Total Wards</p>
                  <p className="text-2xl font-bold text-[#046658]">{totalWards}</p>
                  <p className="text-xs text-[#5AC5C8]">Patient areas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#046658]/5 to-[#5AC5C8]/10 border-[#D1F1F2] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#046658] to-[#5AC5C8] text-white shadow-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Equipment</p>
                  <p className="text-2xl font-bold text-[#046658]">{totalEquipment}</p>
                  <p className="text-xs text-[#5AC5C8]">Medical devices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#5AC5C8]/5 to-[#2EB6B0]/10 border-[#D1F1F2] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#5AC5C8] to-[#2EB6B0] text-white shadow-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]">Avg Utilization</p>
                  <p className="text-2xl font-bold text-[#046658]">{averageUtilization}%</p>
                  <p className="text-xs text-[#5AC5C8]">Capacity usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Filters */}
        <div className="mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-[#D1F1F2] shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-4 h-4" />
                    <Input
                      placeholder="Search departments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#D1F1F2] focus:border-[#2EB6B0] focus:ring-[#2EB6B0]/20"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 border-[#D1F1F2] focus:border-[#2EB6B0] focus:ring-[#2EB6B0]/20">
                      <Filter className="w-4 h-4 mr-2 text-[#5AC5C8]" />
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
                    <Button className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#046658]/90 hover:to-[#2EB6B0]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-[#3E4C4B]">Create New Department</DialogTitle>
                      <DialogDescription className="text-[#3E4C4B]/70">
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
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border border-[#D1F1F2] shadow-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white text-[#3E4C4B] hover:text-[#046658]">
              <Building2 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white text-[#3E4C4B] hover:text-[#046658]">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white text-[#3E4C4B] hover:text-[#046658]">
              <Stethoscope className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="patient-flow" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#046658] data-[state=active]:to-[#2EB6B0] data-[state=active]:text-white text-[#3E4C4B] hover:text-[#046658]">
              <UserCheck className="w-4 h-4" />
              Patient Flow
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-[#D1F1F2] shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-[#3E4C4B]">
                      <Building2 className="w-5 h-5 text-[#046658]" />
                      Departments
                      <Badge variant="secondary" className="ml-2 bg-[#D1F1F2] text-[#3E4C4B] border-[#5AC5C8]">
                        {filteredDepartments.length} of {departments.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-[#3E4C4B]/70">
                      View and manage all hospital departments
                    </CardDescription>
                  </div>
                  
                  {/* Status Summary */}
                  <div className="flex items-center gap-2">
                    {departments.filter(d => d.status === "ACTIVE").length > 0 && (
                      <div className="flex items-center gap-1 text-[#046658] bg-[#D1F1F2] px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {departments.filter(d => d.status === "ACTIVE").length} Active
                        </span>
                      </div>
                    )}
                    {departments.filter(d => d.status === "MAINTENANCE").length > 0 && (
                      <div className="flex items-center gap-1 text-[#2EB6B0] bg-[#2EB6B0]/10 px-3 py-1 rounded-full">
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
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 rounded-full flex items-center justify-center mb-4">
                      <Building2 className="h-8 w-8 text-[#5AC5C8]" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-[#3E4C4B]">
                      {searchTerm || statusFilter !== "all" ? "No departments found" : "No departments"}
                    </h3>
                    <p className="mt-1 text-sm text-[#3E4C4B]/70">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by creating your first department."
                      }
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <div className="mt-6">
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#046658]/90 hover:to-[#2EB6B0]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
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
              <Card className="bg-white/80 backdrop-blur-sm border-[#D1F1F2] shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="h-8 w-8 text-[#5AC5C8]" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-[#3E4C4B]">Select a Department</h3>
                    <p className="mt-1 text-sm text-[#3E4C4B]/70">
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
                <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-[#D1F1F2] shadow-sm">
                  <h3 className="text-lg font-semibold text-[#3E4C4B]">Resources for {selectedDepartment.name}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={triggerRefresh}
                    className="flex items-center gap-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2] hover:text-[#046658]"
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
              <Card className="bg-white/80 backdrop-blur-sm border-[#D1F1F2] shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 rounded-full flex items-center justify-center mb-4">
                      <Stethoscope className="h-8 w-8 text-[#5AC5C8]" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-[#3E4C4B]">Select a Department</h3>
                    <p className="mt-1 text-sm text-[#3E4C4B]/70">
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
              <Card className="bg-white/80 backdrop-blur-sm border-[#D1F1F2] shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 rounded-full flex items-center justify-center mb-4">
                      <UserCheck className="h-8 w-8 text-[#5AC5C8]" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-[#3E4C4B]">Select a Department</h3>
                    <p className="mt-1 text-sm text-[#3E4C4B]/70">
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
