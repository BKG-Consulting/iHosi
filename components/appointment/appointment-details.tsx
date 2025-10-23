import { format } from "date-fns";
import { SmallCard } from "../small-card";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ConsultationControls } from "./consultation-controls";
import { checkRole } from "@/utils/roles";
import { AppointmentStatusIndicator } from "../appointment-status-indicator";

interface AppointmentDetailsProps {
  id: number | string;
  patient_id: string;
  appointment_date: Date;
  time: string;
  notes?: string;
  status?: string;
  doctor_id?: string;
}
export const AppointmentDetails = async ({
  id,
  patient_id,
  appointment_date,
  time,
  notes,
  status,
  doctor_id,
}: AppointmentDetailsProps) => {
  // Check user role
  const isPatient = await checkRole("PATIENT");
  const isDoctor = await checkRole("DOCTOR");
  const isNurse = await checkRole("NURSE");

  return (
    <div className="space-y-4">
      <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white">Appointment Information</CardTitle>
            {status && <AppointmentStatusIndicator status={status as any} />}
          </div>
        </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Appointment #</p>
            <p className="text-lg font-bold text-[#046658]">#{id}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Date</p>
            <p className="text-lg font-bold text-[#046658]">{format(appointment_date, "MMM d, yyyy")}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Time</p>
            <p className="text-lg font-bold text-[#046658]">{time}</p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
          <p className="text-sm font-semibold text-[#3E4C4B] mb-2">Additional Notes</p>
          <p className="text-base text-[#046658]">{notes || "No additional notes provided"}</p>
        </div>
      </CardContent>
    </Card>

    {/* Consultation Status Controls */}
    {status && doctor_id && (
      <ConsultationControls
        appointmentId={Number(id)}
        doctorId={doctor_id}
        status={status}
        isPatient={isPatient}
        isDoctor={isDoctor}
        isNurse={isNurse}
      />
    )}
  </div>
  );
};
