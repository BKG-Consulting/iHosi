import { NewPatient } from "@/components/new-patient";
import { getPatientById } from "@/utils/services/patient";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const Registration = async () => {
  const { userId } = await auth();

  const { data } = await getPatientById(userId!);

  return (
    <div className="w-full h-full flex justify-center bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA]">
      <div className="max-w-6xl w-full relative pb-10">
        <NewPatient data={data!} type={!data ? "create" : "update"} />
      </div>
    </div>
  );
};

export default Registration;
