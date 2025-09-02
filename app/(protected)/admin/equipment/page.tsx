import { requirePermission } from "@/lib/permission-guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Microscope, Wrench, AlertTriangle, CheckCircle } from "lucide-react";

export default async function EquipmentPage() {
  // Ensure user has permission to manage equipment
  await requirePermission('EQUIPMENT_READ', '/unauthorized');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Equipment Management
              </h1>
              <p className="text-xl text-gray-600 mt-2">Track medical equipment and maintenance schedules</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Equipment
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Microscope className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Operational</p>
                  <p className="text-2xl font-bold text-gray-900">142</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Wrench className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Service</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Equipment Inventory</CardTitle>
            <CardDescription>
              Manage medical equipment, track maintenance schedules, and monitor equipment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Microscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Management System</h3>
              <p className="text-gray-600 mb-4">
                This system will allow you to track medical equipment, schedule maintenance, and monitor equipment status.
              </p>
              <p className="text-sm text-gray-500">
                Coming soon - Full equipment management functionality
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
