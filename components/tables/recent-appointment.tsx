import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Table } from "./table";
import { Appointment } from "@/types/data-types";
import { ProfileImage } from "../profile-image";
import { format } from "date-fns";
import { AppointmentStatusIndicator } from "../appointment-status-indicator";
import { ViewAppointment } from "../view-appointment";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";

interface DataProps {
  data: any[];
}

const columns = [
  { header: "Patient Info", key: "name" },
  {
    header: "Date & Time",
    key: "datetime",
    className: "hidden md:table-cell",
  },
  {
    header: "Doctor",
    key: "doctor",
    className: "hidden lg:table-cell",
  },
  {
    header: "Status",
    key: "status",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];

export const RecentAppointments = ({ data }: DataProps) => {
  const renderRow = (item: Appointment) => {
    const name = item?.patient?.first_name + " " + item?.patient?.last_name;
    return (
      <tr
        key={item?.id}
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
      >
        <td className="py-4">
          <div className="flex items-center gap-3">
            <ProfileImage
              url={item?.patient?.img!}
              name={name}
              className="w-10 h-10"
              bgColor={item?.patient?.colorCode!}
            />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                {name}
              </h3>
              <span className="text-xs text-gray-500 capitalize">
                {item?.patient?.gender?.toLowerCase()}
              </span>
            </div>
          </div>
        </td>

        <td className="hidden md:table-cell py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <Calendar className="w-4 h-4 text-gray-400" />
              {format(item?.appointment_date, "MMM dd, yyyy")}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              {item?.time}
            </div>
          </div>
        </td>

        <td className="hidden lg:table-cell py-4">
          <div className="flex items-center gap-3">
            <ProfileImage
              url={item?.doctor?.img!}
              name={item?.doctor?.name}
              className="w-10 h-10"
              bgColor={item?.doctor?.colorCode!}
              textClassName="text-sm font-medium text-white"
            />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                Dr. {item?.doctor?.name}
              </h3>
              <span className="text-xs text-gray-500 capitalize">
                {item?.doctor?.specialization}
              </span>
            </div>
          </div>
        </td>

        <td className="hidden xl:table-cell py-4">
          <AppointmentStatusIndicator status={item?.status as any} />
        </td>

        <td className="py-4">
          <div className="flex items-center gap-2">
            <ViewAppointment id={item?.id} />
            
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-blue-50 hover:text-blue-600"
            >
              <Link href={`/record/appointments/${item?.id}`} className="flex items-center gap-1">
                View Details
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Recent Appointments</h2>
          <p className="text-sm text-gray-600">Your latest appointment activities</p>
        </div>

        <Button asChild variant="outline" className="border-gray-300 hover:bg-gray-50">
          <Link href="/record/appointments" className="flex items-center gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {!data || data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No appointments yet</p>
          <p className="text-sm">Your appointment history will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      )}
    </div>
  );
};
