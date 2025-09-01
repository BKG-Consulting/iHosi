import Link from "next/link";
import React from "react";
import { 
  Stethoscope, 
  Shield, 
  Users, 
  Clock, 
  Heart,
  ArrowLeft,
  CheckCircle
} from "lucide-react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "HIPAA-compliant platform ensuring your data is always protected"
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Tailored dashboards for patients, doctors, and healthcare staff"
    },
    {
      icon: Clock,
      title: "24/7 Availability", 
      description: "Access your healthcare information anytime, anywhere"
    }
  ];

  const stats = [
    "10,000+ Patients Trust Us",
    "99.9% System Uptime", 
    "HIPAA Compliant Security",
    "24/7 Customer Support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
        <div className="p-6 lg:p-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-500 hover:text-brand-600 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-2">
                <div className="bg-brand-600 text-white p-3 rounded-xl">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Ihosi</span>
              </Link>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {children}
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                By continuing, you agree to our{" "}
                <Link href="#" className="text-brand-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-brand-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Healthcare Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Main Message */}
          <div className="mb-10">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-blue-100 text-xs font-medium mb-4">
              <Heart className="h-3.5 w-3.5 mr-2" />
              Trusted Healthcare Platform
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold mb-4 leading-tight">
              Minimal. Secure.
              <span className="block text-brand-100">Built for Care.</span>
            </h1>
            <p className="text-base text-blue-100/90 leading-relaxed max-w-md">
              A clean, focused experience that keeps your attention on what matters.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-md flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-0.5">{feature.title}</h3>
                  <p className="text-blue-100/90 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

