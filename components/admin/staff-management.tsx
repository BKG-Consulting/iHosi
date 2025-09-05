"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus,
  Building2,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { StaffFormNew } from "../forms/staff-form-new";
import { toast } from "sonner";

interface Staff {
  id: string;
  name: string;
  role: 'NURSE' | 'LAB_TECHNICIAN' | 'CASHIER' | 'ADMIN_ASSISTANT';
  email: string;
  phone: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  hireDate: string;
  licenseNumber?: string;
  specialization?: string;
}

const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "NURSE",
    email: "sarah.johnson@hospital.com",
    phone: "+1234567890",
    department: "Emergency Medicine",
    status: "ACTIVE",
    hireDate: "2023-01-15",
    licenseNumber: "RN-12345",
    specialization: "Emergency Care"
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "LAB_TECHNICIAN",
    email: "michael.chen@hospital.com",
    phone: "+1234567891",
    department: "Laboratory",
    status: "ACTIVE",
    hireDate: "2022-08-20",
    licenseNumber: "MLT-67890",
    specialization: "Clinical Chemistry"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "CASHIER",
    email: "emily.rodriguez@hospital.com",
    phone: "+1234567892",
    department: "Finance",
    status: "ACTIVE",
    hireDate: "2023-03-10",
    specialization: "Patient Billing"
  },
  {
    id: "4",
    name: "David Thompson",
    role: "NURSE",
    email: "david.thompson@hospital.com",
    phone: "+1234567893",
    department: "Cardiology",
    status: "ON_LEAVE",
    hireDate: "2021-11-05",
    licenseNumber: "RN-54321",
    specialization: "Cardiac Care"
  }
];

const roleColors = {
  NURSE: "bg-blue-100 text-blue-800",
  LAB_TECHNICIAN: "bg-green-100 text-green-800",
  CASHIER: "bg-purple-100 text-purple-800",
  ADMIN_ASSISTANT: "bg-orange-100 text-orange-800"
};

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-red-100 text-red-800",
  ON_LEAVE: "bg-yellow-100 text-yellow-800"
};

export const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Fetch staff data from API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff');
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match component interface
        const transformedStaff = data.staff.map((member: any) => ({
          id: member.id,
          name: member.name,
          role: member.role,
          email: member.email,
          phone: member.phone,
          department: member.department || 'General',
          status: member.status || 'ACTIVE',
          hireDate: member.created_at ? new Date(member.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          licenseNumber: member.license_number,
          specialization: member.specialization
        }));
        setStaff(transformedStaff);
      } else {
        toast.error('Failed to fetch staff data');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff data on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || staffMember.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staffMember.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddStaff = async (newStaff: any) => {
    // The StaffFormNew component will handle the API call
    // We just need to refresh the data after successful creation
    setIsAddDialogOpen(false);
    await fetchStaff(); // Refresh the staff list
    toast.success("Staff member added successfully!");
  };

  const handleUpdateStaff = (data: any) => {
    if (selectedStaff) {
      const updatedStaff = { ...selectedStaff, ...data };
      setStaff(staff.map(s => s.id === selectedStaff.id ? updatedStaff : s));
      setSelectedStaff(null);
      toast.success("Staff member updated successfully!");
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff(staff.filter(s => s.id !== staffId));
    toast.success("Staff member removed successfully!");
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'INACTIVE':
        return <XCircle className="w-4 h-4" />;
      case 'ON_LEAVE':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading staff data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Staff Management
              </h1>
              <p className="text-xl text-gray-600 mt-2">Manage hospital staff, nurses, and support personnel</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                  <DialogDescription>
                    Register a new staff member with appropriate role and permissions
                  </DialogDescription>
                </DialogHeader>
                <StaffFormNew onSubmit={handleAddStaff} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Staff</p>
                    <p className="text-3xl font-bold">{staff.length}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Active Staff</p>
                    <p className="text-3xl font-bold">{staff.filter(s => s.status === 'ACTIVE').length}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Nurses</p>
                    <p className="text-3xl font-bold">{staff.filter(s => s.role === 'NURSE').length}</p>
                  </div>
                  <Shield className="w-12 h-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">On Leave</p>
                    <p className="text-3xl font-bold">{staff.filter(s => s.status === 'ON_LEAVE').length}</p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search staff by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="NURSE">Nurses</SelectItem>
                    <SelectItem value="LAB_TECHNICIAN">Lab Technicians</SelectItem>
                    <SelectItem value="CASHIER">Cashiers</SelectItem>
                    <SelectItem value="ADMIN_ASSISTANT">Admin Assistants</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="text-xl text-gray-900">Hospital Staff Directory</CardTitle>
            <CardDescription>
              {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                <p className="text-gray-500 mb-4">
                  {staff.length === 0 
                    ? "Get started by adding your first staff member."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {staff.length === 0 && (
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First Staff Member
                  </Button>
                )}
              </div>
            ) : (
              <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Staff Member</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Hire Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow key={staffMember.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {staffMember.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{staffMember.name}</p>
                          <p className="text-sm text-gray-500">{staffMember.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[staffMember.role]}>
                        {getRoleDisplayName(staffMember.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{staffMember.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(staffMember.status)}
                        <Badge className={statusColors[staffMember.status]}>
                          {staffMember.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700">{staffMember.phone}</span>
                        </div>
                        {staffMember.licenseNumber && (
                          <div className="flex items-center space-x-2 text-sm">
                            <GraduationCap className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-700">{staffMember.licenseNumber}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(staffMember.hireDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedStaff(staffMember)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedStaff(staffMember)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStaff(staffMember.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Staff Dialog */}
        {selectedStaff && (
          <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
                <DialogDescription>
                  Update staff member information and permissions
                </DialogDescription>
              </DialogHeader>
              <StaffFormNew 
                staff={selectedStaff} 
                onSubmit={handleUpdateStaff}
                onCancel={() => setSelectedStaff(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
