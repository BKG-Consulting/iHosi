'use client';

import { Button } from '@/components/ui/button';
import { UserCheck, Globe, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LandingNavProps {
  userId?: string | null;
  userRole?: string | null;
}

export function LandingNav({ userId, userRole }: LandingNavProps) {
  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="iHosi Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-brand-cyan-600 transition-colors">
              iHosi
            </span>
          </Link>

          {/* Navigation Links - Cleaner spacing */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="#features" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Features
            </Link>
            <Link 
              href="#solutions" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Solutions
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Testimonials
            </Link>
            <Link 
              href="#contact" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Contact
            </Link>
          </div>

          {/* Right Section - Cleaner layout */}
          <div className="flex items-center gap-3">
            {/* Language/Region Selector */}
            <div className="hidden lg:flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <Globe className="h-4 w-4" />
              <span className="text-sm">EN</span>
              <ChevronDown className="h-3 w-3" />
            </div>

            {/* CTA Button - Enhanced styling */}
            {userId ? (
              <Link href={`/${userRole}`}>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                  Sign In
                </Button>
              </Link>
            )}
            
            {/* Get Free Demo Button */}
            <Link href="#demo">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              >
                Get free demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
