import { getRole } from "@/utils/roles";
import {
  Bell,
  LayoutDashboard,
  List,
  ListOrdered,
  Logs,
  LucideIcon,
  Pill,
  Receipt,
  Settings,
  SquareActivity,
  User,
  UserPlus,
  UserRound,
  Users,
  UsersRound,
  Home,
  FileText,
  CreditCard,
  Activity,
  Building2,
  Bed,
  Microscope,
  Database,
  Stethoscope,
  Package,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

const ACCESS_LEVELS_ALL = [
  "admin",
  "doctor",
  "nurse",
  "lab technician",
  "patient",
];

const SidebarIcon = ({ icon: Icon, className }: { icon: LucideIcon; className?: string }) => {
  return <Icon className={cn("w-5 h-5", className)} />;
};

export const Sidebar = async () => {
  const role = await getRole();

  const SIDEBAR_LINKS = [
    {
      label: "Main Menu",
      links: [
        {
          name: "Dashboard",
          href: "/",
          access: ACCESS_LEVELS_ALL,
          icon: LayoutDashboard,
          description: "Overview and statistics",
        },
        {
          name: "Profile",
          href: "/patient/self",
          access: ["patient"],
          icon: User,
          description: "Personal information",
        },
      ],
    },
    {
      label: "Management",
      links: [
        {
          name: "Staff",
          href: "/record/staffs",
          access: ["doctor"],
          icon: UserRound,
          description: "Staff management",
        },
        {
          name: "Patients",
          href: "/record/patients",
          access: ["doctor", "nurse"],
          icon: UsersRound,
          description: "Patient records",
        },
        {
          name: "Appointments",
          href: "/record/appointments",
          access: ["doctor", "nurse"],
          icon: ListOrdered,
          description: "Schedule management",
        },
        {
          name: "Medical Records",
          href: "/record/medical-records",
          access: ["doctor", "nurse"],
          icon: FileText,
          description: "Health documentation",
        },
        {
          name: "Billing Overview",
          href: "/record/billing",
          access: ["doctor"],
          icon: Receipt,
          description: "Financial overview",
        },
        {
          name: "Patient Management",
          href: "/nurse/patient-management",
          access: ["nurse"],
          icon: Users,
          description: "Nurse patient care",
        },
        {
          name: "Administer Medications",
          href: "/nurse/administer-medications",
          access: ["doctor", "nurse"],
          icon: Pill,
          description: "Medication management",
        },
        {
          name: "Appointments",
          href: "/record/appointments",
          access: ["patient"],
          icon: ListOrdered,
          description: "Your appointments",
        },
        {
          name: "Medical Records",
          href: "/patient/self",
          access: ["patient"],
          icon: FileText,
          description: "Your health records",
        },
        {
          name: "Prescriptions",
          href: "#",
          access: ["patient"],
          icon: Pill,
          description: "Your medications",
        },
        {
          name: "Billing & Payments",
          href: "/patient/self?cat=payments",
          access: ["patient"],
          icon: CreditCard,
          description: "Financial information",
        },
      ],
    },
    {
      label: "System",
      links: [
        {
          name: "Notifications",
          href: "/notifications",
          access: ACCESS_LEVELS_ALL,
          icon: Bell,
          description: "System alerts",
        },
        {
          name: "Debug Info",
          href: "/debug",
          access: ACCESS_LEVELS_ALL,
          icon: Activity,
          description: "Debug authentication",
        },
        {
          name: "Audit Logs",
          href: "/admin/audit-logs",
          access: ["admin"],
          icon: Logs,
          description: "Security logs",
        },
        {
          name: "System Settings",
          href: "/admin/system-settings",
          access: ["admin"],
          icon: Settings,
          description: "Configuration",
        },
      ],
    },
  ];

  // Add admin-specific links to the existing structure
  if (role.toLowerCase() === "admin") {
    SIDEBAR_LINKS.push({
      label: "Hospital Administration",
      links: [
        {
          name: "Admin Dashboard",
          href: "/admin",
          access: ["admin"],
          icon: LayoutDashboard,
          description: "Hospital administration overview",
        },
        {
          name: "User Management",
          href: "/record/users",
          access: ["admin"],
          icon: Users,
          description: "Manage system users",
        },
        {
          name: "Doctor Management",
          href: "/record/doctors",
          access: ["admin"],
          icon: User,
          description: "Doctor directory",
        },
        {
          name: "Staff Management",
          href: "/admin/staff",
          access: ["admin"],
          icon: UserRound,
          description: "Manage hospital staff",
        },
        {
          name: "Patient Management",
          href: "/record/patients",
          access: ["admin"],
          icon: UsersRound,
          description: "Patient records",
        },
        {
          name: "Appointment Management",
          href: "/record/appointments",
          access: ["admin"],
          icon: ListOrdered,
          description: "Schedule management",
        },
        {
          name: "Medical Records",
          href: "/record/medical-records",
          access: ["admin"],
          icon: FileText,
          description: "Health documentation",
        },
        {
          name: "Department Management",
          href: "/admin/hospital/departments",
          access: ["admin"],
          icon: Building2,
          description: "Manage departments",
        },
        {
          name: "Ward & Bed Management",
          href: "/admin/wards",
          access: ["admin"],
          icon: Bed,
          description: "Manage wards and beds",
        },
        {
          name: "Admission Management",
          href: "/admin/admissions",
          access: ["admin"],
          icon: UserPlus,
          description: "Patient admissions",
        },
        {
          name: "Equipment Management",
          href: "/admin/equipment",
          access: ["admin"],
          icon: Microscope,
          description: "Track medical equipment",
        },
        {
          name: "Services Management",
          href: "/admin/services",
          access: ["admin"],
          icon: Stethoscope,
          description: "Manage medical services & procedures",
        },
        {
          name: "Service Bundles",
          href: "/admin/service-bundles",
          access: ["admin"],
          icon: Package,
          description: "Create service packages & bundles",
        },
        {
          name: "Service Templates",
          href: "/admin/service-templates",
          access: ["admin"],
          icon: FileText,
          description: "Manage service templates & protocols",
        },
        {
          name: "Service Analytics",
          href: "/admin/service-analytics",
          access: ["admin"],
          icon: BarChart3,
          description: "Service utilization & performance insights",
        },
        {
          name: "Billing & Finance",
          href: "/record/billing",
          access: ["admin"],
          icon: Receipt,
          description: "Financial overview",
        },
        {
          name: "Financial Operations",
          href: "/admin/finance",
          access: ["admin"],
          icon: CreditCard,
          description: "Financial management",
        },
        {
          name: "Bulk Import System",
          href: "/admin/bulk-import",
          access: ["admin"],
          icon: Database,
          description: "Import existing records",
        },
      ],
    });
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
            <Activity className="w-6 h-6" />
          </div>
          <Link
            href="/"
            className="hidden lg:block text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            Ihosi
          </Link>
        </div>
        <p className="hidden lg:block text-sm text-gray-500 mt-1 ml-1">
          
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {SIDEBAR_LINKS.map((section) => (
          <div key={section.label} className="space-y-3">
            <h3 className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              {section.label}
            </h3>

            <div className="space-y-1">
              {section.links.map((link) => {
                if (link.access.includes(role.toLowerCase())) {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                        <SidebarIcon 
                          icon={link.icon} 
                          className="text-gray-600 group-hover:text-blue-600" 
                        />
                      </div>
                      
                      <div className="hidden lg:block flex-1 min-w-0">
                        <span className="text-sm font-medium">{link.name}</span>
                        <p className="text-xs text-gray-500 truncate">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <LogoutButton />
      </div>
    </div>
  );
};
