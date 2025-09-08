import { NewPatient } from "@/components/new-patient";
import { getPatientById } from "@/utils/services/patient";
import { getCurrentUserId } from "@/lib/auth-helpers";
import React from "react";

const Registration = async () => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access patient registration.</p>
        </div>
      </div>
    );
  }

  const { data } = await getPatientById(userId);

  return (
    <div className="w-full h-full flex justify-center bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA]">
      <div className="max-w-6xl w-full relative pb-10">
        <NewPatient data={data!} type={!data ? "create" : "update"} />
      </div>
    </div>
  );
};

export default Registration;
