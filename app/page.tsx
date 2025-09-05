import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
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
  Phone
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Home() {
  const { userId } = await auth();
  const role = await getRole();

  if (userId && role) {
    redirect(`/${role}`);
  }

  const coreFeatures = [
    {
      icon: CalendarCheck,
      title: "Intelligent Appointment Scheduling",
      description: "Real-time availability with smart algorithms that optimize resource utilization and reduce no-show rates.",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: FileText,
      title: "Comprehensive Health Records",
      description: "Unified patient records with encrypted storage, vital signs tracking, and treatment plan documentation.",
      color: "from-cyan-500 to-teal-500"
    },
    {
      icon: Building2,
      title: "Department & Staff Management",
      description: "Hierarchical organization with role-based access controls and performance analytics.",
      color: "from-teal-600 to-cyan-600"
    },
    {
      icon: Bed,
      title: "Ward & Bed Management",
      description: "Real-time bed availability with patient placement optimization and capacity planning.",
      color: "from-cyan-600 to-teal-600"
    },
    {
      icon: Shield,
      title: "HIPAA Compliant Security",
      description: "Enterprise-grade security with end-to-end encryption and comprehensive audit trails.",
      color: "from-teal-700 to-cyan-700"
    },
    {
      icon: BarChart3,
      title: "Business Intelligence",
      description: "Predictive analytics and comprehensive reporting for data-driven healthcare decisions.",
      color: "from-cyan-700 to-teal-700"
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA]">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="Ihosi Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-[#3E4C4B]">Ihosi</span>
                <p className="text-xs text-[#5AC5C8] font-medium">Healthcare Management</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-[#3E4C4B] hover:text-[#046658] transition-colors font-medium">
                Features
              </Link>
              <Link href="#capabilities" className="text-[#3E4C4B] hover:text-[#046658] transition-colors font-medium">
                Capabilities
              </Link>
              <Link href="#benefits" className="text-[#3E4C4B] hover:text-[#046658] transition-colors font-medium">
                Benefits
              </Link>
              <Link href="#contact" className="text-[#3E4C4B] hover:text-[#046658] transition-colors font-medium">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {userId ? (
                <Link href={`/${role}`}>
                  <Button className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034A4A] hover:to-[#259A95] text-white shadow-lg">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" className="text-[#3E4C4B] hover:text-[#046658] hover:bg-[#D1F1F2]">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034A4A] hover:to-[#259A95] text-white shadow-lg">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#046658]/5 to-[#2EB6B0]/5"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-full border border-[#D1F1F2] shadow-lg text-[#046658] text-sm font-semibold mb-8">
              <Award className="h-4 w-4 mr-2" />
              Trusted by Healthcare Professionals Worldwide
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#3E4C4B] mb-6 leading-tight">
              Transforming Healthcare Delivery
              <span className="block bg-gradient-to-r from-[#046658] to-[#2EB6B0] bg-clip-text text-transparent">
                Through Intelligent Technology
              </span>
            </h1>
            
            <p className="text-xl text-[#3E4C4B]/80 max-w-4xl mx-auto mb-12 leading-relaxed">
              The Ihosi Healthcare Management System represents a comprehensive, modern solution designed to 
              revolutionize healthcare delivery and management. Built with enterprise-grade security, regulatory 
              compliance, and operational efficiency at its core.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              {!userId && (
                <>
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034A4A] hover:to-[#259A95] text-white text-lg px-10 py-5 shadow-xl">
                      Start Free Trial
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button size="lg" variant="outline" className="border-2 border-[#046658] text-[#046658] hover:bg-[#046658] hover:text-white text-lg px-10 py-5">
                      <Play className="h-5 w-5 mr-2" />
                      Watch Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D1F1F2]">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#046658] to-[#2EB6B0] bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-[#3E4C4B] text-sm font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3E4C4B] mb-6">
              Complete Healthcare Management Solution
            </h2>
            <p className="text-xl text-[#3E4C4B]/80 max-w-3xl mx-auto">
              From patient registration to discharge, our comprehensive platform provides all the tools 
              healthcare professionals need to deliver exceptional patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-[#F5F7FA]">
                <CardHeader className="text-center pb-6 pt-8">
                  <div className={`bg-gradient-to-r ${feature.color} text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#3E4C4B] mb-4">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-8 pb-8">
                  <CardDescription className="text-[#3E4C4B]/70 leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* System Capabilities Section */}
      <section id="capabilities" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F5F7FA] to-[#D1F1F2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3E4C4B] mb-6">
              Comprehensive System Capabilities
            </h2>
            <p className="text-xl text-[#3E4C4B]/80 max-w-3xl mx-auto">
              Our platform covers every aspect of healthcare management, from patient care to financial operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {systemCapabilities.map((capability, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <capability.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      {capability.category}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4">
                    {capability.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-[#046658] mt-0.5 flex-shrink-0" />
                        <span className="text-[#3E4C4B] font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3E4C4B] mb-6">
              Benefits for Every Stakeholder
            </h2>
            <p className="text-xl text-[#3E4C4B]/80 max-w-3xl mx-auto">
              Our system delivers value across all levels of healthcare organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-gradient-to-br from-white to-[#F5F7FA] border-0 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="text-center p-8">
                  <div className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-[#3E4C4B] mb-4">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <ul className="space-y-4">
                    {benefit.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[#3E4C4B] leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#046658] to-[#2EB6B0] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-6xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Delivery?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            The Ihosi Healthcare Management System is more than just software—it's a comprehensive solution 
            that transforms how healthcare is delivered, managed, and experienced.
          </p>
          
          {!userId && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-[#046658] hover:bg-gray-50 text-lg px-10 py-5 shadow-xl font-semibold">
                  Get Started Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#046658] text-lg px-10 py-5 font-semibold">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Globe className="h-8 w-8 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Flexible Deployment</h3>
              <p className="text-white/80 text-sm">On-premise, cloud, or hybrid options</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Lock className="h-8 w-8 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-white/80 text-sm">HIPAA compliant with SOC 2 certification</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Zap className="h-8 w-8 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-white/80 text-sm">Dedicated support and maintenance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#3E4C4B] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-16 h-16">
                  <Image
                    src="/logo.png"
                    alt="Ihosi Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-3xl font-bold text-white">Ihosi</span>
                  <p className="text-[#5AC5C8] font-medium">Healthcare Management System</p>
                </div>
              </div>
              <p className="text-white/80 max-w-lg text-lg leading-relaxed mb-6">
                Transforming healthcare delivery through intelligent technology. Where technology meets healthcare excellence.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-white/80">
                  <Mail className="h-5 w-5 text-[#5AC5C8]" />
                  <span>services@bkgconsultants.com</span>
                </div>
                <div className="flex items-center space-x-3 text-white/80">
                  <Globe className="h-5 w-5 text-[#5AC5C8]" />
                  <span>www.ihosi.com</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">System Capabilities</h3>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-white/80 hover:text-[#5AC5C8] transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Patient Management
                </Link></li>
                <li><Link href="#capabilities" className="text-white/80 hover:text-[#5AC5C8] transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Clinical Operations
                </Link></li>
                <li><Link href="#benefits" className="text-white/80 hover:text-[#5AC5C8] transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Financial Management
                </Link></li>
                <li><Link href="#contact" className="text-white/80 hover:text-[#5AC5C8] transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Security & Compliance
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Contact & Support</h3>
              <ul className="space-y-3">
                <li><Link href="/sign-up" className="text-white/80 hover:text-[#5AC5C8] transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Get Started
                </Link></li>
                <li><Link href="/sign-in" className="text-white/80 hover:text-[#5AC5C8] transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Sign In
                </Link></li>
                <li><Link href="#" className="text-white/80 hover:text-[#5AC5C8] transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Technical Support
                </Link></li>
                <li><Link href="#" className="text-white/80 hover:text-[#5AC5C8] transition-colors flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Privacy Policy
                </Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-white/60 text-center md:text-left">
                &copy; 2025 Ihosi Healthcare Management System. All rights reserved. 
                <span className="block md:inline">Built with care for healthcare professionals.</span>
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-white/60">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-white/60">
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
