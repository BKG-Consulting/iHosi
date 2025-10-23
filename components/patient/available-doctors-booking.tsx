"use client";

import { AvailableDoctorProps } from "@/types/data-types";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ProfileImage } from "../profile-image";
import { daysOfWeek } from "@/utils";
import { cn } from "@/lib/utils";
import { Clock, ChevronRight } from "lucide-react";
import { DashboardBookAppointment } from "./dashboard-book-appointment";
import { Patient, Doctor } from "@prisma/client";

const getToday = () => {
  const today = new Date().getDay();
  return daysOfWeek[today];
};

const todayDay = getToday();

interface Days {
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_working: boolean;
}

interface DataProps {
  data: AvailableDoctorProps;
  patientData: Patient;
  allDoctors: Doctor[];
}

export const availableDays = ({ data }: { data: Days[] }) => {
  const isTodayWorkingDay = data?.find(
    (dayObj) => dayObj?.day_of_week?.toLowerCase() === todayDay.toLowerCase()
  );

  return isTodayWorkingDay && isTodayWorkingDay.is_working
    ? `${isTodayWorkingDay?.start_time} - ${isTodayWorkingDay?.end_time}`
    : "Not Available";
};

export const AvailableDoctorsBooking = ({ data, patientData, allDoctors }: DataProps) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  const handleBookNow = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setIsBookingOpen(true);
  };


  return (
    <>
      <div className="h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Available Doctors</h2>
            <p className="text-sm text-slate-600">Book an appointment with available doctors</p>
          </div>
        </div>

        {!data || data.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">No doctors available today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.map((doc, id) => (
              <Card
                key={id}
                className="group hover:shadow-md transition-all duration-300 border-slate-200 hover:border-blue-300 p-4"
              >
                <div className="flex gap-4 items-center">
                  <ProfileImage
                    url={doc?.img}
                    name={doc?.name}
                    className="w-14 h-14 flex-shrink-0"
                    textClassName="text-base font-semibold text-white"
                    bgColor={doc?.colorCode || "#3b82f6"}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-base mb-0.5">
                      Dr. {doc?.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-1.5 capitalize">
                      {doc?.specialization}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={cn(
                        "font-medium",
                        availableDays({ data: doc?.working_days }) === "Not Available"
                          ? "text-red-500"
                          : "text-green-600"
                      )}>
                        {availableDays({ data: doc?.working_days })}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleBookNow(doc.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    disabled={availableDays({ data: doc?.working_days }) === "Not Available"}
                  >
                    Book Now
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal - Using the proper workflow */}
      <DashboardBookAppointment
        data={patientData}
        doctors={allDoctors}
        preSelectedDoctor={selectedDoctorId}
        isOpen={isBookingOpen}
        onOpenChange={setIsBookingOpen}
      />
    </>
  );
};

