import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { checkRole } from "@/utils/roles";
import { ReviewForm } from "../dialogs/review-form";
import { 
  Calendar, 
  Activity, 
  Stethoscope, 
  FileText, 
  DollarSign, 
  CreditCard, 
  TestTube,
  BarChart3
} from "lucide-react";

interface TabLink {
  href: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const AppointmentQuickLinks = async ({ staffId }: { staffId: string }) => {
  const isPatient = await checkRole("PATIENT");
  const isDoctor = await checkRole("DOCTOR");
  const isNurse = await checkRole("NURSE");
  
  const isClinicalStaff = isDoctor || isNurse;

  // Define tabs based on role
  const patientTabs: TabLink[] = [
    { 
      href: "?cat=appointments", 
      label: "Appointment Details", 
      color: "violet",
      icon: <Calendar className="h-4 w-4" />
    },
    { 
      href: "?cat=billing", 
      label: "Billing", 
      color: "green",
      icon: <DollarSign className="h-4 w-4" />
    },
    { 
      href: "?cat=payments", 
      label: "Payments", 
      color: "purple",
      icon: <CreditCard className="h-4 w-4" />
    },
  ];

  const clinicalTabs: TabLink[] = [
    { 
      href: "?cat=appointments", 
      label: "Appointment & Vitals", 
      color: "violet",
      icon: <Calendar className="h-4 w-4" />
    },
    { 
      href: "?cat=diagnosis", 
      label: "Diagnosis", 
      color: "blue",
      icon: <Stethoscope className="h-4 w-4" />
    },
    { 
      href: "?cat=medical-history", 
      label: "Medical History", 
      color: "red",
      icon: <FileText className="h-4 w-4" />
    },
    { 
      href: "?cat=charts", 
      label: "Charts", 
      color: "gray",
      icon: <BarChart3 className="h-4 w-4" />
    },
    { 
      href: "?cat=lab-test", 
      label: "Lab Tests", 
      color: "indigo",
      icon: <TestTube className="h-4 w-4" />
    },
    { 
      href: "?cat=billing", 
      label: "Billing", 
      color: "green",
      icon: <DollarSign className="h-4 w-4" />
    },
    { 
      href: "?cat=payments", 
      label: "Payments", 
      color: "purple",
      icon: <CreditCard className="h-4 w-4" />
    },
  ];

  const tabs = isPatient ? patientTabs : clinicalTabs;

  return (
    <Card className="w-full rounded-xl bg-white shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPatient ? (
            <>
              <FileText className="h-5 w-5 text-gray-600" />
              Appointment Information
            </>
          ) : (
            <>
              <Activity className="h-5 w-5 text-blue-600" />
              Clinical Documentation
            </>
          )}
        </CardTitle>
        {isPatient && (
          <p className="text-sm text-gray-600 mt-1">
            View your appointment details and billing information
          </p>
        )}
        {isClinicalStaff && (
          <p className="text-sm text-gray-600 mt-1">
            Document clinical findings and manage patient records
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-${tab.color}-100 text-${tab.color}-600 hover:bg-${tab.color}-200 transition-colors font-medium text-sm`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        ))}

        {isClinicalStaff && <ReviewForm staffId={staffId} />}
      </CardContent>
    </Card>
  );
};

export default AppointmentQuickLinks;
