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
  ChevronRight,
  Sparkles,
  UserButton,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
      label: "Dashboard",
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
    SIDEBAR_LINKS.splice(1, 0, {
      label: "Hospital Management",
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
          name: "Services & Procedures",
          href: "/admin/services",
          access: ["admin"],
          icon: Stethoscope,
          description: "Manage services, bundles, templates & analytics",
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
    <div className="w-full h-full bg-gradient-to-b from-[#F5F7FA] to-[#D1F1F2] border-r border-[#D1F1F2] flex flex-col shadow-lg">
      {/* Header with Logo and User Info */}
      <div className="p-6 border-b border-[#D1F1F2] bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12">
            <Image
              src="/logo.png"
              alt="Ihosi Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex-1">
            <Link
              href="/"
              className="text-xl font-bold text-[#3E4C4B] hover:text-[#046658] transition-colors"
            >
              Ihosi
            </Link>
            <p className="text-xs text-[#5AC5C8] font-medium">
              Healthcare Management
            </p>
          </div>
        </div>
        
        {/* User Info Section */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#046658]/5 to-[#2EB6B0]/5 rounded-xl border border-[#D1F1F2]">
          <div className="w-8 h-8 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#3E4C4B] capitalize">{role}</p>
            <p className="text-xs text-[#5AC5C8]">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {SIDEBAR_LINKS.map((section) => (
          <div key={section.label} className="space-y-3">
            <h3 className="hidden lg:block text-xs font-semibold text-[#3E4C4B]/60 uppercase tracking-wider px-3 mb-4">
              {section.label}
            </h3>

            <div className="space-y-2">
              {section.links.map((link) => {
                if (link.access.includes(role.toLowerCase())) {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="group flex items-center gap-3 px-3 py-3 rounded-xl text-[#3E4C4B] hover:bg-gradient-to-r hover:from-[#046658]/10 hover:to-[#2EB6B0]/10 hover:text-[#046658] transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                    >
                      <div className="p-2 rounded-lg bg-white/70 group-hover:bg-gradient-to-br group-hover:from-[#046658] group-hover:to-[#2EB6B0] transition-all duration-300 shadow-sm group-hover:shadow-lg">
                        <SidebarIcon 
                          icon={link.icon} 
                          className="text-[#3E4C4B] group-hover:text-white transition-colors duration-300" 
                        />
                      </div>
                      
                      <div className="hidden lg:block flex-1 min-w-0">
                        <span className="text-sm font-semibold group-hover:font-bold transition-all duration-300">{link.name}</span>
                        <p className="text-xs text-[#3E4C4B]/70 group-hover:text-[#046658]/80 truncate transition-colors duration-300">
                          {link.description}
                        </p>
                      </div>
                      
                      <ChevronRight className="hidden lg:block h-4 w-4 text-[#3E4C4B]/40 group-hover:text-[#046658] group-hover:translate-x-1 transition-all duration-300" />
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
      <div className="p-4 border-t border-[#D1F1F2] bg-white/30 backdrop-blur-sm space-y-3">
        <Link
          href="/notifications"
          className="group flex items-center gap-3 px-3 py-3 rounded-xl text-[#3E4C4B] hover:bg-gradient-to-r hover:from-[#046658]/10 hover:to-[#2EB6B0]/10 hover:text-[#046658] transition-all duration-300 hover:shadow-md"
        >
          <div className="p-2 rounded-lg bg-white/70 group-hover:bg-gradient-to-br group-hover:from-[#046658] group-hover:to-[#2EB6B0] transition-all duration-300 shadow-sm group-hover:shadow-lg">
            <SidebarIcon 
              icon={Bell} 
              className="text-[#3E4C4B] group-hover:text-white transition-colors duration-300" 
            />
          </div>
          
          <div className="hidden lg:block flex-1 min-w-0">
            <span className="text-sm font-semibold group-hover:font-bold transition-all duration-300">Notifications</span>
            <p className="text-xs text-[#3E4C4B]/70 group-hover:text-[#046658]/80 truncate transition-colors duration-300">
              System alerts
            </p>
          </div>
          
          <ChevronRight className="hidden lg:block h-4 w-4 text-[#3E4C4B]/40 group-hover:text-[#046658] group-hover:translate-x-1 transition-all duration-300" />
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
};
