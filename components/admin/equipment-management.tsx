"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Microscope, 
  Wrench, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Shield,
  RefreshCw,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import EquipmentForm from "@/components/forms/equipment-form";

interface Equipment {
  id: string;
  name: string;
  model: string | null;
  serial_number: string;
  department_id: string | null;
  ward_id: string | null;
  equipment_type: string;
  status: string;
  manufacturer: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  maintenance_cycle: number | null;
  created_at: string;
  updated_at: string;
  department?: {
    id: string;
    name: string;
  } | null;
  ward?: {
    id: string;
    name: string;
  } | null;
}

interface EquipmentStats {
  total: number;
  operational: number;
  maintenance: number;
  outOfService: number;
  retired: number;
  maintenanceDue: number;
  warrantyExpiring: number;
}

interface Department {
  id: string;
  name: string;
}

interface Ward {
  id: string;
  name: string;
  department_id: string;
}

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedWard, setSelectedWard] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const equipmentTypes = [
    { value: "DIAGNOSTIC", label: "Diagnostic" },
    { value: "MONITORING", label: "Monitoring" },
    { value: "SURGICAL", label: "Surgical" },
    { value: "IMAGING", label: "Imaging" },
    { value: "LABORATORY", label: "Laboratory" },
    { value: "THERAPEUTIC", label: "Therapeutic" },
    { value: "SUPPORT", label: "Support" },
    { value: "TRANSPORT", label: "Transport" }
  ];

  const statusOptions = [
    { value: "OPERATIONAL", label: "Operational" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "OUT_OF_SERVICE", label: "Out of Service" },
    { value: "RETIRED", label: "Retired" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentRes, statsRes, departmentsRes, wardsRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/equipment/stats'),
        fetch('/api/departments'),
        fetch('/api/wards')
      ]);

      if (equipmentRes.ok) {
        const equipmentData = await equipmentRes.json();
        setEquipment(equipmentData.equipment || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData.departments || []);
      }

      if (wardsRes.ok) {
        const wardsData = await wardsRes.json();
        setWards(wardsData.wards || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      OPERATIONAL: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      MAINTENANCE: { color: "bg-orange-100 text-orange-800", icon: Wrench },
      OUT_OF_SERVICE: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      RETIRED: { color: "bg-gray-100 text-gray-800", icon: Microscope }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OPERATIONAL;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      DIAGNOSTIC: "bg-blue-100 text-blue-800",
      MONITORING: "bg-purple-100 text-purple-800",
      SURGICAL: "bg-red-100 text-red-800",
      IMAGING: "bg-green-100 text-green-800",
      LABORATORY: "bg-yellow-100 text-yellow-800",
      THERAPEUTIC: "bg-pink-100 text-pink-800",
      SUPPORT: "bg-gray-100 text-gray-800",
      TRANSPORT: "bg-indigo-100 text-indigo-800"
    };

    const colorClass = typeConfig[type as keyof typeof typeConfig] || "bg-gray-100 text-gray-800";

    return (
      <Badge className={`${colorClass} border-0`}>
        {type.toLowerCase()}
      </Badge>
    );
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment === "all" || item.department_id === selectedDepartment;
    const matchesWard = selectedWard === "all" || item.ward_id === selectedWard;
    const matchesType = selectedType === "all" || item.equipment_type === selectedType;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesWard && matchesType && matchesStatus;
  });

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Management</h2>
          <p className="text-gray-600">Manage medical equipment and maintenance schedules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                  <DialogDescription>
                    Add new medical equipment to the system
                  </DialogDescription>
                </DialogHeader>
                <EquipmentForm
                  onSuccess={() => {
                    setIsAddDialogOpen(false);
                    fetchData();
                  }}
                  onCancel={() => setIsAddDialogOpen(false)}
                  departments={departments}
                  wards={wards}
                />
              </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Microscope className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Operational</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.operational}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Wrench className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.maintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Service</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.outOfService}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
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

            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger>
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {equipmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory ({filteredEquipment.length})</CardTitle>
          <CardDescription>
            Manage medical equipment, track maintenance schedules, and monitor equipment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12">
              <Microscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedDepartment !== "all" || selectedWard !== "all" || selectedType !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Get started by adding your first piece of equipment."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Maintenance</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.model && (
                            <div className="text-sm text-gray-500">{item.model}</div>
                          )}
                          {item.manufacturer && (
                            <div className="text-sm text-gray-500">{item.manufacturer}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(item.equipment_type)}</TableCell>
                      <TableCell className="font-mono text-sm">{item.serial_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.department && (
                            <div className="font-medium">{item.department.name}</div>
                          )}
                          {item.ward && (
                            <div className="text-gray-500">{item.ward.name}</div>
                          )}
                          {!item.department && !item.ward && (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.next_maintenance ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(item.next_maintenance).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.warranty_expiry ? (
                          <div className="flex items-center text-sm">
                            <Shield className="w-4 h-4 mr-1" />
                            {new Date(item.warranty_expiry).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">No warranty</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
