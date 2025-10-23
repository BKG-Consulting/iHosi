'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';
import Link from 'next/link';

export function HeroContent() {
  const features = [
    'Multi-facility Management',
    'Real-time Booking & Notifications',
    'HIPAA Compliant Security',
    'Comprehensive Analytics'
  ];

  return (
    <div className="space-y-8">
      {/* Main Heading - Clean, bold typography */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Increase provider capacity &{' '}
          <span className="text-blue-600">care access</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
          Optimize patient access and provider allocation with a fully white-labeled solution 
          that integrates intake, scheduling, telehealth, omni-channel communication, 
          care coordination, and AI-powered resource and calendar management.
        </p>
      </div>

      {/* Feature Pills - Clean, minimal design */}
      <div className="flex flex-wrap gap-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons - Clean, professional styling */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/sign-in">
          <Button 
            size="lg" 
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            Request demo
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </Link>
        
        <Link href="#demo">
          <Button 
            size="lg" 
            variant="outline"
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-base font-medium rounded-lg transition-all duration-200 group"
          >
            <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            Watch Demo
          </Button>
        </Link>
      </div>

      {/* Trust Indicators - Subtle, professional */}
      <div className="pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-4">Trusted by top providers in the US and across the globe</p>
        
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">500+</div>
            <div className="text-xs text-gray-500">Healthcare Facilities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1M+</div>
            <div className="text-xs text-gray-500">Patients Served</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">99.9%</div>
            <div className="text-xs text-gray-500">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
