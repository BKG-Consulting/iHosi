import Link from "next/link";
import Image from "next/image";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { AuthRedirectWrapper } from '@/components/auth/auth-redirect-wrapper';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <AuthRedirectWrapper>
            {children}
          </AuthRedirectWrapper>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            By continuing, you agree to our{" "}
            <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline-offset-2 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;