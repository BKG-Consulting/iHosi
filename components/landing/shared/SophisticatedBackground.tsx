'use client';

import { cn } from "@/lib/utils";

interface SophisticatedBackgroundProps {
  variant?: 'dots' | 'grid' | 'mesh' | 'radial' | 'elegant';
  className?: string;
  overlay?: boolean;
}

export function SophisticatedBackground({ 
  variant = 'elegant', 
  className,
  overlay = true 
}: SophisticatedBackgroundProps) {
  
  if (variant === 'dots') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        {overlay && <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/80" />}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        {overlay && <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-transparent to-white/90" />}
      </div>
    );
  }

  if (variant === 'mesh') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        <div className="absolute inset-0 bg-mesh-gradient" />
        <div className="absolute inset-0 bg-noise opacity-50" />
        {overlay && <div className="absolute inset-0 bg-white/40" />}
      </div>
    );
  }

  if (variant === 'radial') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute inset-0 bg-radial-gradient" />
        <div className="absolute inset-0 bg-noise opacity-30" />
      </div>
    );
  }

  // Elegant variant (default)
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Multi-layer sophisticated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
      
      {/* Subtle mesh overlay */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/60 via-transparent to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/50 via-transparent to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>
      
      {/* Dot pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise opacity-40" />
      
      {/* Top overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/80" />
      )}
    </div>
  );
}

