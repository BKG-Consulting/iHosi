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
  CheckCircle
} from "lucide-react";

// Staff form schema
const StaffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be at most 15 digits"),
  role: z.enum(["NURSE", "LAB_TECHNICIAN", "CASHIER", "ADMIN_ASSISTANT"], { message: "Please select a role" }),
  department: z.string().min(2, "Department must be at least 2 characters"),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"], { message: "Please select a status" }),
  hireDate: z.string().min(1, "Hire date is required"),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters").optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  notes: z.string().optional(),
});

type StaffFormData = z.infer<typeof StaffFormSchema>;

interface StaffFormProps {
  staff?: {
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
  };
  onSubmit: (data: StaffFormData) => void;
  onCancel?: () => void;
}

const departments = [
  "Emergency Medicine",
  "Cardiology",
  "Neurology",
  "Oncology",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Surgery",
  "Laboratory",
  "Radiology",
  "Pharmacy",
  "Finance",
  "Human Resources",
  "Information Technology",
  "Maintenance",
  "Security"
];

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

export const StaffForm = ({ staff, onSubmit, onCancel }: StaffFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StaffFormData>({
    resolver: zodResolver(StaffFormSchema),
    defaultValues: staff ? {
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      status: staff.status,
      hireDate: staff.hireDate,
      licenseNumber: staff.licenseNumber || "",
      specialization: staff.specialization || "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      notes: ""
    } : {
      name: "",
      email: "",
      phone: "",
      role: "NURSE",
      department: "",
      status: "ACTIVE",
      hireDate: new Date().toISOString().split('T')[0],
      licenseNumber: "",
      specialization: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      notes: ""
    }
  });

  const selectedRole = form.watch("role");
  const selectedStatus = form.watch("status");

  const handleSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
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
              <Label htmlFor="hireDate" className="text-sm font-medium text-gray-700">
                Hire Date *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="hireDate"
                  type="date"
                  {...form.register("hireDate")}
                  className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {form.formState.errors.hireDate && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.hireDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Address
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
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                Department *
              </Label>
              <Select value={form.watch("department")} onValueChange={(value) => form.setValue("department", value)}>
                <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.department && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.department.message}
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
              <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">
                License Number
              </Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="licenseNumber"
                  {...form.register("licenseNumber")}
                  className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter license number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-sm font-medium text-gray-700">
                Specialization
              </Label>
              <Input
                id="specialization"
                {...form.register("specialization")}
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter specialization"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Additional Info */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
            <Shield className="w-5 h-5" />
            Status & Additional Information
          </CardTitle>
          <CardDescription>Employment status and additional details</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Employment Status *
              </Label>
              <Select value={selectedStatus} onValueChange={(value) => form.setValue("status", value as any)}>
                <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700">
                Emergency Contact
              </Label>
              <Input
                id="emergencyContact"
                {...form.register("emergencyContact")}
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Emergency contact name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone" className="text-sm font-medium text-gray-700">
              Emergency Phone
            </Label>
            <Input
              id="emergencyPhone"
              {...form.register("emergencyPhone")}
              className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Emergency contact phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information or notes..."
              rows={3}
            />
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
                <span className="text-sm text-gray-900">{form.watch("department") || "Not selected"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                {form.watch("status") && (
                  <Badge className={getStatusColor(form.watch("status"))}>
                    {form.watch("status")?.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="text-sm text-gray-900">{form.watch("email") || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Phone:</span>
                <span className="text-sm text-gray-900">{form.watch("phone") || "Not provided"}</span>
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
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 shadow-lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {staff ? 'Update Staff Member' : 'Add Staff Member'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
