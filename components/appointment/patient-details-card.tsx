import { Patient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { calculateAge } from "@/utils";
import { Calendar, Home, Info, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

export const PatientDetailsCard = ({ data }: { data: Patient }) => {
  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-6">
        <CardTitle className="text-xl font-bold text-white">Patient Details</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative size-20 xl:size-24 rounded-full overflow-hidden ring-4 ring-white/30">
            <Image
              src={data.img || "/user.jpg"}
              alt={data?.first_name}
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              {data?.first_name} {data?.last_name}
            </h2>
            <p className="text-sm text-white/90">
              {data?.email} - {data?.phone}
            </p>
            <p className="text-sm text-white/90">
              {data?.gender} - {calculateAge(data?.date_of_birth)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
          <Calendar size={24} className="text-[#046658] flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Date of Birth</p>
            <p className="text-base font-medium text-[#046658]">
              {format(new Date(data?.date_of_birth), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
          <Home size={24} className="text-[#046658] flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Address</p>
            <p className="text-base font-medium text-[#046658]">
              {data?.address}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
          <Mail size={24} className="text-[#046658] flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Email</p>
            <p className="text-base font-medium text-[#046658]">
              {data?.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
          <Phone size={24} className="text-[#046658] flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Phone</p>
            <p className="text-base font-medium text-[#046658]">
              {data?.phone}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
          <Info size={24} className="text-[#046658] flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Physician</p>
            <p className="text-base font-medium text-[#046658]">
              Dr Codewave, MBBS, FCPS
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
          <div className="w-6 h-6 rounded-full bg-[#2EB6B0] flex items-center justify-center flex-shrink-0 mt-1">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Active Conditions</p>
            <p className="text-base font-medium text-[#046658]">
              {data?.medical_conditions || "None recorded"}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
          <div className="w-6 h-6 rounded-full bg-[#5AC5C8] flex items-center justify-center flex-shrink-0 mt-1">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3E4C4B] mb-1">Allergies</p>
            <p className="text-base font-medium text-[#046658]">
              {data?.allergies || "None recorded"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
