'use client';

import { SectionWrapper } from '../shared/SectionWrapper';
import { BrandBackground } from '../shared/BrandBackground';
import { HeroContent } from './HeroContent';
import { HeroVisual } from './HeroVisual';

export function HeroSection() {
  return (
    <SectionWrapper spacing="xl" className="relative min-h-[90vh] flex items-center bg-white overflow-hidden">
      {/* Subtle background wave pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-50/40 to-transparent"></div>
      
      <div className="relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <HeroContent />
          <HeroVisual />
        </div>
      </div>
    </SectionWrapper>
  );
}
