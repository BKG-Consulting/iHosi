import { AvailableDoctorProps } from "@/types/data-types";
import { checkRole } from "@/utils/roles";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Card } from "./ui/card";
import { ProfileImage } from "./profile-image";
import { daysOfWeek } from "@/utils";
import { cn } from "@/lib/utils";
import { Clock, MapPin } from "lucide-react";

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
}

export const availableDays = ({ data }: { data: Days[] }) => {
  const isTodayWorkingDay = data?.find(
    (dayObj) => dayObj?.day_of_week?.toLowerCase() === todayDay.toLowerCase()
  );

  return isTodayWorkingDay && isTodayWorkingDay.is_working
    ? `${isTodayWorkingDay?.start_time} - ${isTodayWorkingDay?.end_time}`
    : "Not Available";
};

export const AvailableDoctors = async ({ data }: DataProps) => {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Available Doctors</h2>
          <p className="text-sm text-gray-600">Doctors available for appointments today</p>
        </div>

        {(await checkRole("ADMIN")) && (
          <Button
            asChild
            variant="outline"
            disabled={!data || data.length === 0}
            className="text-xs border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <Link href="/record/doctors">View all</Link>
          </Button>
        )}
      </div>

      {!data || data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No doctors available today</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((doc, id) => (
            <Card
              key={id}
              className="group hover:shadow-md transition-all duration-300 border-gray-100 hover:border-blue-200 p-4"
            >
              <div className="flex gap-4">
                <ProfileImage
                  url={doc?.img}
                  name={doc?.name}
                  className="w-16 h-16 flex-shrink-0"
                  textClassName="text-lg font-semibold text-white"
                  bgColor={doc?.colorCode || "#3b82f6"}
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    Dr. {doc?.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 capitalize">
                    {doc?.specialization}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
