import { ActionDialog } from "@/components/action-dialog";
import { ViewAction } from "@/components/action-options";
import { DoctorForm } from "@/components/forms/doctor-form";
import { Pagination } from "@/components/pagination";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { Button } from "@/components/ui/button";
import { SearchParamsProps } from "@/types";
import { checkRole } from "@/utils/roles";
import { DATA_LIMIT } from "@/utils/seetings";
import { getAllDoctors } from "@/utils/services/doctor";
import { Doctor } from "@prisma/client";
import { format } from "date-fns";
import { Users } from "lucide-react";
import React from "react";

const columns = [
  {
    header: "Info",
    key: "name",
  },
  {
    header: "License #",
    key: "license",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    key: "contact",
    className: "hidden md:table-cell",
  },
  {
    header: "Email",
    key: "email",
    className: "hidden lg:table-cell",
  },
  {
    header: "Joined Date",
    key: "created_at",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];

const DoctorsList = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;

  const result = await getAllDoctors({
    page,
    search: searchQuery,
  });

  // Handle error cases gracefully
  if (!result.success) {
    return (
      <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Doctors
            </h3>
            <p className="text-gray-600 mb-4">
              {result.message || "There was an error loading the doctors list."}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { data, totalPages, totalRecords, currentPage } = result;
  const isAdmin = await checkRole("ADMIN");

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="hidden lg:flex items-center gap-1">
            <Users size={20} className="text-gray-500" />
            <p className="text-2xl font-semibold">0</p>
            <span className="text-gray-600 text-sm xl:text-base">
              total doctors
            </span>
          </div>
          <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
            <SearchInput />
            {isAdmin && <DoctorForm />}
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Doctors Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No doctors match your search for "${searchQuery}"`
                : "No doctors have been added to the system yet."
              }
            </p>
            {isAdmin && (
              <DoctorForm />
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderRow = (item: Doctor) => (
    <tr
      key={item?.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
    >
      <td className="flex items-center gap-4 p-4">
        <ProfileImage
          url={item?.img!}
          name={item?.name}
          bgColor={item?.colorCode!}
          textClassName="text-black"
        />
        <div>
          <h3 className="uppercase">{item?.name}</h3>
          <span className="text-sm capitalize">{item?.specialization}</span>
        </div>
      </td>
      <td className="hidden md:table-cell">{item?.license_number}</td>
      <td className="hidden md:table-cell">{item?.phone}</td>
      <td className="hidden lg:table-cell">{item?.email}</td>
      <td className="hidden xl:table-cell">
        {format(item?.created_at, "yyyy-MM-dd")}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <ViewAction href={`doctors/${item?.id}`} />
          {isAdmin && (
            <ActionDialog type="delete" id={item?.id} deleteType="doctor" />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <Users size={20} className="text-gray-500" />

          <p className="text-2xl font-semibold">{totalRecords}</p>
          <span className="text-gray-600 text-sm xl:text-base">
            total doctors
          </span>
        </div>
        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          <SearchInput />
          {isAdmin && <DoctorForm />}
        </div>
      </div>

      <div className="mt-4">
        <Table columns={columns} data={data} renderRow={renderRow} />

        {totalPages && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            totalRecords={totalRecords}
            limit={DATA_LIMIT}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
