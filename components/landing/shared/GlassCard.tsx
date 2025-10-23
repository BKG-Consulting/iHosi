import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function GlassCard({ 
  children, 
  className, 
  hover = true,
  padding = 'lg'
}: GlassCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'backdrop-blur-xl bg-white/70 border border-white/20',
        'rounded-2xl shadow-xl',
        paddingClasses[padding],
        hover && 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
}

