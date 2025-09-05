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

  if (departments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 rounded-full flex items-center justify-center mb-4">
          <Building2 className="h-8 w-8 text-[#5AC5C8]" />
        </div>
        <h3 className="mt-2 text-lg font-medium text-[#3E4C4B]">No departments</h3>
        <p className="mt-1 text-sm text-[#3E4C4B]/70">
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
          className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm ${
            selectedDepartment?.id === department.id 
              ? 'border-[#2EB6B0] bg-gradient-to-br from-[#D1F1F2]/50 to-[#2EB6B0]/10 shadow-lg' 
              : 'border-[#D1F1F2] hover:border-[#5AC5C8]'
          }`}
          onClick={() => onDepartmentSelect?.(department)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-[#3E4C4B]">
                  {department.name}
                </h3>
                <Badge className={`${getStatusColor(department.status)} border`}>
                  {getStatusLabel(department.status)}
                </Badge>
                <span className="text-sm text-[#3E4C4B]/70 font-mono bg-[#D1F1F2]/50 px-2 py-1 rounded">
                  {department.code}
                </span>
                {selectedDepartment?.id === department.id && (
                  <Badge className="bg-[#2EB6B0]/10 text-[#2EB6B0] border-[#2EB6B0]">
                    Selected
                  </Badge>
                )}
              </div>
              
              {department.description && (
                <p className="text-[#3E4C4B]/80 text-sm mb-3">
                  {department.description}
                </p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Location */}
            {department.location && (
              <div className="flex items-center space-x-2 text-sm text-[#3E4C4B]/80">
                <MapPin className="w-4 h-4 text-[#5AC5C8]" />
                <span>{department.location}</span>
              </div>
            )}

            {/* Contact */}
            {department.contact_number && (
              <div className="flex items-center space-x-2 text-sm text-[#3E4C4B]/80">
                <Phone className="w-4 h-4 text-[#5AC5C8]" />
                <span>{department.contact_number}</span>
              </div>
            )}

            {/* Email */}
            {department.email && (
              <div className="flex items-center space-x-2 text-sm text-[#3E4C4B]/80">
                <Mail className="w-4 h-4 text-[#5AC5C8]" />
                <span>{department.email}</span>
              </div>
            )}

            {/* Capacity */}
            <div className="flex items-center space-x-2 text-sm text-[#3E4C4B]/80">
              <Building2 className="w-4 h-4 text-[#5AC5C8]" />
              <span>
                {department.current_load} / {department.capacity} capacity
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 rounded-xl border border-[#D1F1F2]">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-[#046658]" />
                <span className="text-sm font-medium text-[#3E4C4B]">Staff</span>
              </div>
              <div className="text-lg font-bold text-[#046658]">
                {department._count.doctors + department._count.staff}
              </div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-[#5AC5C8]/10 to-[#2EB6B0]/10 rounded-xl border border-[#D1F1F2]">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Bed className="w-4 h-4 text-[#2EB6B0]" />
                <span className="text-sm font-medium text-[#3E4C4B]">Wards</span>
              </div>
              <div className="text-lg font-bold text-[#2EB6B0]">
                {department._count.wards}
              </div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-[#2EB6B0]/10 to-[#5AC5C8]/10 rounded-xl border border-[#D1F1F2]">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Truck className="w-4 h-4 text-[#5AC5C8]" />
                <span className="text-sm font-medium text-[#3E4C4B]">Equipment</span>
              </div>
              <div className="text-lg font-bold text-[#5AC5C8]">
                {department._count.equipment}
              </div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-[#046658]/5 to-[#5AC5C8]/10 rounded-xl border border-[#D1F1F2]">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Building2 className="w-4 h-4 text-[#046658]" />
                <span className="text-sm font-medium text-[#3E4C4B]">Utilization</span>
              </div>
              <div className="text-lg font-bold text-[#046658]">
                {Math.round((department.current_load / department.capacity) * 100)}%
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#D1F1F2]">
            <div className="text-sm text-[#3E4C4B]/70">
              Created {new Date(department.created_at).toLocaleDateString()}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/hospital/departments/${department.id}`)}
                className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2] hover:text-[#046658]"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/hospital/departments/${department.id}/edit`)}
                className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2] hover:text-[#046658]"
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
