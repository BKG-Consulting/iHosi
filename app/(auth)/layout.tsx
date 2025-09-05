import Link from "next/link";
import React from "react";
import Image from "next/image";
import { 
  Stethoscope, 
  Shield, 
  Users, 
  Clock, 
  Heart,
  ArrowLeft,
  CheckCircle,
  Lock,
  Database,
  BarChart3,
  Smartphone,
  Globe,
  Award
} from "lucide-react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "HIPAA-compliant platform with end-to-end encryption and role-based access controls"
    },
    {
      icon: Database,
      title: "Comprehensive Management",
      description: "Complete patient journey management from registration to treatment and follow-up"
    },
    {
      icon: BarChart3,
      title: "Intelligent Analytics",
      description: "Business intelligence and predictive analytics for data-driven healthcare decisions"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Responsive design ensuring seamless access across all devices and platforms"
    },
    {
      icon: Globe,
      title: "Flexible Deployment",
      description: "On-premise, cloud, or hybrid deployment options to meet your specific needs"
    },
    {
      icon: Award,
      title: "Proven Excellence",
      description: "Trusted by healthcare institutions with 99.9% uptime and 24/7 support"
    }
  ];

  const stats = [
    "10,000+ Healthcare Professionals",
    "99.9% System Uptime", 
    "HIPAA & SOC 2 Compliant",
    "24/7 Technical Support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
        <div className="p-6 lg:p-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#3E4C4B] hover:text-[#046658] transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-3">
                <div className="relative w-12 h-12">
                  <Image
                    src="/logo.png"
                    alt="Ihosi Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-[#3E4C4B]">Ihosi</span>
                  <p className="text-xs text-[#5AC5C8] font-medium">Healthcare Management</p>
                </div>
              </Link>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {children}
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center text-xs text-[#3E4C4B]/70">
              <p>
                By continuing, you agree to our{" "}
                <Link href="#" className="text-[#046658] hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-[#046658] hover:underline font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Healthcare Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#046658] via-[#2EB6B0] to-[#5AC5C8] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Main Message */}
          <div className="mb-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Trusted Healthcare Platform
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Transforming Healthcare
              <span className="block text-white/90">Through Technology</span>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed max-w-lg">
              Where technology meets healthcare excellence. Comprehensive, secure, and intelligent healthcare management for the modern world.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-lg">{feature.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white font-medium text-sm">{stat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

