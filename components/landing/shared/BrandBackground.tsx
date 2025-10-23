'use client';

import { cn } from "@/lib/utils";

interface BrandBackgroundProps {
  variant?: 'subtle' | 'amber' | 'cyan' | 'elegant';
  className?: string;
}

export function BrandBackground({ 
  variant = 'subtle', 
  className 
}: BrandBackgroundProps) {
  
  if (variant === 'amber') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        {/* White base */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Subtle amber gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-brand-amber-100/40 to-transparent rounded-full blur-3xl opacity-60 animate-gentle-float" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-brand-amber-50/60 to-transparent rounded-full blur-3xl opacity-50 animate-gentle-float" style={{ animationDelay: '2s' }} />
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      </div>
    );
  }

  if (variant === 'cyan') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        {/* White base */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Subtle cyan gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-brand-cyan-100/30 to-transparent rounded-full blur-3xl opacity-50 animate-gentle-float" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-brand-cyan-50/40 to-transparent rounded-full blur-3xl opacity-40 animate-gentle-float" style={{ animationDelay: '3s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>
    );
  }

  if (variant === 'elegant') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        {/* White base */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Subtle multi-color gradients - amber and cyan */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-brand-amber-50/50 via-transparent to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-brand-cyan-50/40 via-transparent to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-brand-amber-100/30 to-brand-cyan-100/30 rounded-full blur-3xl opacity-40 animate-gentle-float" />
        
        {/* Very subtle texture */}
        <div className="absolute inset-0 bg-noise opacity-20" />
      </div>
    );
  }

  // Subtle variant (default)
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Pure white base */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Minimal ambient glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-amber-50/30 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-brand-cyan-50/20 rounded-full blur-3xl opacity-30" />
      
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-25" />
    </div>
  );
}

