import React from "react";
import { ImprovedBookAppointment } from "./forms/improved-book-appointment";
import { getPatientById } from "@/utils/services/patient";
import { getDoctors } from "@/utils/services/doctor";

export const AppointmentContainer = async ({ id }: { id: string }) => {
  const { data } = await getPatientById(id);
  // Get all doctors initially - filtering will happen in the improved form based on date/time selection
  const { data: doctors } = await getDoctors(true);

  return (
    <div>
      <ImprovedBookAppointment data={data!} doctors={doctors!} />
    </div>
  );
};
