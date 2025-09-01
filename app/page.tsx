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
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  const role = await getRole();

  if (userId && role) {
    redirect(`/${role}`);
  }

  const features = [
    {
      icon: CalendarCheck,
      title: "Smart Appointment Scheduling",
      description: "Effortless booking system with real-time availability and automated reminders."
    },
    {
      icon: FileText,
      title: "Digital Medical Records",
      description: "Secure, comprehensive patient records accessible anytime, anywhere."
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Tailored interfaces for doctors, nurses, patients, and administrative staff."
    },
    {
      icon: Shield,
      title: "HIPAA Compliant Security",
      description: "Enterprise-grade security ensuring patient data privacy and compliance."
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Real-time dashboards and reports for informed healthcare decisions."
    },
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Streamlined workflows that prioritize patient experience and outcomes."
    }
  ];

  const stats = [
    { number: "10K+", label: "Patients Served" },
    { number: "50+", label: "Healthcare Providers" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-600 text-white p-2 rounded-xl">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Ihosi</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-500 hover:text-brand-600 transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-500 hover:text-brand-600 transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-500 hover:text-brand-600 transition-colors">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {userId ? (
                <Link href={`/${role}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" className="text-gray-500 hover:text-brand-600">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-brand-600 hover:bg-brand-700">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-brand-700 text-sm font-medium mb-8">
              <Star className="h-4 w-4 mr-2" />
              Trusted by Healthcare Professionals Worldwide
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Modern Healthcare
              <span className="block text-brand-600">Management System</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Streamline your healthcare operations with our comprehensive management platform. 
              From patient records to appointment scheduling, we've got everything covered to 
              help you deliver exceptional care.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {!userId && (
                <>
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                      Start Free Trial
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                      <Calendar className="h-5 w-5 mr-2" />
                      Book Appointment
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Healthcare
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools healthcare professionals 
              need to deliver exceptional patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
                <CardHeader className="text-center pb-4">
                  <div className="bg-brand-100 text-brand-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Healthcare Practice?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of healthcare professionals who trust our platform 
            to manage their operations efficiently.
          </p>
          
          {!userId && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-lg px-8 py-4">
                  Get Started Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-4">
                  <Clock className="h-5 w-5 mr-2" />
                  Schedule Demo
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-white">HealthCare Pro</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Empowering healthcare professionals with modern technology to deliver 
                exceptional patient care and streamline operations.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/sign-up" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2024 HealthCare Pro. All rights reserved. Built with care for healthcare professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
