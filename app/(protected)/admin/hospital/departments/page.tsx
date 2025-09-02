import { getDepartments } from "@/app/actions/department";
import { DepartmentForm } from "@/components/forms/department-form";
import { DepartmentList } from "@/components/lists/department-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Users, Bed, Truck } from "lucide-react";
import { useState } from "react";

export default async function DepartmentsPage() {
  const departmentsResponse = await getDepartments();
  const departments = departmentsResponse.success ? departmentsResponse.data : [];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Management</h1>
              <p className="text-gray-600">Manage hospital departments, wards, and resources</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
                <div className="text-sm text-gray-500">Total Departments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.reduce((acc, dept) => acc + (dept._count?.doctors || 0) + (dept._count?.staff || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Wards</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.reduce((acc, dept) => acc + (dept._count?.wards || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.reduce((acc, dept) => acc + (dept._count?.equipment || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Department List */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>
                  View and manage all hospital departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentList departments={departments} />
              </CardContent>
            </Card>
          </div>

          {/* Department Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add New Department</CardTitle>
                <CardDescription>
                  Create a new hospital department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
