'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorScheme: 'amber' | 'cyan';
  size?: 'small' | 'medium' | 'large';
  features?: string[];
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  colorScheme,
  size = 'medium',
  features
}: FeatureCardProps) {
  const sizeClasses = {
    small: 'p-6',
    medium: 'p-8',
    large: 'p-10'
  };

  const iconSizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-12 h-12',
    large: 'w-14 h-14'
  };

  const iconInnerClasses = {
    small: 'h-5 w-5',
    medium: 'h-6 w-6',
    large: 'h-7 w-7'
  };

  const colorSchemes = {
    amber: {
      iconBg: 'bg-gradient-to-br from-brand-amber-400 to-brand-amber-500',
      hoverBg: 'hover:bg-brand-amber-50',
      border: 'border-gray-200 hover:border-brand-amber-300',
      shadow: 'hover:shadow-amber',
    },
    cyan: {
      iconBg: 'bg-gradient-to-br from-brand-cyan-500 to-brand-cyan-600',
      hoverBg: 'hover:bg-brand-cyan-50',
      border: 'border-gray-200 hover:border-brand-cyan-300',
      shadow: 'hover:shadow-cyan',
    }
  };

  const scheme = colorSchemes[colorScheme];

  return (
    <div className={cn(
      'group relative h-full bg-white rounded-3xl border overflow-hidden',
      'transition-elegant hover:-translate-y-1',
      scheme.border,
      scheme.hoverBg,
      scheme.shadow,
      sizeClasses[size]
    )}>
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <div className={cn(
          'rounded-2xl flex items-center justify-center mb-6 shadow-medium',
          'transition-elegant group-hover:scale-105',
          scheme.iconBg,
          iconSizeClasses[size]
        )}>
          <Icon className={cn('text-white', iconInnerClasses[size])} />
        </div>

        {/* Title & Description */}
        <div className="flex-1">
          <h3 className={cn(
            'font-semibold text-black mb-3',
            size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-xl' : 'text-lg'
          )}>
            {title}
          </h3>
          <p className={cn(
            'text-gray-700 leading-relaxed',
            size === 'large' ? 'text-base' : 'text-sm'
          )}>
            {description}
          </p>

          {/* Feature List (only for large cards) */}
          {size === 'large' && features && (
            <ul className="mt-6 space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    colorScheme === 'amber' ? 'bg-brand-amber-500' : 'bg-brand-cyan-500'
                  )} />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Hover Arrow Indicator */}
        <div className={cn(
          "mt-4 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-elegant",
          colorScheme === 'amber' ? 'text-brand-amber-600' : 'text-brand-cyan-600'
        )}>
          Learn more 
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-elegant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
