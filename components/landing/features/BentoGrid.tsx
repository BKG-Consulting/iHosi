'use client';

import { SectionWrapper } from '../shared/SectionWrapper';
import { SectionHeader } from '../shared/SectionHeader';
import { BrandBackground } from '../shared/BrandBackground';
import { FeatureCard } from './FeatureCard';
import { 
  Calendar, 
  Shield, 
  FileText, 
  BarChart3,
  Users,
  Clock,
  Brain,
  Zap
} from 'lucide-react';

export function BentoGrid() {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered appointment optimization that reduces wait times and maximizes resource utilization.',
      colorScheme: 'cyan' as const,
      size: 'large' as const,
      features: ['Auto-scheduling', 'Conflict resolution', 'Multi-facility support']
    },
    {
      icon: Shield,
      title: 'HIPAA Security',
      description: 'Enterprise-grade security with end-to-end encryption and compliance monitoring.',
      colorScheme: 'amber' as const,
      size: 'medium' as const,
      features: ['256-bit encryption', 'Audit trails', 'Access controls']
    },
    {
      icon: FileText,
      title: 'Electronic Health Records',
      description: 'Comprehensive digital patient records accessible anywhere, anytime.',
      colorScheme: 'cyan' as const,
      size: 'medium' as const,
      features: ['Digital charts', 'History tracking', 'Document management']
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Real-time insights and reports to drive data-informed decisions.',
      colorScheme: 'amber' as const,
      size: 'large' as const,
      features: ['Custom reports', 'Predictive analytics', 'KPI tracking']
    },
    {
      icon: Users,
      title: 'Patient Portal',
      description: 'Empower patients with self-service booking and health record access.',
      colorScheme: 'cyan' as const,
      size: 'small' as const
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Instant notifications and live status updates across all modules.',
      colorScheme: 'amber' as const,
      size: 'small' as const
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Intelligent automation for routine tasks and decision support.',
      colorScheme: 'cyan' as const,
      size: 'small' as const
    },
    {
      icon: Zap,
      title: 'Quick Actions',
      description: 'Streamlined workflows with one-click common operations.',
      colorScheme: 'amber' as const,
      size: 'small' as const
    }
  ];

  return (
    <SectionWrapper id="features" spacing="xl" className="relative bg-white">
      <BrandBackground variant="subtle" />
      
      <div className="relative z-10">
        <SectionHeader
          badge="Features"
          title="Everything You Need in One Platform"
          description="Comprehensive tools designed for modern healthcare management. From scheduling to analytics, we've got you covered."
        />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          {/* Large Feature 1 - Spans 2 columns */}
          <div className="lg:col-span-2 lg:row-span-2">
            <FeatureCard {...features[0]} size="large" />
          </div>

          {/* Medium Features */}
          <div className="lg:col-span-1 lg:row-span-1">
            <FeatureCard {...features[1]} size="medium" />
          </div>
          <div className="lg:col-span-1 lg:row-span-1">
            <FeatureCard {...features[2]} size="medium" />
          </div>

          {/* Small Features */}
          <div className="lg:col-span-1">
            <FeatureCard {...features[4]} size="small" />
          </div>
          <div className="lg:col-span-1">
            <FeatureCard {...features[5]} size="small" />
          </div>

          {/* Large Feature 2 - Spans 2 columns */}
          <div className="lg:col-span-2 lg:row-span-2">
            <FeatureCard {...features[3]} size="large" />
          </div>

          {/* Small Features */}
          <div className="lg:col-span-1">
            <FeatureCard {...features[6]} size="small" />
          </div>
          <div className="lg:col-span-1">
            <FeatureCard {...features[7]} size="small" />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
