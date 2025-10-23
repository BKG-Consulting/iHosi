'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import Link from 'next/link';
import { SectionWrapper } from '../shared/SectionWrapper';

export function CTASection() {
  return (
    <SectionWrapper spacing="xl" className="bg-white relative overflow-hidden">
      {/* Subtle background with amber and cyan */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-amber-50 via-white to-brand-cyan-50" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand-amber-100/40 rounded-full blur-3xl opacity-50 animate-gentle-float" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-brand-cyan-100/30 rounded-full blur-3xl opacity-40 animate-gentle-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <h2 className="font-display text-display-xl md:text-display-2xl text-black mb-6 leading-tight">
          Ready to Transform Your Healthcare Practice?
        </h2>
        <p className="text-xl text-gray-700 mb-12 leading-relaxed">
          Join hundreds of healthcare facilities using iHosi to deliver exceptional patient care and streamline operations.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <Link href="/sign-in">
            <Button 
              size="lg" 
              className="bg-brand-cyan-600 hover:bg-brand-cyan-700 text-white text-lg px-10 py-6 shadow-large hover:shadow-xlarge transition-elegant group"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-elegant" />
            </Button>
          </Link>
          <Link href="#contact">
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-gray-300 hover:border-brand-amber-400 hover:bg-brand-amber-50 text-black text-lg px-10 py-6 transition-elegant"
            >
              Schedule Demo
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-brand-cyan-300 transition-elegant hover:shadow-medium">
            <Globe className="h-10 w-10 text-brand-cyan-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Flexible Deployment</h3>
            <p className="text-gray-700 text-sm">Cloud, on-premise, or hybrid solutions to fit your needs</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-brand-amber-300 transition-elegant hover:shadow-medium">
            <Shield className="h-10 w-10 text-brand-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Enterprise Security</h3>
            <p className="text-gray-700 text-sm">HIPAA compliant with SOC 2 Type II certification</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-brand-cyan-300 transition-elegant hover:shadow-medium">
            <Zap className="h-10 w-10 text-brand-cyan-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">24/7 Support</h3>
            <p className="text-gray-700 text-sm">Dedicated support team and comprehensive documentation</p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
