import { requirePermission } from "@/lib/permission-guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, DollarSign, BarChart3, FileText } from "lucide-react";

export default async function FinancePage() {
  // Ensure user has permission to view financial reports
  await requirePermission('FINANCIAL_REPORT_VIEW', '/unauthorized');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Financial Operations
              </h1>
              <p className="text-xl text-gray-600 mt-2">Billing, payments, and financial reports</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <CreditCard className="w-4 h-4 mr-2" />
                New Transaction
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$2.4M</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">$187K</p>
                  <p className="text-xs text-blue-600">45 outstanding bills</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-bold text-gray-900">+8.5%</p>
                  <p className="text-xs text-purple-600">vs. previous month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bills</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-xs text-orange-600">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Financial Dashboard</CardTitle>
            <CardDescription>
              Monitor revenue, track payments, and generate financial reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Operations System</h3>
              <p className="text-gray-600 mb-4">
                This system will provide comprehensive financial management including billing, payments, and reporting.
              </p>
              <p className="text-sm text-gray-500">
                Coming soon - Full financial operations functionality
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
