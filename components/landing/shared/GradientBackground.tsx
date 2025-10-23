'use client';

import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  variant?: 'mesh' | 'radial' | 'linear';
  className?: string;
  animated?: boolean;
}

export function GradientBackground({ 
  variant = 'mesh', 
  className,
  animated = false 
}: GradientBackgroundProps) {
  if (variant === 'mesh') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        {/* Floating gradient orbs */}
        <div className={cn(
          "absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-3xl",
          animated && "animate-float"
        )} 
        style={{ animationDuration: '8s' }}
        />
        <div className={cn(
          "absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-emerald-500/30 to-teal-600/30 rounded-full blur-3xl",
          animated && "animate-float"
        )} 
        style={{ animationDuration: '6s', animationDelay: '2s' }}
        />
        <div className={cn(
          "absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-full blur-3xl",
          animated && "animate-float"
        )} 
        style={{ animationDuration: '10s', animationDelay: '4s' }}
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.2) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'radial') {
    return (
      <div className={cn('absolute inset-0', className)}>
        <div className="absolute inset-0 bg-gradient-radial from-blue-100/50 via-white to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn('absolute inset-0', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
    </div>
  );
}

