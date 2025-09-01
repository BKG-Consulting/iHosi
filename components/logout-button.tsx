"use client";

import React from "react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export const LogoutButton = () => {
  const { signOut } = useClerk();
  
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:shadow-sm transition-all duration-200 group"
      onClick={() => signOut({ redirectUrl: "/sign-in" })}
    >
      <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
        <LogOut className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
      </div>
      <span className="hidden lg:block text-sm font-medium">Sign Out</span>
    </Button>
  );
};
