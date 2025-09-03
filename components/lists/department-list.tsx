"use client";

import { deleteDepartment } from "@/app/actions/department";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Bed, 
  Truck, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface DepartmentListProps {
  departments: Department[];
  onDepartmentSelect?: (department: Department) => void;
  selectedDepartment?: Department | null;
}

export const DepartmentList = ({ departments, onDepartmentSelect, selectedDepartment }: DepartmentListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteDepartment(id);
      
      if (result.success) {
        toast.success(result.msg);
        router.refresh();
      } else {
        toast.error(result.msg || "Failed to delete department");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the department");
    } finally {
      setDeletingId(null);
    }
  };

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

  if (departments.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No departments</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first department.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {departments.map((department) => (
        <div
          key={department.id}
          className={`border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
            selectedDepartment?.id === department.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200'
          }`}
          onClick={() => onDepartmentSelect?.(department)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {department.name}
                </h3>
                <Badge className={getStatusColor(department.status)}>
                  {getStatusLabel(department.status)}
                </Badge>
                <span className="text-sm text-gray-500 font-mono">
                  {department.code}
                </span>
                {selectedDepartment?.id === department.id && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Selected
                  </Badge>
                )}
              </div>
              
              {department.description && (
                <p className="text-gray-600 text-sm mb-3">
                  {department.description}
                </p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Location */}
            {department.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{department.location}</span>
              </div>
            )}

            {/* Contact */}
            {department.contact_number && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{department.contact_number}</span>
              </div>
            )}

            {/* Email */}
            {department.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{department.email}</span>
              </div>
            )}

            {/* Capacity */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>
                {department.current_load} / {department.capacity} capacity
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Staff</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {department._count.doctors + department._count.staff}
              </div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Bed className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Wards</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {department._count.wards}
              </div>
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Truck className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Equipment</span>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {department._count.equipment}
              </div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Building2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Utilization</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {Math.round((department.current_load / department.capacity) * 100)}%
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Created {new Date(department.created_at).toLocaleDateString()}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/hospital/departments/${department.id}`)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/hospital/departments/${department.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(department.id)}
                disabled={deletingId === department.id}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {deletingId === department.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
