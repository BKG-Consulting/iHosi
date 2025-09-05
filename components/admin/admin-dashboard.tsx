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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="relative w-16 h-16 mr-4">
              <Image
                src="/logo.png"
                alt="Ihosi Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#3E4C4B] mb-2">
                Hospital Administration Dashboard
              </h1>
              <p className="text-sm text-[#5AC5C8] font-medium">
                Ihosi Healthcare Management System
              </p>
            </div>
          </div>
          <p className="text-lg text-[#3E4C4B]/80 max-w-3xl">
            Manage your healthcare institution's infrastructure, staff, and operations with intelligent technology. 
            Follow the setup workflow below to properly configure your system.
          </p>
        </div>

        {/* Setup Workflow Guide */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#046658]/5 to-[#2EB6B0]/5 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-[#3E4C4B]">
              <div className="p-2 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              Hospital Setup Workflow
            </CardTitle>
            <CardDescription className="text-[#3E4C4B]/70">
              Follow this order to properly configure your Ihosi Healthcare Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-gradient-to-br from-[#046658]/5 to-[#2EB6B0]/5 rounded-xl border border-[#D1F1F2]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <h4 className="font-semibold text-[#3E4C4B] text-lg">Infrastructure Setup</h4>
                </div>
                <ul className="text-sm text-[#3E4C4B]/80 space-y-2 ml-13">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#046658] rounded-full" />
                    <span>Create Departments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#046658] rounded-full" />
                    <span>Set up Wards</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#046658] rounded-full" />
                    <span>Configure Beds</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#046658] rounded-full" />
                    <span>Define Equipment</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 p-6 bg-gradient-to-br from-[#2EB6B0]/5 to-[#5AC5C8]/5 rounded-xl border border-[#D1F1F2]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2EB6B0] to-[#5AC5C8] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <h4 className="font-semibold text-[#3E4C4B] text-lg">Staff & Professionals</h4>
                </div>
                <ul className="text-sm text-[#3E4C4B]/80 space-y-2 ml-13">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#2EB6B0] rounded-full" />
                    <span>Register Staff Members</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#2EB6B0] rounded-full" />
                    <span>Create Doctor Accounts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#2EB6B0] rounded-full" />
                    <span>Assign to Departments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#2EB6B0] rounded-full" />
                    <span>Set Department Heads</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 p-6 bg-gradient-to-br from-[#5AC5C8]/5 to-[#D1F1F2] rounded-xl border border-[#D1F1F2]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5AC5C8] to-[#D1F1F2] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-[#3E4C4B]">3</span>
                  </div>
                  <h4 className="font-semibold text-[#3E4C4B] text-lg">Operations</h4>
                </div>
                <ul className="text-sm text-[#3E4C4B]/80 space-y-2 ml-13">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#5AC5C8] rounded-full" />
                    <span>Patient Registration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#5AC5C8] rounded-full" />
                    <span>Appointment Scheduling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#5AC5C8] rounded-full" />
                    <span>Medical Records</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#5AC5C8] rounded-full" />
                    <span>Billing & Payments</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/hospital/departments">
            <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E4C4B] group-hover:text-[#046658] transition-colors">Departments</h3>
                      <p className="text-sm text-[#3E4C4B]/70">Manage hospital departments</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#3E4C4B]/40 group-hover:text-[#046658] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/staff">
            <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-[#2EB6B0] to-[#5AC5C8] rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E4C4B] group-hover:text-[#2EB6B0] transition-colors">Staff</h3>
                      <p className="text-sm text-[#3E4C4B]/70">Manage hospital staff</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#3E4C4B]/40 group-hover:text-[#2EB6B0] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/record/doctors">
            <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-[#5AC5C8] to-[#D1F1F2] rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Stethoscope className="h-6 w-6 text-[#3E4C4B]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E4C4B] group-hover:text-[#5AC5C8] transition-colors">Doctors</h3>
                      <p className="text-sm text-[#3E4C4B]/70">Manage medical professionals</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#3E4C4B]/40 group-hover:text-[#5AC5C8] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/wards">
            <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-[#046658]/20 to-[#2EB6B0]/20 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 border border-[#D1F1F2]">
                      <Bed className="h-6 w-6 text-[#046658]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E4C4B] group-hover:text-[#046658] transition-colors">Wards & Beds</h3>
                      <p className="text-sm text-[#3E4C4B]/70">Manage patient accommodations</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#3E4C4B]/40 group-hover:text-[#046658] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Second Row - Additional Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/services">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Stethoscope className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Services</h3>
                    <p className="text-sm text-gray-600">Manage medical services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/service-bundles">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Package className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Service Bundles</h3>
                    <p className="text-sm text-gray-600">Create service packages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/service-analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Service Analytics</h3>
                    <p className="text-sm text-gray-600">Performance insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/equipment">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Microscope className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Equipment</h3>
                    <p className="text-sm text-gray-600">Track medical equipment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/admissions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <UserPlus className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Admissions</h3>
                    <p className="text-sm text-gray-600">Manage patient admissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/record/billing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Billing</h3>
                    <p className="text-sm text-gray-600">Financial management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3E4C4B]/70">Total Patients</p>
                    <p className="text-3xl font-bold text-[#3E4C4B]">{stats.totalPatient}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+12%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-[#2EB6B0] to-[#5AC5C8] rounded-xl shadow-lg">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3E4C4B]/70">Total Doctors</p>
                    <p className="text-3xl font-bold text-[#3E4C4B]">{stats.totalDoctors}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+8%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-[#5AC5C8] to-[#D1F1F2] rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-[#3E4C4B]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3E4C4B]/70">Total Appointments</p>
                    <p className="text-3xl font-bold text-[#3E4C4B]">{stats.totalAppointments}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+15%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-[#046658]/20 to-[#2EB6B0]/20 rounded-xl shadow-lg border border-[#D1F1F2]">
                    <Activity className="h-6 w-6 text-[#046658]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3E4C4B]/70">System Status</p>
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Operational</span>
                      </div>
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#3E4C4B]/50">99.9% uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Checklist and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Setup Checklist */}
          <SetupChecklist />

          {/* Recent Activity */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#046658]/5 to-[#2EB6B0]/5 rounded-t-xl">
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
            <CardContent className="p-6">
              <div className="space-y-4">
                {stats.last5Records && stats.last5Records.length > 0 ? (
                  stats.last5Records.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5F7FA] to-[#D1F1F2] rounded-xl border border-[#D1F1F2] hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-full shadow-sm"></div>
                        <span className="text-sm text-[#3E4C4B] font-medium">{record.action || 'System update'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#3E4C4B]/60 bg-white/50 px-2 py-1 rounded-full">{record.timestamp || 'Just now'}</span>
                        <div className="w-2 h-2 bg-[#5AC5C8] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-[#3E4C4B]/60">
                    <div className="p-4 bg-gradient-to-br from-[#046658]/10 to-[#2EB6B0]/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Activity className="h-10 w-10 text-[#046658]/40" />
                    </div>
                    <p className="text-lg font-medium mb-2">No recent activity</p>
                    <p className="text-sm">System activities will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
