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
  UserRound,
  Users,
  UsersRound,
  Home,
  FileText,
  CreditCard,
  Activity,
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
          name: "Users",
          href: "/record/users",
          access: ["admin"],
          icon: Users,
          description: "Manage system users",
        },
        {
          name: "Doctors",
          href: "/record/doctors",
          access: ["admin"],
          icon: User,
          description: "Doctor directory",
        },
        {
          name: "Staff",
          href: "/record/staffs",
          access: ["admin", "doctor"],
          icon: UserRound,
          description: "Staff management",
        },
        {
          name: "Patients",
          href: "/record/patients",
          access: ["admin", "doctor", "nurse"],
          icon: UsersRound,
          description: "Patient records",
        },
        {
          name: "Appointments",
          href: "/record/appointments",
          access: ["admin", "doctor", "nurse"],
          icon: ListOrdered,
          description: "Schedule management",
        },
        {
          name: "Medical Records",
          href: "/record/medical-records",
          access: ["admin", "doctor", "nurse"],
          icon: FileText,
          description: "Health documentation",
        },
        {
          name: "Billing Overview",
          href: "/record/billing",
          access: ["admin", "doctor"],
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
          access: ["admin", "doctor", "nurse"],
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
