"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  Activity,
  Clock,
  Shield,
  Wrench,
  Microscope,
  RefreshCw
} from "lucide-react";

interface EquipmentAnalytics {
  totalEquipment: number;
  operationalRate: number;
  maintenanceDue: number;
  warrantyExpiring: number;
  averageAge: number;
  totalValue: number;
  maintenanceCost: number;
  utilizationRate: number;
  criticalAlerts: number;
  upcomingMaintenance: Array<{
    id: string;
    name: string;
    nextMaintenance: string;
    daysUntil: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  warrantyExpiringItems: Array<{
    id: string;
    name: string;
    warrantyExpiry: string;
    daysUntil: number;
  }>;
  equipmentByType: Array<{
    type: string;
    count: number;
    operational: number;
    percentage: number;
  }>;
  maintenanceHistory: Array<{
    month: string;
    count: number;
    cost: number;
  }>;
}

export default function EquipmentAnalytics() {
  const [analytics, setAnalytics] = useState<EquipmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real implementation, this would come from API
      const mockAnalytics: EquipmentAnalytics = {
        totalEquipment: 156,
        operationalRate: 91.0,
        maintenanceDue: 12,
        warrantyExpiring: 8,
        averageAge: 4.2,
        totalValue: 2500000,
        maintenanceCost: 125000,
        utilizationRate: 78.5,
        criticalAlerts: 3,
        upcomingMaintenance: [
          { id: '1', name: 'MRI Scanner - Room 101', nextMaintenance: '2024-01-15', daysUntil: 5, priority: 'HIGH' },
          { id: '2', name: 'Ventilator - ICU-3', nextMaintenance: '2024-01-18', daysUntil: 8, priority: 'HIGH' },
          { id: '3', name: 'X-Ray Machine - Radiology', nextMaintenance: '2024-01-22', daysUntil: 12, priority: 'MEDIUM' },
          { id: '4', name: 'Patient Monitor - Ward A', nextMaintenance: '2024-01-25', daysUntil: 15, priority: 'LOW' }
        ],
        warrantyExpiringItems: [
          { id: '1', name: 'CT Scanner - Room 102', warrantyExpiry: '2024-02-01', daysUntil: 17 },
          { id: '2', name: 'Ultrasound Machine - OB/GYN', warrantyExpiry: '2024-02-15', daysUntil: 31 },
          { id: '3', name: 'Dialysis Machine - Nephrology', warrantyExpiry: '2024-03-01', daysUntil: 45 }
        ],
        equipmentByType: [
          { type: 'DIAGNOSTIC', count: 45, operational: 42, percentage: 93.3 },
          { type: 'MONITORING', count: 38, operational: 35, percentage: 92.1 },
          { type: 'SURGICAL', count: 28, operational: 26, percentage: 92.9 },
          { type: 'IMAGING', count: 22, operational: 20, percentage: 90.9 },
          { type: 'LABORATORY', count: 18, operational: 17, percentage: 94.4 },
          { type: 'THERAPEUTIC', count: 15, operational: 14, percentage: 93.3 }
        ],
        maintenanceHistory: [
          { month: 'Jan 2024', count: 8, cost: 15000 },
          { month: 'Dec 2023', count: 12, cost: 22000 },
          { month: 'Nov 2023', count: 6, cost: 12000 },
          { month: 'Oct 2023', count: 10, cost: 18000 },
          { month: 'Sep 2023', count: 7, cost: 14000 },
          { month: 'Aug 2023', count: 9, cost: 16000 }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      HIGH: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      MEDIUM: { color: "bg-orange-100 text-orange-800", icon: Clock },
      LOW: { color: "bg-green-100 text-green-800", icon: Activity }
    };

    const { color, icon: Icon } = config[priority as keyof typeof config] || config.LOW;

    return (
      <Badge className={`${color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {priority}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Analytics</h2>
          <p className="text-gray-600">Real-time insights into equipment performance and maintenance</p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Microscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Operational Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.operationalRate}%</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2.1% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Wrench className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance Due</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.maintenanceDue}</p>
                <div className="flex items-center text-sm text-orange-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {analytics.criticalAlerts} critical
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.utilizationRate}%</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5.2% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${(analytics.totalValue / 1000000).toFixed(1)}M</p>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 mr-1" />
                  {analytics.warrantyExpiring} warranties expiring
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="warranty">Warranty</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming Maintenance
                </CardTitle>
                <CardDescription>
                  Equipment requiring maintenance in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.upcomingMaintenance.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(item.nextMaintenance).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getPriorityBadge(item.priority)}
                        <p className="text-sm text-gray-600 mt-1">
                          {item.daysUntil} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Equipment by Type
                </CardTitle>
                <CardDescription>
                  Distribution and operational status by equipment type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.equipmentByType.map((type) => (
                    <div key={type.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.type}</span>
                        <span className="text-sm text-gray-600">
                          {type.operational}/{type.count} operational
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {type.percentage}% operational rate
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Warranty Expiring Soon
              </CardTitle>
              <CardDescription>
                Equipment with warranties expiring in the next 60 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.warrantyExpiringItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(item.warrantyExpiry).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-orange-100 text-orange-800 border-0">
                        {item.daysUntil} days
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for equipment management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Equipment Age</span>
                    <span className="font-bold">{analytics.averageAge} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Critical Alerts</span>
                    <Badge className="bg-red-100 text-red-800 border-0">
                      {analytics.criticalAlerts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Equipment</span>
                    <span className="font-bold">{analytics.totalEquipment}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
                <CardDescription>
                  Maintenance activities over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.maintenanceHistory.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm">{month.month}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{month.count} maintenance</p>
                        <p className="text-xs text-gray-600">${month.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>
                Equipment-related costs and financial insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${(analytics.totalValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-600">Total Equipment Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    ${(analytics.maintenanceCost / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-gray-600">Annual Maintenance Cost</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {((analytics.maintenanceCost / analytics.totalValue) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Maintenance Cost Ratio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
