import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRole } from "@/utils/roles";
import { 
  Calendar, 
  Users, 
  Shield, 
  Clock, 
  Heart, 
  UserCheck, 
  Stethoscope,
  CalendarCheck,
  FileText,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Database,
  Lock,
  BarChart3,
  Smartphone,
  Globe,
  Award,
  Target,
  Activity,
  Building2,
  Bed,
  ClipboardList,
  Brain,
  Layers,
  ChevronRight,
  Play,
  Mail,
  Phone,
  Sparkles,
  ArrowUpRight,
  LineChart,
  Cpu,
  Network,
  Microscope,
  Pill,
  Activity as ActivityIcon,
  Monitor,
  Smartphone as Mobile,
  Laptop
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Home() {
  const { getCurrentUserId, getCurrentUserRole } = await import('@/lib/auth-helpers');
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();

  if (userId && role) {
    redirect(`/${role}`);
  }

  const coreFeatures = [
    {
      icon: CalendarCheck,
      title: "Smart Scheduling",
      description: "AI-powered appointment optimization",
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: FileText,
      title: "Digital Records",
      description: "Comprehensive patient management",
      gradient: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Shield,
      title: "HIPAA Security",
      description: "Enterprise-grade protection",
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Data-driven insights",
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50"
    }
  ];

  const systemCapabilities = [
    {
      category: "Patient Management",
      icon: Users,
      features: [
        "Complete patient registration & onboarding",
        "Comprehensive health record management",
        "Appointment scheduling & management",
        "Medical history & treatment tracking",
        "Insurance & billing integration"
      ]
    },
    {
      category: "Clinical Operations",
      icon: Stethoscope,
      features: [
        "Department & staff management",
        "Equipment & resource tracking",
        "Ward & bed management",
        "Admission & discharge workflows",
        "Service templates & protocols"
      ]
    },
    {
      category: "Financial Management",
      icon: TrendingUp,
      features: [
        "Comprehensive billing system",
        "Payment processing & tracking",
        "Insurance verification & claims",
        "Financial reporting & analytics",
        "Revenue optimization tools"
      ]
    },
    {
      category: "Security & Compliance",
      icon: Lock,
      features: [
        "HIPAA-compliant data protection",
        "Role-based access controls",
        "Audit trails & monitoring",
        "Secure data transmission",
        "Regular compliance assessments"
      ]
    }
  ];

  const benefits = [
    {
      title: "For Healthcare Administrators",
      icon: Target,
      points: [
        "Reduced operational costs through optimized resource utilization",
        "Improved compliance with automated regulatory reporting",
        "Enhanced decision-making with comprehensive analytics",
        "Streamlined operations with automated workflows"
      ]
    },
    {
      title: "For Healthcare Providers",
      icon: UserCheck,
      points: [
        "Instant access to complete patient information",
        "Streamlined workflows that reduce administrative burden",
        "Better patient outcomes through comprehensive care coordination",
        "Enhanced collaboration across departments"
      ]
    },
    {
      title: "For Patients",
      icon: Heart,
      points: [
        "Convenient appointment booking and management",
        "Faster service delivery with reduced wait times",
        "Better care coordination across all providers",
        "Secure access to personal health information"
      ]
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "HIPAA", label: "Compliant" },
    { number: "24/7", label: "Support" },
    { number: "SOC 2", label: "Type II Certified" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image 
                  src="/logo.png" 
                  alt="iHosi Logo" 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 rounded-xl"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-800">iHosi</span>
                <p className="text-xs text-slate-500 font-medium">Healthcare Management</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Features
              </Link>
              <Link href="#solutions" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Solutions
              </Link>
              <Link href="#about" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                About
              </Link>
              <Link href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {userId ? (
                <Link href={`/${role}`}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/30 to-teal-600/30 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '7s', animationDelay: '1s' }}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Animated lines */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse"></div>
          <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200 shadow-lg text-slate-700 text-sm font-semibold mb-8 animate-in fade-in duration-800">
              <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
              Trusted by Healthcare Professionals
            </div>
            
            {/* Main Headline - Reduced font sizes */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-800">
              Modern Healthcare
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            
            {/* Subtitle - Reduced font size */}
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-800 delay-200">
              Streamline operations, enhance patient care, and drive better outcomes with our comprehensive healthcare management platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-800 delay-300">
              {!userId && (
                <Link href="/sign-in">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-lg px-10 py-5 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    Get Started
                    <ArrowUpRight className="h-5 w-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Floating Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {coreFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className={`${feature.bgColor} backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 duration-800`}
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className={`bg-gradient-to-r ${feature.gradient} text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Showcase */}
      <section id="solutions" className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage your healthcare practice efficiently and effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <CalendarCheck className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="font-semibold text-slate-800 mb-2">Smart Scheduling</h3>
                    <p className="text-sm text-slate-600">AI-powered appointment optimization</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
                    <FileText className="h-8 w-8 text-emerald-600 mb-4" />
                    <h3 className="font-semibold text-slate-800 mb-2">Digital Records</h3>
                    <p className="text-sm text-slate-600">Comprehensive patient management</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <Shield className="h-8 w-8 text-purple-600 mb-4" />
                    <h3 className="font-semibold text-slate-800 mb-2">HIPAA Security</h3>
                    <p className="text-sm text-slate-600">Enterprise-grade protection</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg -mt-8">
                    <BarChart3 className="h-8 w-8 text-orange-600 mb-4" />
                    <h3 className="font-semibold text-slate-800 mb-2">Analytics</h3>
                    <p className="text-sm text-slate-600">Data-driven insights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Patient Management</h3>
                    <p className="text-slate-600">Complete patient lifecycle management from registration to discharge with comprehensive health records.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <Stethoscope className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Clinical Operations</h3>
                    <p className="text-slate-600">Streamlined workflows for doctors, nurses, and support staff with real-time collaboration tools.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Business Intelligence</h3>
                    <p className="text-slate-600">Advanced analytics and reporting to optimize operations and improve patient outcomes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Built for Modern Healthcare
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Leveraging cutting-edge technology to deliver secure, scalable, and intuitive healthcare solutions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">HIPAA Compliant</h3>
                <p className="text-sm text-slate-600">Enterprise-grade security</p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Real-time</h3>
                <p className="text-sm text-slate-600">Instant updates & notifications</p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Cpu className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">AI-Powered</h3>
                <p className="text-sm text-slate-600">Smart automation & insights</p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Cloud Native</h3>
                <p className="text-sm text-slate-600">Scalable & accessible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto">
            Join healthcare professionals who trust iHosi to streamline their operations and deliver exceptional patient care.
          </p>
          
          {!userId && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/sign-in">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-10 py-5 shadow-xl font-semibold group">
                  Get Started
                  <ArrowUpRight className="h-5 w-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <Globe className="h-10 w-10 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Flexible Deployment</h3>
              <p className="text-white/80">Cloud, on-premise, or hybrid solutions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <Shield className="h-10 w-10 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-white/80">HIPAA compliant with SOC 2 certification</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <Zap className="h-10 w-10 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-white/80">Dedicated support and maintenance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <Image 
                    src="/logo.png" 
                    alt="iHosi Logo" 
                    width={40} 
                    height={40} 
                    className="w-10 h-10"
                  />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">iHosi</span>
                  <p className="text-slate-400 text-sm">Healthcare Management</p>
                </div>
              </div>
              <p className="text-slate-300 max-w-lg text-lg leading-relaxed mb-8">
                Transforming healthcare delivery through intelligent technology. Where innovation meets healthcare excellence.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span>services@bkgconsultants.com</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <span>www.ihosi.com</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Solutions</h3>
              <ul className="space-y-4">
                <li><Link href="#solutions" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Patient Management
                </Link></li>
                <li><Link href="#solutions" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Clinical Operations
                </Link></li>
                <li><Link href="#solutions" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Business Intelligence
                </Link></li>
                <li><Link href="#solutions" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Security & Compliance
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-4">
                <li><Link href="/sign-in" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Sign In
                </Link></li>
                <li><Link href="#about" className="text-slate-300 hover:text-blue-400 transition-colors">
                  About Us
                </Link></li>
                <li><Link href="#contact" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Contact
                </Link></li>
                <li><Link href="#" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-slate-400 text-center md:text-left">
                &copy; 2025 iHosi Healthcare Management System. All rights reserved.
              </p>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">SOC 2 Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
 
