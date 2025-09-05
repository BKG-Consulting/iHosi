"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Shield, 
  GraduationCap, 
  Calendar,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { StaffSchema } from "@/lib/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type StaffFormData = z.infer<typeof StaffSchema>;

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  status: string;
  capacity?: number;
  current_load?: number;
}

interface StaffFormProps {
  staff?: {
    id: string;
    name: string;
    role: 'NURSE' | 'LAB_TECHNICIAN' | 'CASHIER' | 'ADMIN_ASSISTANT';
    email: string;
    phone: string;
    department: string;
    department_id?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
    hireDate: string;
    licenseNumber?: string;
    specialization?: string;
  };
  onSubmit: (data: StaffFormData) => void;
  onCancel?: () => void;
}

const roleDescriptions = {
  NURSE: "Registered nurses providing patient care and support",
  LAB_TECHNICIAN: "Laboratory professionals conducting diagnostic tests",
  CASHIER: "Financial staff handling patient billing and payments",
  ADMIN_ASSISTANT: "Administrative support for hospital operations"
};

const roleIcons = {
  NURSE: Shield,
  LAB_TECHNICIAN: GraduationCap,
  CASHIER: Building2,
  ADMIN_ASSISTANT: User
};

export const StaffFormNew = ({ staff, onSubmit, onCancel }: StaffFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const router = useRouter();

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await fetch('/api/departments');
        const data = await response.json();
        
        if (data.success) {
          setDepartments(data.departments);
        } else {
          console.error('Failed to fetch departments:', data.error);
          toast.error('Failed to load departments');
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const form = useForm<StaffFormData>({
    resolver: zodResolver(StaffSchema),
    defaultValues: staff ? {
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      department_id: staff.department_id || "",
      address: "",
      license_number: staff.licenseNumber || "",
      img: "",
      password: ""
    } : {
      name: "",
      email: "",
      phone: "",
      role: "NURSE",
      department: "",
      department_id: "",
      address: "",
      license_number: "",
      img: "",
      password: ""
    }
  });

  const selectedRole = form.watch("role");
  const selectedDepartmentId = form.watch("department_id");

  // Update department name when department_id changes
  useEffect(() => {
    if (selectedDepartmentId) {
      const selectedDept = departments.find(dept => dept.id === selectedDepartmentId);
      if (selectedDept) {
        form.setValue("department", selectedDept.name);
      }
    }
  }, [selectedDepartmentId, departments, form]);

  const handleSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      console.log("=== STAFF FORM SUBMISSION START ===");
      console.log("Form values:", data);
      
      // Call the API endpoint for staff creation
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          department_id: data.department_id || null,
        }),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success) {
        toast.success("Staff member created successfully!");
        form.reset();
        router.refresh();
        if (onSubmit) {
          onSubmit(data);
        }
      } else {
        console.error("Staff creation failed:", result);
        toast.error(result.message || "Failed to create staff member");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'ON_LEAVE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'NURSE':
        return 'bg-blue-100 text-blue-800';
      case 'LAB_TECHNICIAN':
        return 'bg-green-100 text-green-800';
      case 'CASHIER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN_ASSISTANT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
            <User className="w-5 h-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Personal and contact details</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  {...form.register("name")}
                  className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  {...form.register("phone")}
                  className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password (min 8 characters)"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Address *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="address"
                {...form.register("address")}
                className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
              />
            </div>
            {form.formState.errors.address && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {form.formState.errors.address.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role & Department */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-900">
            <Building2 className="w-5 h-5" />
            Role & Department
          </CardTitle>
          <CardDescription>Professional role and department assignment</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role *
              </Label>
              <Select value={selectedRole} onValueChange={(value) => form.setValue("role", value as any)}>
                <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NURSE">Nurse</SelectItem>
                  <SelectItem value="LAB_TECHNICIAN">Lab Technician</SelectItem>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                  <SelectItem value="ADMIN_ASSISTANT">Admin Assistant</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department_id" className="text-sm font-medium text-gray-700">
                Department *
              </Label>
              <Select 
                value={selectedDepartmentId} 
                onValueChange={(value) => form.setValue("department_id", value)}
                disabled={loadingDepartments}
              >
                <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex flex-col">
                        <span>{dept.name}</span>
                        <span className="text-xs text-gray-500">{dept.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.department_id && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.department_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Role Description */}
          {selectedRole && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                {React.createElement(roleIcons[selectedRole], { className: "w-5 h-5 text-blue-600 mt-0.5" })}
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    {selectedRole.replace('_', ' ')} Role
                  </h4>
                  <p className="text-sm text-gray-600">
                    {roleDescriptions[selectedRole]}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_number" className="text-sm font-medium text-gray-700">
                License Number
              </Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="license_number"
                  {...form.register("license_number")}
                  className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter license number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="img" className="text-sm font-medium text-gray-700">
                Profile Image URL
              </Label>
              <Input
                id="img"
                {...form.register("img")}
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL (optional)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Preview */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Summary Preview</CardTitle>
          <CardDescription>Review the information before submitting</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <span className="text-sm text-gray-900">{form.watch("name") || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Role:</span>
                {form.watch("role") && (
                  <Badge className={getRoleColor(form.watch("role"))}>
                    {form.watch("role")?.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Department:</span>
                <span className="text-sm text-gray-900">
                  {departments.find(d => d.id === form.watch("department_id"))?.name || "Not selected"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="text-sm text-gray-900">{form.watch("email") || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Phone:</span>
                <span className="text-sm text-gray-900">{form.watch("phone") || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">License:</span>
                <span className="text-sm text-gray-900">{form.watch("license_number") || "Not provided"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-6 py-2"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || loadingDepartments}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Staff...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {staff ? 'Update Staff Member' : 'Create Staff Member'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
