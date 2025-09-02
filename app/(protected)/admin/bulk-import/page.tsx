import { requirePermission } from "@/lib/permission-guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, FileText, Users, Building2, CheckCircle } from "lucide-react";

export default async function BulkImportPage() {
  // Ensure user has permission to execute bulk imports
  await requirePermission('BULK_IMPORT_EXECUTE', '/unauthorized');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bulk Import System
              </h1>
              <p className="text-xl text-gray-600 mt-2">Import existing hospital records and data</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Start Import
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">15,247</p>
                  <p className="text-xs text-blue-600">Imported this month</p>
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
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">98.7%</p>
                  <p className="text-xs text-green-600">Last import batch</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-xs text-purple-600">Configured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Patient Data Import */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Patient Data Import
              </CardTitle>
              <CardDescription>
                Import existing patient records from CSV, Excel, or database exports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Supported formats:</p>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">CSV</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Excel</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">JSON</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Patient Data
              </Button>
            </CardContent>
          </Card>

          {/* Staff Data Import */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                Staff Data Import
              </CardTitle>
              <CardDescription>
                Import doctor, nurse, and administrative staff information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Supported formats:</p>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">CSV</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Excel</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">JSON</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Staff Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Bulk Import Dashboard</CardTitle>
            <CardDescription>
              Import existing hospital records and configure data mapping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Import System</h3>
              <p className="text-gray-600 mb-4">
                This system will allow you to import existing hospital records from various sources and formats.
              </p>
              <p className="text-sm text-gray-500">
                Coming soon - Full bulk import functionality with data validation and mapping
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
