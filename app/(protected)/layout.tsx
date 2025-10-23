import { Sidebar } from "@/components/sidebar";
import React from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sidebar - All navigation and user controls */}
      <div className="w-[280px] h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area - Full height, no redundant header */}
      <div className="flex-1 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default ProtectedLayout;
