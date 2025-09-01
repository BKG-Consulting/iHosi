import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import React from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex bg-gray-50">
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] h-full">
        <Sidebar />
      </div>

      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] flex flex-col">
        <Navbar />

        <div className="h-full w-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default ProtectedLayout;
