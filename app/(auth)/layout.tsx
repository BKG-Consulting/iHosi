import Link from "next/link";
import Image from "next/image";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { AuthRedirectWrapper } from '@/components/auth/auth-redirect-wrapper';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        {/* Centered Form */}
        <div className="w-full max-w-md flex flex-col">
          {/* Header */}
          <div className="p-6 lg:p-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="w-full">
            {/* Logo */}
            <div className="text-center mb-12">
              <Link href="/" className="inline-flex items-center space-x-4 group">
                <div className="w-20 h-20 rounded-3xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Image 
                    src="/logo.png" 
                    alt="iHosi Logo" 
                    width={80} 
                    height={80} 
                    className="w-20 h-20"
                  />
                </div>
                <div className="text-left">
                  <span className="text-4xl font-bold text-slate-800">iHosi</span>
                  <p className="text-base text-slate-500 font-medium">Healthcare Management</p>
                </div>
              </Link>
            </div>

            {/* Form Container */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <AuthRedirectWrapper>
                {children}
              </AuthRedirectWrapper>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center text-xs text-slate-500">
              <p>
                By continuing, you agree to our{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AuthLayout;