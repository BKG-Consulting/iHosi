"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Bed, 
  Clock, 
  AlertTriangle,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface DepartmentAnalytics {
  id: string;
  name: string;
  currentLoad: number;
  capacity: number;
  utilization: number;
  activeAppointments: number;
  emergencyCases: number;
  availableStaff: number;
  totalStaff: number;
  operationalEquipment: number;
  totalEquipment: number;
  todayRevenue: number;
  avgWaitTime: number;
  patientSatisfaction: number;
  bedOccupancy: number;
  lastUpdated: string;
}

interface DepartmentAnalyticsProps {
  departmentId: string;
  departmentName: string;
}

export const DepartmentAnalytics = ({ departmentId, departmentName }: DepartmentAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<DepartmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/departments/${departmentId}/analytics`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
        setLastRefresh(new Date());
      } else {
        console.error('Failed to fetch analytics:', data.error);
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [departmentId]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600";
    if (utilization >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getUtilizationBgColor = (utilization: number) => {
    if (utilization >= 90) return "bg-red-500";
    if (utilization >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Unable to load analytics data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Analytics</h3>
          <p className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Capacity Utilization */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Capacity Utilization</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(analytics.utilization)}`}>
                  {analytics.utilization}%
                </p>
                <p className="text-xs text-gray-500">
                  {analytics.currentLoad} / {analytics.capacity} patients
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress 
              value={analytics.utilization} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Active Appointments */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeAppointments}</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Cases */}
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency Cases</p>
                <p className="text-2xl font-bold text-red-600">{analytics.emergencyCases}</p>
                <p className="text-xs text-gray-500">Requiring immediate attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Availability */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff Availability</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.availableStaff}/{analytics.totalStaff}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((analytics.availableStaff / analytics.totalStaff) * 100)}% available
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Equipment Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Equipment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {analytics.operationalEquipment}/{analytics.totalEquipment}
                </p>
                <p className="text-xs text-gray-500">Operational</p>
              </div>
              <Badge 
                variant={analytics.operationalEquipment === analytics.totalEquipment ? "default" : "secondary"}
                className="ml-2"
              >
                {Math.round((analytics.operationalEquipment / analytics.totalEquipment) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Average Wait Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{analytics.avgWaitTime} min</p>
                <p className="text-xs text-gray-500">Current average</p>
              </div>
              <div className="flex items-center text-xs">
                <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-600">-5 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Satisfaction */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Patient Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{analytics.patientSatisfaction}/5</p>
                <p className="text-xs text-gray-500">Average rating</p>
              </div>
              <div className="flex items-center text-xs">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-600">+0.2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial Performance
          </CardTitle>
          <CardDescription>Today's revenue and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-700">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-900">
                ${analytics.todayRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700">Bed Occupancy</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.bedOccupancy}%</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-700">Revenue per Patient</p>
              <p className="text-2xl font-bold text-purple-900">
                ${Math.round(analytics.todayRevenue / analytics.currentLoad).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
