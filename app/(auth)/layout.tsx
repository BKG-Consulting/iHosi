import Link from "next/link";
import Image from "next/image";
import React from "react";
import { 
  ArrowLeft,
  Shield,
  Zap,
  Cpu
} from "lucide-react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Header */}
          <div className="p-6 lg:p-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="text-center mb-12">
                <Link href="/" className="inline-flex items-center space-x-3 group">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <Image 
                      src="/logo.png" 
                      alt="iHosi Logo" 
                      width={48} 
                      height={48} 
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-3xl font-bold text-slate-800">iHosi</span>
                    <p className="text-sm text-slate-500 font-medium">Healthcare Management</p>
                  </div>
                </Link>
              </div>

              {/* Form Container */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                {children}
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

        {/* Right Side - Visual */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }}></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            {/* Main Message */}
            <div className="mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8">
                <Shield className="h-4 w-4 mr-2" />
                Secure Healthcare Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Modern Healthcare
                <span className="block text-white/90">Management</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed max-w-lg">
                Streamline operations, enhance patient care, and drive better outcomes with our comprehensive platform.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">HIPAA Compliant</h3>
                  <p className="text-white/80 text-sm">Enterprise-grade security</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Real-time Updates</h3>
                  <p className="text-white/80 text-sm">Instant notifications & sync</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">AI-Powered</h3>
                  <p className="text-white/80 text-sm">Smart automation & insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AuthLayout;