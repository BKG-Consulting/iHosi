"use client";

import { createDepartment } from "@/app/actions/department";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomInput } from "@/components/custom-input";
import { DepartmentSchema } from "@/lib/schema";
import { Building2, Save, Plus, User, CheckCircle, ArrowRight, Info, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "@/components/ui/form";

type DepartmentFormData = z.infer<typeof DepartmentSchema>;

export const DepartmentForm = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; specialization: string }>>([]);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdDepartment, setCreatedDepartment] = useState<any>(null);
  const router = useRouter();

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      location: "",
      contact_number: "",
      email: "",
      head_doctor_id: "none",
      status: "ACTIVE",
      capacity: 100,
      current_load: 0,
    },
  });

  // Fetch available doctors for department head selection
  const fetchDoctors = async () => {
    setFetchingDoctors(true);
    try {
      const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDoctors(data.doctors || []);
        } else {
          console.error('API returned error:', data.error);
          toast.error('Failed to load doctors list');
        }
      } else {
        console.error('HTTP error:', response.status);
        toast.error('Failed to load doctors list');
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Failed to load doctors list');
    } finally {
      setFetchingDoctors(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const onSubmit = async (data: DepartmentFormData) => {
    setLoading(true);
    try {
      // Convert "none" to empty string for the API
      const submissionData = {
        ...data,
        head_doctor_id: data.head_doctor_id === "none" ? "" : data.head_doctor_id
      };
      
      const result = await createDepartment(submissionData);
      
              if (result.success) {
          setCreatedDepartment(result.data);
          setShowSuccess(true);
          toast.success(`Department "${data.name}" created successfully!`);
          form.reset();
          // Trigger a page refresh to update the department list
          router.refresh();
        } else {
        toast.error(result.msg || "Failed to create department");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while creating the department");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (step: string) => {
    setShowSuccess(false);
    switch (step) {
      case 'wards':
        router.push('/admin/wards');
        break;
      case 'staff':
        router.push('/admin/staff');
        break;
      case 'doctors':
        router.push('/record/doctors');
        break;
      case 'departments':
        router.push('/admin/hospital/departments');
        break;
    }
  };

  if (showSuccess && createdDepartment) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Department Created Successfully!
            </h2>
            <p className="text-green-700 mb-6">
              <strong>{createdDepartment.name}</strong> has been added to your hospital system.
            </p>
            
            {/* Department Summary */}
            <div className="bg-white rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Department Details:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Code:</span>
                  <span className="ml-2 text-gray-900">{createdDepartment.code}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="ml-2 text-gray-900">{createdDepartment.status}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Capacity:</span>
                  <span className="ml-2 text-gray-900">{createdDepartment.capacity}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Location:</span>
                  <span className="ml-2 text-gray-900">{createdDepartment.location || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Next Steps Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Next Steps - Complete Your Hospital Setup
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">1. Create Wards for this Department</span>
                  <Button 
                    size="sm" 
                    onClick={() => handleNextStep('wards')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Wards <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">2. Add Staff Members</span>
                  <Button 
                    size="sm" 
                    onClick={() => handleNextStep('staff')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Staff <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">3. Register Doctors</span>
                  <Button 
                    size="sm" 
                    onClick={() => handleNextStep('doctors')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Doctors <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

                                    {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            onClick={() => setShowSuccess(false)}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            Create Another Department
                          </Button>
                          <Button 
                            onClick={() => router.push(`/admin/hospital/departments/${createdDepartment.id}`)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Department
                          </Button>
                          <Button 
                            onClick={() => handleNextStep('departments')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            View All Departments
                          </Button>
                        </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Workflow Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Department Setup Workflow</h4>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Step 1:</strong> Create the department structure. 
                <strong>Step 2:</strong> Add wards and beds. 
                <strong>Step 3:</strong> Register staff and doctors. 
                <strong>Step 4:</strong> Assign department heads.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Building2 className="w-4 h-4" />
            <span>Basic Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              type="input"
              control={form.control}
              name="name"
              label="Department Name"
              placeholder="Cardiology"
            />
            <CustomInput
              type="input"
              control={form.control}
              name="code"
              label="Department Code"
              placeholder="CARD"
            />
          </div>

          <CustomInput
            type="textarea"
            control={form.control}
            name="description"
            label="Description"
            placeholder="Department description and overview..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              type="input"
              control={form.control}
              name="location"
              label="Location"
              placeholder="Building A, Floor 2, Wing North"
            />
            <CustomInput
              type="input"
              control={form.control}
              name="contact_number"
              label="Contact Number"
              placeholder="+1-555-0123"
            />
          </div>

          <CustomInput
            type="input"
            control={form.control}
            name="email"
            label="Email Address"
            placeholder="cardiology@hospital.com"
            inputType="email"
          />
        </div>

        {/* Capacity & Status */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Building2 className="w-4 h-4" />
            <span>Capacity & Status</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              type="select"
              control={form.control}
              name="status"
              label="Status"
              selectList={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "MAINTENANCE", label: "Maintenance" },
                { value: "CLOSED", label: "Closed" },
              ]}
            />
            <CustomInput
              type="input"
              control={form.control}
              name="capacity"
              label="Maximum Capacity"
              placeholder="100"
              inputType="text"
            />
          </div>
        </div>

        {/* Department Head Assignment */}
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Department Head Assignment</h4>
                <p className="text-sm text-amber-700 mt-1">
                  <strong>Optional:</strong> You can assign a department head now if a doctor already exists, 
                  or leave this empty and assign it later from the staff management section.
                </p>
              </div>
            </div>
          </div>

          <CustomInput
            type="select"
            control={form.control}
            name="head_doctor_id"
            label="Department Head (Optional)"
            placeholder="Select department head"
            selectList={[
              { value: "none", label: "No head doctor assigned yet" },
              ...doctors.map(doctor => ({
                value: doctor.id,
                label: `${doctor.name} - ${doctor.specialization}`
              }))
            ]}
          />
          
          {fetchingDoctors && (
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Loading doctors...</span>
            </div>
          )}
          
          {!fetchingDoctors && doctors.length === 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p>No doctors available. Please register doctors first before assigning department heads.</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating Department...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </div>
          )}
        </Button>

        {/* Form Status */}
        {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field}:</strong> {error?.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </Form>
  );
};
