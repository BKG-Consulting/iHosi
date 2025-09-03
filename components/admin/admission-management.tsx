"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus, 
  Bed, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Types
interface Admission {
  id: string;
  admission_number: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  doctor: {
    name: string;
  };
  department: {
    name: string;
  };
  ward?: {
    name: string;
  };
  bed?: {
    bed_number: string;
  };
  admission_type: string;
  admission_status: string;
  priority_level: string;
  admission_date: string;
  admission_time: string;
  estimated_stay_days?: number;
  estimated_cost?: number;
}

// Mock data for demonstration
const mockAdmissions: Admission[] = [
  {
    id: "adm_001",
    admission_number: "ADM-2024-001",
    patient: {
      first_name: "John",
      last_name: "Doe"
    },
    doctor: {
      name: "Dr. Sarah Wilson"
    },
    department: {
      name: "Cardiology"
    },
    ward: {
      name: "ICU Ward A"
    },
    bed: {
      bed_number: "A1"
    },
    admission_type: "EMERGENCY",
    admission_status: "ADMITTED",
    priority_level: "HIGH",
    admission_date: "2024-01-15",
    admission_time: "14:30",
    estimated_stay_days: 3,
    estimated_cost: 2500
  },
  {
    id: "adm_002",
    admission_number: "ADM-2024-002",
    patient: {
      first_name: "Jane",
      last_name: "Smith"
    },
    doctor: {
      name: "Dr. Michael Brown"
    },
    department: {
      name: "Orthopedics"
    },
    ward: {
      name: "General Ward B"
    },
    bed: {
      bed_number: "B5"
    },
    admission_type: "ELECTIVE",
    admission_status: "PENDING",
    priority_level: "MEDIUM",
    admission_date: "2024-01-16",
    admission_time: "09:00",
    estimated_stay_days: 2,
    estimated_cost: 1800
  }
];

const admissionTypes = [
  { value: "EMERGENCY", label: "Emergency", color: "destructive" },
  { value: "ELECTIVE", label: "Elective", color: "default" },
  { value: "OBSERVATION", label: "Observation", color: "secondary" },
  { value: "DAY_CARE", label: "Day Care", color: "outline" },
  { value: "TRANSFER", label: "Transfer", color: "default" }
];

const admissionStatuses = [
  { value: "PENDING", label: "Pending", color: "secondary" },
  { value: "ADMITTED", label: "Admitted", color: "default" },
  { value: "TRANSFERRED", label: "Transferred", color: "outline" },
  { value: "DISCHARGED", label: "Discharged", color: "default" },
  { value: "CANCELLED", label: "Cancelled", color: "destructive" }
];

const priorityLevels = [
  { value: "CRITICAL", label: "Critical", color: "destructive" },
  { value: "HIGH", label: "High", color: "destructive" },
  { value: "MEDIUM", label: "Medium", color: "default" },
  { value: "LOW", label: "Low", color: "secondary" }
];

export default function AdmissionManagement() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    emergency: 0
  });

  // Fetch admissions data
  useEffect(() => {
    fetchAdmissions();
    fetchStats();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admissions');
      const data = await response.json();
      
      if (data.success) {
        setAdmissions(data.data || []);
      } else {
        toast.error('Failed to fetch admissions');
        // Fallback to mock data for demonstration
        setAdmissions(mockAdmissions);
      }
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast.error('Failed to fetch admissions');
      // Fallback to mock data for demonstration
      setAdmissions(mockAdmissions);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admissions?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter admissions based on search and filters
  const filteredAdmissions = admissions.filter(admission => {
    const patientName = `${admission.patient.first_name} ${admission.patient.last_name}`;
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admission.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admission.doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || admission.admission_status === statusFilter;
    const matchesType = typeFilter === "ALL" || admission.admission_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = admissionStatuses.find(s => s.value === status);
    return (
      <Badge variant={statusConfig?.color as any || "default"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = admissionTypes.find(t => t.value === type);
    return (
      <Badge variant={typeConfig?.color as any || "default"}>
        {typeConfig?.label || type}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorityLevels.find(p => p.value === priority);
    return (
      <Badge variant={priorityConfig?.color as any || "default"}>
        {priorityConfig?.label || priority}
      </Badge>
    );
  };

  const handleCreateAdmission = () => {
    toast.success("Admission created successfully!");
    setIsCreateDialogOpen(false);
  };

  const handleViewAdmission = (admission: any) => {
    setSelectedAdmission(admission);
  };

  const handleUpdateStatus = (admissionId: string, newStatus: string) => {
    setAdmissions(prev => prev.map(adm => 
      adm.id === admissionId ? { ...adm, status: newStatus } : adm
    ));
    toast.success("Admission status updated!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admission Management</h1>
          <p className="text-muted-foreground">
            Manage patient admissions, bed assignments, and discharge planning
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Admission
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Admission</DialogTitle>
              <DialogDescription>
                Register a new patient admission to the hospital
              </DialogDescription>
            </DialogHeader>
            <CreateAdmissionForm onSubmit={handleCreateAdmission} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admissions</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
                     <CardContent>
             <div className="text-2xl font-bold">{stats.total}</div>
             <p className="text-xs text-muted-foreground">
               Total admissions
             </p>
           </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admissions</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
                     <CardContent>
             <div className="text-2xl font-bold">
               {stats.active}
             </div>
             <p className="text-xs text-muted-foreground">
               Currently admitted patients
             </p>
           </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Admissions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
                     <CardContent>
             <div className="text-2xl font-bold">
               {stats.pending}
             </div>
             <p className="text-xs text-muted-foreground">
               Awaiting bed assignment
             </p>
           </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
                     <CardContent>
             <div className="text-2xl font-bold">
               {stats.emergency}
             </div>
             <p className="text-xs text-muted-foreground">
               Critical priority cases
             </p>
           </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Admission List</CardTitle>
          <CardDescription>
            View and manage all patient admissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, admission number, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {admissionStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {admissionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                     {/* Admissions Table */}
           <div className="rounded-md border">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Admission #</TableHead>
                   <TableHead>Patient</TableHead>
                   <TableHead>Doctor</TableHead>
                   <TableHead>Department</TableHead>
                   <TableHead>Ward/Bed</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Priority</TableHead>
                   <TableHead>Admission Date</TableHead>
                   <TableHead>Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {loading ? (
                   <TableRow>
                     <TableCell colSpan={10} className="text-center py-8">
                       <div className="flex items-center justify-center">
                         <Loader2 className="h-6 w-6 animate-spin mr-2" />
                         Loading admissions...
                       </div>
                     </TableCell>
                   </TableRow>
                 ) : filteredAdmissions.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                       No admissions found
                     </TableCell>
                   </TableRow>
                 ) : (
                   filteredAdmissions.map((admission) => (
                  <TableRow key={admission.id}>
                    <TableCell className="font-medium">
                      {admission.admission_number}
                    </TableCell>
                    <TableCell>{`${admission.patient.first_name} ${admission.patient.last_name}`}</TableCell>
                    <TableCell>{admission.doctor.name}</TableCell>
                    <TableCell>{admission.department.name}</TableCell>
                    <TableCell>
                      {admission.ward?.name || 'N/A'} / {admission.bed?.bed_number || 'N/A'}
                    </TableCell>
                    <TableCell>{getTypeBadge(admission.admission_type)}</TableCell>
                    <TableCell>{getStatusBadge(admission.admission_status)}</TableCell>
                    <TableCell>{getPriorityBadge(admission.priority_level)}</TableCell>
                    <TableCell>
                      {new Date(admission.admission_date).toLocaleDateString()} {admission.admission_time}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAdmission(admission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      </div>
                                         </TableCell>
                   </TableRow>
                 ))
                 )}
               </TableBody>
             </Table>
           </div>
        </CardContent>
      </Card>

      {/* Admission Details Dialog */}
      {selectedAdmission && (
                 <Dialog open={!!selectedAdmission} onOpenChange={() => setSelectedAdmission(null)}>
           <DialogContent className="max-w-4xl">
             <DialogHeader>
               <DialogTitle>Admission Details - {selectedAdmission?.admission_number || 'N/A'}</DialogTitle>
               <DialogDescription>
                 Complete information for this patient admission
               </DialogDescription>
             </DialogHeader>
             {selectedAdmission && <AdmissionDetails admission={selectedAdmission} onStatusUpdate={handleUpdateStatus} />}
           </DialogContent>
         </Dialog>
      )}
    </div>
  );
}

// Create Admission Form Component
function CreateAdmissionForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    departmentId: "",
    wardId: "",
    bedId: "",
    admissionType: "",
    priority: "MEDIUM",
    admissionReason: "",
    chiefComplaint: "",
    presentingSymptoms: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: "",
    estimatedStayDays: "",
    estimatedCost: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientId">Patient</Label>
          <Select value={formData.patientId} onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pat_001">John Doe</SelectItem>
              <SelectItem value="pat_002">Jane Smith</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="doctorId">Admitting Doctor</Label>
          <Select value={formData.doctorId} onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doc_001">Dr. Sarah Wilson</SelectItem>
              <SelectItem value="doc_002">Dr. Michael Brown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="admissionType">Admission Type</Label>
          <Select value={formData.admissionType} onValueChange={(value) => setFormData(prev => ({ ...prev, admissionType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {admissionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">Priority Level</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityLevels.map(priority => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <Select value={formData.departmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dept_001">Cardiology</SelectItem>
              <SelectItem value="dept_002">Orthopedics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="admissionReason">Admission Reason</Label>
        <Textarea
          id="admissionReason"
          value={formData.admissionReason}
          onChange={(e) => setFormData(prev => ({ ...prev, admissionReason: e.target.value }))}
          placeholder="Describe the reason for admission..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="chiefComplaint">Chief Complaint</Label>
        <Textarea
          id="chiefComplaint"
          value={formData.chiefComplaint}
          onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
          placeholder="Patient's main complaint..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          Create Admission
        </Button>
      </div>
    </form>
  );
}

// Admission Details Component
function AdmissionDetails({ admission, onStatusUpdate }: { admission: Admission, onStatusUpdate: (id: string, status: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {`${admission.patient.first_name} ${admission.patient.last_name}`}</p>
            <p><strong>Admission Number:</strong> {admission.admission_number}</p>
            <p><strong>Admitting Doctor:</strong> {admission.doctor.name}</p>
            <p><strong>Department:</strong> {admission.department.name}</p>
            <p><strong>Ward/Bed:</strong> {admission.ward?.name || 'N/A'} / {admission.bed?.bed_number || 'N/A'}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Admission Details</h3>
          <div className="space-y-2">
            <p><strong>Type:</strong> {admission.admission_type}</p>
            <p><strong>Status:</strong> {admission.admission_status}</p>
            <p><strong>Priority:</strong> {admission.priority_level}</p>
            <p><strong>Admission Date:</strong> {new Date(admission.admission_date).toLocaleDateString()} {admission.admission_time}</p>
            <p><strong>Estimated Stay:</strong> {admission.estimated_stay_days || 'N/A'} days</p>
            <p><strong>Estimated Cost:</strong> ${admission.estimated_cost || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onStatusUpdate(admission.id, "ADMITTED")}
            disabled={admission.admission_status === "ADMITTED"}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Admit Patient
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onStatusUpdate(admission.id, "DISCHARGED")}
            disabled={admission.admission_status === "DISCHARGED"}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Discharge
          </Button>
          <Button variant="outline">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer
          </Button>
        </div>
      </div>
    </div>
  );
}
