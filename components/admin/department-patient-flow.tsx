"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Activity,
  Calendar,
  Phone,
  MapPin,
  Stethoscope
} from "lucide-react";

interface PatientFlow {
  id: string;
  patientName: string;
  patientId: string;
  status: 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED' | 'PENDING_DISCHARGE' | 'PENDING_ADMISSION';
  admissionDate: string;
  expectedDischarge?: string;
  currentLocation: string;
  assignedDoctor: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diagnosis: string;
  bedNumber?: string;
  wardName?: string;
  phone: string;
  emergencyContact: string;
}

interface DepartmentPatientFlowProps {
  departmentId: string;
  departmentName: string;
}

export const DepartmentPatientFlow = ({ departmentId, departmentName }: DepartmentPatientFlowProps) => {
  const [patients, setPatients] = useState<PatientFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admitted' | 'pending_discharge' | 'pending_admission'>('all');

  const fetchPatientFlow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/departments/${departmentId}/patient-flow`);
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.patients || []);
      } else {
        console.error('Failed to fetch patient flow:', data.error);
        setPatients([]);
      }
    } catch (error) {
      console.error('Failed to fetch patient flow:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientFlow();
  }, [departmentId]);

  const handleAction = async (action: string, patientId: string, bedId?: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data: { patientId, bedId }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        // Refresh the patient flow data
        fetchPatientFlow();
      } else {
        toast.error(result.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING_DISCHARGE':
        return 'bg-green-100 text-green-800';
      case 'PENDING_ADMISSION':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISCHARGED':
        return 'bg-gray-100 text-gray-800';
      case 'TRANSFERRED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ADMITTED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING_DISCHARGE':
        return <ArrowRight className="w-4 h-4" />;
      case 'PENDING_ADMISSION':
        return <ArrowLeft className="w-4 h-4" />;
      case 'DISCHARGED':
        return <CheckCircle className="w-4 h-4" />;
      case 'TRANSFERRED':
        return <Activity className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredPatients = patients.filter(patient => {
    if (filter === 'all') return true;
    return patient.status === filter.toUpperCase();
  });

  const admittedPatients = patients.filter(p => p.status === 'ADMITTED').length;
  const pendingDischarge = patients.filter(p => p.status === 'PENDING_DISCHARGE').length;
  const pendingAdmission = patients.filter(p => p.status === 'PENDING_ADMISSION').length;
  const criticalPatients = patients.filter(p => p.priority === 'CRITICAL').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading patient flow...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Flow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admitted Patients</p>
                <p className="text-2xl font-bold text-gray-900">{admittedPatients}</p>
                <p className="text-xs text-gray-500">Currently in department</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Discharge</p>
                <p className="text-2xl font-bold text-gray-900">{pendingDischarge}</p>
                <p className="text-xs text-gray-500">Ready for discharge</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Admission</p>
                <p className="text-2xl font-bold text-gray-900">{pendingAdmission}</p>
                <p className="text-xs text-gray-500">Awaiting bed assignment</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ArrowLeft className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Cases</p>
                <p className="text-2xl font-bold text-red-600">{criticalPatients}</p>
                <p className="text-xs text-gray-500">Requiring immediate attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Flow Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Flow Management</CardTitle>
              <CardDescription>Track and manage patient admissions, transfers, and discharges</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({patients.length})
              </Button>
              <Button
                variant={filter === 'admitted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('admitted')}
              >
                Admitted ({admittedPatients})
              </Button>
              <Button
                variant={filter === 'pending_discharge' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending_discharge')}
              >
                Pending Discharge ({pendingDischarge})
              </Button>
              <Button
                variant={filter === 'pending_admission' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending_admission')}
              >
                Pending Admission ({pendingAdmission})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{patient.patientName}</h3>
                        <Badge variant="outline" className="text-xs">
                          ID: {patient.patientId}
                        </Badge>
                        <Badge className={`${getPriorityColor(patient.priority)} text-xs`}>
                          {patient.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <strong>Diagnosis:</strong> {patient.diagnosis}
                          </p>
                          <p className="text-gray-600">
                            <strong>Assigned Doctor:</strong> {patient.assignedDoctor}
                          </p>
                          <p className="text-gray-600">
                            <strong>Location:</strong> {patient.currentLocation}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <strong>Admission Date:</strong> {new Date(patient.admissionDate).toLocaleDateString()}
                          </p>
                          {patient.expectedDischarge && (
                            <p className="text-gray-600">
                              <strong>Expected Discharge:</strong> {new Date(patient.expectedDischarge).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">{patient.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span className="text-xs">{patient.emergencyContact}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getStatusColor(patient.status)}>
                      {getStatusIcon(patient.status)}
                      <span className="ml-1">{patient.status.replace('_', ' ')}</span>
                    </Badge>
                    
                    <div className="flex space-x-2">
                      {patient.status === 'PENDING_DISCHARGE' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleAction('discharge_patient', patient.patientId, patient.bedNumber)}
                        >
                          Process Discharge
                        </Button>
                      )}
                      {patient.status === 'PENDING_ADMISSION' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleAction('assign_bed', patient.patientId)}
                        >
                          Assign Bed
                        </Button>
                      )}
                      {patient.status === 'ADMITTED' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => handleAction('transfer_patient', patient.patientId)}
                        >
                          Transfer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' 
                    ? 'No patients in this department'
                    : `No patients with status: ${filter.replace('_', ' ')}`
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
