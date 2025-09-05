"use client";

import { Button } from "@/components/ui/button";
import {
  Plus, Eye, Edit, Trash2, MoreHorizontal, Search, Filter, Download,
  BriefcaseBusiness, BriefcaseMedical, User, Users, Building2,
  Shield, Activity, TrendingUp, AlertTriangle, Calendar, Settings,
  Database, FileText, CreditCard, BarChart3, Users2, Stethoscope,
  Pill, Microscope, Bed, Truck, UserPlus, Package, Sparkles,
  Heart, Zap, Target, ChevronRight
} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SetupChecklist } from "./setup-checklist";

interface DashboardStats {
  availableDoctors: any[];
  last5Records: any[];
  appointmentCounts: any;
  monthlyData: any;
  totalDoctors: number;
  totalPatient: number;
  totalAppointments: number;
}

interface AdminDashboardProps {
  initialStats: DashboardStats;
}

export const AdminDashboard = ({ initialStats }: AdminDashboardProps) => {
  const [stats] = useState<DashboardStats>(initialStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="relative w-12 h-12 mr-4">
                <Image
                  src="/logo.png"
                  alt="Ihosi Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#3E4C4B]">Admin Dashboard</h1>
                <p className="text-sm text-[#5AC5C8] font-medium">Ihosi Healthcare Management</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#3E4C4B]/60">Last updated</div>
              <div className="text-sm font-medium text-[#3E4C4B]">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]/70 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-[#3E4C4B]">{stats.totalPatient || 0}</p>
                  <div className="flex items-center mt-2 text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+12% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]/70 mb-1">Active Doctors</p>
                  <p className="text-3xl font-bold text-[#3E4C4B]">{stats.totalDoctors || 0}</p>
                  <div className="flex items-center mt-2 text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+3 this month</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#2EB6B0] to-[#5AC5C8] rounded-xl">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]/70 mb-1">Appointments</p>
                  <p className="text-3xl font-bold text-[#3E4C4B]">{stats.totalAppointments || 0}</p>
                  <div className="flex items-center mt-2 text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+18% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#5AC5C8] to-[#D1F1F2] rounded-xl">
                  <Calendar className="h-6 w-6 text-[#3E4C4B]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E4C4B]/70 mb-1">System Health</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium text-green-600">All Systems Operational</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hospital Management */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-[#3E4C4B]">
                <div className="p-2 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                Hospital Management
              </CardTitle>
              <CardDescription className="text-[#3E4C4B]/70">
                Manage your healthcare infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/hospital/departments" className="block">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5F7FA] to-[#D1F1F2] rounded-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#046658]/10 rounded-lg group-hover:bg-[#046658]/20 transition-colors">
                      <Building2 className="h-4 w-4 text-[#046658]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E4C4B]">Departments</h4>
                      <p className="text-sm text-[#3E4C4B]/60">Manage hospital departments</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#3E4C4B]/40 group-hover:text-[#046658] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link href="/admin/staff" className="block">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5F7FA] to-[#D1F1F2] rounded-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#2EB6B0]/10 rounded-lg group-hover:bg-[#2EB6B0]/20 transition-colors">
                      <Users className="h-4 w-4 text-[#2EB6B0]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E4C4B]">Staff</h4>
                      <p className="text-sm text-[#3E4C4B]/60">Manage hospital staff</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#3E4C4B]/40 group-hover:text-[#2EB6B0] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link href="/record/doctors" className="block">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5F7FA] to-[#D1F1F2] rounded-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#5AC5C8]/10 rounded-lg group-hover:bg-[#5AC5C8]/20 transition-colors">
                      <Stethoscope className="h-4 w-4 text-[#5AC5C8]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E4C4B]">Doctors</h4>
                      <p className="text-sm text-[#3E4C4B]/60">Manage medical professionals</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#3E4C4B]/40 group-hover:text-[#5AC5C8] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-[#3E4C4B]">
                <div className="p-2 bg-gradient-to-br from-[#2EB6B0] to-[#5AC5C8] rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Quick Access
              </CardTitle>
              <CardDescription className="text-[#3E4C4B]/70">
                Frequently used functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/system-settings" className="block">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5F7FA] to-[#D1F1F2] rounded-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#046658]/10 rounded-lg group-hover:bg-[#046658]/20 transition-colors">
                      <Settings className="h-4 w-4 text-[#046658]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E4C4B]">System Settings</h4>
                      <p className="text-sm text-[#3E4C4B]/60">Configure system preferences</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#3E4C4B]/40 group-hover:text-[#046658] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link href="/record/appointments" className="block">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5F7FA] to-[#D1F1F2] rounded-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#2EB6B0]/10 rounded-lg group-hover:bg-[#2EB6B0]/20 transition-colors">
                      <Calendar className="h-4 w-4 text-[#2EB6B0]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E4C4B]">Appointments</h4>
                      <p className="text-sm text-[#3E4C4B]/60">View and manage appointments</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#3E4C4B]/40 group-hover:text-[#2EB6B0] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link href="/record/billing" className="block">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5F7FA] to-[#D1F1F2] rounded-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#5AC5C8]/10 rounded-lg group-hover:bg-[#5AC5C8]/20 transition-colors">
                      <CreditCard className="h-4 w-4 text-[#5AC5C8]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3E4C4B]">Billing</h4>
                      <p className="text-sm text-[#3E4C4B]/60">Financial management</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#3E4C4B]/40 group-hover:text-[#5AC5C8] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[#3E4C4B]">
              <div className="p-2 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription className="text-[#3E4C4B]/70">
              Latest system activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.last5Records && stats.last5Records.length > 0 ? (
                stats.last5Records.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5F7FA] to-[#D1F1F2] rounded-xl hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-full"></div>
                      <span className="text-sm text-[#3E4C4B] font-medium">{record.action || 'System update'}</span>
                    </div>
                    <span className="text-xs text-[#3E4C4B]/60 bg-white/50 px-3 py-1 rounded-full">{record.timestamp || 'Just now'}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#3E4C4B]/60">
                  <div className="p-3 bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Activity className="h-8 w-8 text-[#046658]/40" />
                  </div>
                  <p className="font-medium mb-1">No recent activity</p>
                  <p className="text-sm">System activities will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
