"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Building2, Bed,
  Users, MapPin, Layers, AlertCircle, CheckCircle, XCircle
} from "lucide-react";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Ward {
  id: string;
  name: string;
  department_id: string;
  floor?: number;
  wing?: string;
  capacity: number;
  current_occupancy: number;
  ward_type: string;
  status: string;
  department?: Department;
}

const wardTypes = [
  { value: "INTENSIVE_CARE", label: "Intensive Care Unit (ICU)" },
  { value: "GENERAL", label: "General Ward" },
  { value: "EMERGENCY", label: "Emergency Ward" },
  { value: "OPERATING_ROOM", label: "Operating Room" },
  { value: "RECOVERY", label: "Recovery Ward" },
  { value: "PEDIATRIC", label: "Pediatric Ward" },
  { value: "MATERNITY", label: "Maternity Ward" },
  { value: "PSYCHIATRIC", label: "Psychiatric Ward" },
  { value: "ISOLATION", label: "Isolation Ward" },
  { value: "STEP_DOWN", label: "Step-down Ward" }
];

const wardStatuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "QUARANTINE", label: "Quarantine" },
  { value: "CLOSED", label: "Closed" }
];

export const WardManagement = () => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    department_id: "",
    floor: "",
    wing: "",
    capacity: "20",
    ward_type: "GENERAL",
    status: "ACTIVE"
  });

  useEffect(() => {
    fetchDepartments();
    fetchWards();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDepartments(data.departments || []);
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchWards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wards');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWards(data.wards || []);
        }
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
      toast.error('Failed to load wards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.department_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/wards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          capacity: parseInt(formData.capacity)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Ward created successfully');
          setIsAddDialogOpen(false);
          setFormData({
            name: "",
            department_id: "",
            floor: "",
            wing: "",
            capacity: "20",
            ward_type: "GENERAL",
            status: "ACTIVE"
          });
          fetchWards();
        }
      } else {
        toast.error('Failed to create ward');
      }
    } catch (error) {
      console.error('Error creating ward:', error);
      toast.error('Failed to create ward');
    }
  };

  const handleDelete = async (wardId: string) => {
    if (!confirm('Are you sure you want to delete this ward? This will also remove all associated beds.')) return;

    try {
      const response = await fetch(`/api/wards/${wardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Ward deleted successfully');
        fetchWards();
      } else {
        toast.error('Failed to delete ward');
      }
    } catch (error) {
      console.error('Error deleting ward:', error);
      toast.error('Failed to delete ward');
    }
  };

  const filteredWards = wards.filter(ward => {
    const matchesSearch = ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ward.wing?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || ward.department_id === departmentFilter;
    const matchesStatus = statusFilter === "all" || ward.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  };

  const getWardTypeLabel = (type: string) => {
    const wardType = wardTypes.find(wt => wt.value === type);
    return wardType ? wardType.label : type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = wardStatuses.find(s => s.value === status);
    let colorClass = "bg-gray-100 text-gray-800";
    
    switch (status) {
      case "ACTIVE":
        colorClass = "bg-green-100 text-green-800";
        break;
      case "MAINTENANCE":
        colorClass = "bg-yellow-100 text-yellow-800";
        break;
      case "QUARANTINE":
        colorClass = "bg-red-100 text-red-800";
        break;
      case "CLOSED":
        colorClass = "bg-gray-100 text-gray-800";
        break;
    }
    
    return (
      <Badge className={colorClass}>
        {statusConfig ? statusConfig.label : status}
      </Badge>
    );
  };

  const getOccupancyColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ward & Bed Management
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Manage hospital wards, bed assignments, and patient accommodations
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Ward
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Ward</DialogTitle>
                  <DialogDescription>
                    Create a new ward and assign it to a department
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ward Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., ICU Ward A"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department_id">Department *</Label>
                    <Select
                      value={formData.department_id}
                      onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        id="floor"
                        type="number"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        placeholder="Floor number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wing">Wing</Label>
                      <Input
                        id="wing"
                        value={formData.wing}
                        onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                        placeholder="e.g., North, South"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Bed Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ward_type">Ward Type *</Label>
                    <Select
                      value={formData.ward_type}
                      onValueChange={(value) => setFormData({ ...formData, ward_type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wardTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wardStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Ward</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
                  <p className="text-2xl font-bold text-gray-900">{wards.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Bed className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Beds</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {wards.reduce((sum, ward) => sum + ward.capacity, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied Beds</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {wards.reduce((sum, ward) => sum + ward.current_occupancy, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Wards</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {wards.filter(ward => ward.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search wards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {wardStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Wards Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Ward Management</CardTitle>
            <CardDescription>
              Manage hospital wards, bed assignments, and patient accommodations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading wards...</p>
              </div>
            ) : filteredWards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No wards found</p>
                {departments.length === 0 && (
                  <p className="text-sm mt-2">
                    You need to create departments first before adding wards.
                  </p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ward Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWards.map((ward) => (
                    <TableRow key={ward.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{ward.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDepartmentName(ward.department_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                     {ward.floor && (
                             <span className="flex items-center gap-1">
                               <Layers className="w-3 h-3" />
                               {ward.floor}
                             </span>
                           )}
                          {ward.wing && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {ward.wing}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {getWardTypeLabel(ward.ward_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{ward.capacity}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${getOccupancyColor(ward.current_occupancy, ward.capacity)}`}>
                            {ward.current_occupancy}
                          </span>
                          <span className="text-gray-500">/</span>
                          <span className="text-gray-700">{ward.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ward.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(ward.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
