'use client';

import { SectionWrapper } from '../shared/SectionWrapper';
import { SectionHeader } from '../shared/SectionHeader';
import { BrandBackground } from '../shared/BrandBackground';
import { TestimonialCard } from './TestimonialCard';
import { Star } from 'lucide-react';

export function TestimonialSection() {
  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      organization: 'City General Hospital',
      image: '/user.jpg',
      content: 'iHosi has transformed how we manage patient care. The scheduling system alone has reduced wait times by 40%, and our staff loves the intuitive interface.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Healthcare Administrator',
      organization: 'Wellness Medical Center',
      image: '/user.jpg',
      content: 'The comprehensive analytics have given us insights we never had before. We\'ve optimized our operations and improved patient satisfaction scores significantly.',
      rating: 5
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Family Physician',
      organization: 'Community Health Clinic',
      image: '/user.jpg',
      content: 'As a physician, having instant access to complete patient histories has been game-changing. The EHR system is the best I\'ve used in my 15-year career.',
      rating: 5
    }
  ];

  return (
    <SectionWrapper id="testimonials" spacing="xl" className="relative bg-white">
      <BrandBackground variant="cyan" />
      
      <div className="relative z-10">
        <SectionHeader
          badge="Testimonials"
          title="Trusted by Healthcare Leaders"
          description="See why healthcare professionals choose iHosi to power their practice"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-brand-amber-400 text-brand-amber-400" />
              ))}
            </div>
            <div className="text-2xl font-bold text-black">4.9/5</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">500+</div>
            <div className="text-sm text-gray-600">Healthcare Facilities</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">1M+</div>
            <div className="text-sm text-gray-600">Patients Served</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">99.9%</div>
            <div className="text-sm text-gray-600">Uptime SLA</div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
