"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Bed, 
  Stethoscope, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  Activity,
  MapPin,
  Phone
} from "lucide-react";

interface BedInfo {
  id: string;
  bedNumber: string;
  wardName: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING' | 'RESERVED' | 'OUT_OF_SERVICE';
  patientName?: string;
  admissionDate?: string;
  infectionStatus: 'CLEAN' | 'CONTAMINATED' | 'ISOLATION_REQUIRED' | 'UNDER_CLEANING';
  lastCleaned?: string;
}

interface EquipmentInfo {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED' | 'QUARANTINED';
  location: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  warrantyExpiry?: string;
}

interface StaffInfo {
  id: string;
  name: string;
  role: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'BUSY' | 'ON_BREAK' | 'ON_LEAVE' | 'EMERGENCY_ONLY';
  currentPatient?: string;
  shift: 'DAY' | 'NIGHT' | 'EVENING';
  phone: string;
  location: string;
}

interface DepartmentResourcesProps {
  departmentId: string;
  departmentName: string;
  refreshTrigger?: number; // Add refresh trigger prop
}

export const DepartmentResources = ({ departmentId, departmentName, refreshTrigger }: DepartmentResourcesProps) => {
  const [beds, setBeds] = useState<BedInfo[]>([]);
  const [equipment, setEquipment] = useState<EquipmentInfo[]>([]);
  const [staff, setStaff] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'beds' | 'equipment' | 'staff'>('beds');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/departments/${departmentId}/resources`);
      const data = await response.json();
      
      if (data.success) {
        setBeds(data.resources.beds || []);
        setEquipment(data.resources.equipment || []);
        setStaff(data.resources.staff || []);
      } else {
        console.error('Failed to fetch resources:', data.error);
        setBeds([]);
        setEquipment([]);
        setStaff([]);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setBeds([]);
      setEquipment([]);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [departmentId]);

  // Watch for refresh trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchResources();
    }
  }, [refreshTrigger]);

  const handleEquipmentStatusUpdate = async (equipmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_equipment_status',
          data: { equipmentId, status: newStatus }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        // Refresh the resources data
        fetchResources();
      } else {
        toast.error(result.message || 'Failed to update equipment status');
      }
    } catch (error) {
      console.error('Error updating equipment status:', error);
      toast.error('Failed to update equipment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
      case 'OPERATIONAL':
      case 'CLEAN':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
      case 'BUSY':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
      case 'UNDER_CLEANING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_SERVICE':
      case 'RETIRED':
        return 'bg-red-100 text-red-800';
      case 'ON_BREAK':
        return 'bg-orange-100 text-orange-800';
      case 'ON_LEAVE':
        return 'bg-gray-100 text-gray-800';
      case 'CONTAMINATED':
      case 'ISOLATION_REQUIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
      case 'OPERATIONAL':
        return <CheckCircle className="w-4 h-4" />;
      case 'OCCUPIED':
      case 'BUSY':
        return <Activity className="w-4 h-4" />;
      case 'MAINTENANCE':
      case 'UNDER_CLEANING':
        return <Wrench className="w-4 h-4" />;
      case 'OUT_OF_SERVICE':
      case 'RETIRED':
        return <AlertCircle className="w-4 h-4" />;
      case 'ON_BREAK':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const availableBeds = beds.filter(bed => bed.status === 'AVAILABLE').length;
  const totalBeds = beds.length;
  const operationalEquipment = equipment.filter(eq => eq.status === 'OPERATIONAL').length;
  const totalEquipment = equipment.length;
  const availableStaff = staff.filter(s => s.status === 'AVAILABLE').length;
  const totalStaff = staff.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading resources...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bed Availability</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableBeds}/{totalBeds}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((availableBeds / totalBeds) * 100)}% available
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bed className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress 
              value={(availableBeds / totalBeds) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {operationalEquipment}/{totalEquipment}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((operationalEquipment / totalEquipment) * 100)}% operational
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress 
              value={(operationalEquipment / totalEquipment) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff Availability</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableStaff}/{totalStaff}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((availableStaff / totalStaff) * 100)}% available
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Progress 
              value={(availableStaff / totalStaff) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Resource Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resource Management</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'beds' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('beds')}
              >
                <Bed className="w-4 h-4 mr-2" />
                Beds ({totalBeds})
              </Button>
              <Button
                variant={activeTab === 'equipment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('equipment')}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Equipment ({totalEquipment})
              </Button>
              <Button
                variant={activeTab === 'staff' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('staff')}
              >
                <Users className="w-4 h-4 mr-2" />
                Staff ({totalStaff})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Beds Tab */}
          {activeTab === 'beds' && (
            <div className="space-y-4">
              {beds.map((bed) => (
                <div key={bed.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bed className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Bed {bed.bedNumber}</p>
                      <p className="text-sm text-gray-500">{bed.wardName}</p>
                      {bed.patientName && (
                        <p className="text-sm text-blue-600">Patient: {bed.patientName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(bed.status)}>
                      {getStatusIcon(bed.status)}
                      <span className="ml-1">{bed.status.replace('_', ' ')}</span>
                    </Badge>
                    <Badge className={getStatusColor(bed.infectionStatus)}>
                      {bed.infectionStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              {equipment.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.model} - {item.serialNumber}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status.replace('_', ' ')}</span>
                    </Badge>
                    {item.nextMaintenance && (
                      <Badge variant="outline" className="text-xs">
                        Next: {new Date(item.nextMaintenance).toLocaleDateString()}
                      </Badge>
                    )}
                    {item.status === 'OPERATIONAL' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => handleEquipmentStatusUpdate(item.id, 'MAINTENANCE')}
                      >
                        Mark for Maintenance
                      </Button>
                    )}
                    {item.status === 'MAINTENANCE' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleEquipmentStatusUpdate(item.id, 'OPERATIONAL')}
                      >
                        Mark Operational
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{member.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                      {member.currentPatient && (
                        <p className="text-sm text-blue-600">With: {member.currentPatient}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(member.status)}>
                      {getStatusIcon(member.status)}
                      <span className="ml-1">{member.status.replace('_', ' ')}</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {member.shift} Shift
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
