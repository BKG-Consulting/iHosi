'use client';

import { SectionWrapper } from '../shared/SectionWrapper';
import { SectionHeader } from '../shared/SectionHeader';
import { BrandBackground } from '../shared/BrandBackground';
import { Calendar, FileText, Shield, BarChart3, Users, Stethoscope, TrendingUp } from 'lucide-react';

export function SolutionsSection() {
  const solutions = [
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Complete patient lifecycle management from registration to discharge with comprehensive health records.',
      colorScheme: 'cyan'
    },
    {
      icon: Stethoscope,
      title: 'Clinical Operations',
      description: 'Streamlined workflows for doctors, nurses, and support staff with real-time collaboration tools.',
      colorScheme: 'amber'
    },
    {
      icon: TrendingUp,
      title: 'Business Intelligence',
      description: 'Advanced analytics and reporting to optimize operations and improve patient outcomes.',
      colorScheme: 'cyan'
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered appointment optimization',
      colorScheme: 'cyan'
    },
    {
      icon: FileText,
      title: 'Digital Records',
      description: 'Comprehensive patient management',
      colorScheme: 'amber'
    },
    {
      icon: Shield,
      title: 'HIPAA Security',
      description: 'Enterprise-grade protection',
      colorScheme: 'cyan'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Data-driven insights',
      colorScheme: 'amber'
    }
  ];

  return (
    <SectionWrapper id="solutions" spacing="xl" className="relative bg-white">
      <BrandBackground variant="amber" />
      
      <div className="relative z-10">
        <SectionHeader
          badge="Solutions"
          title="Comprehensive Healthcare Solutions"
          description="Everything you need to manage your healthcare practice efficiently and effectively."
        />

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual Side */}
          <div className="relative">
            <div className="bg-gradient-to-br from-brand-amber-50 to-brand-cyan-50 rounded-3xl p-8 shadow-xlarge border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const bgColors = {
                    cyan: 'bg-brand-cyan-500',
                    amber: 'bg-brand-amber-500'
                  };
                  
                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-2xl p-6 shadow-medium transition-elegant hover:shadow-large hover:-translate-y-1 ${
                        index === 1 ? 'mt-8' : index === 3 ? '-mt-8' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 ${bgColors[feature.colorScheme as keyof typeof bgColors]} rounded-lg flex items-center justify-center mb-4 shadow-${feature.colorScheme}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-black mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-700">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-8">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              const bgColors = {
                cyan: 'bg-brand-cyan-50',
                amber: 'bg-brand-amber-50'
              };
              const textColors = {
                cyan: 'text-brand-cyan-600',
                amber: 'text-brand-amber-600'
              };
              
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className={`${bgColors[solution.colorScheme as keyof typeof bgColors]} p-3 rounded-xl border border-gray-200 transition-elegant hover:scale-105`}>
                    <Icon className={`h-6 w-6 ${textColors[solution.colorScheme as keyof typeof textColors]}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">
                      {solution.title}
                    </h3>
                    <p className="text-gray-700">{solution.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
