import { Metadata } from "next";
import AdmissionManagement from "@/components/admin/admission-management";

export const metadata: Metadata = {
  title: "Admission Management | Healthcare System",
  description: "Manage patient admissions, bed assignments, and discharge planning",
};

export default function AdmissionsPage() {
  return <AdmissionManagement />;
}

