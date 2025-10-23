import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  background?: 'white' | 'slate' | 'gradient' | 'none';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function SectionWrapper({
  children,
  className,
  containerClassName,
  id,
  background = 'none',
  spacing = 'lg',
}: SectionWrapperProps) {
  const backgroundClasses = {
    white: 'bg-white',
    slate: 'bg-gradient-to-br from-slate-50 to-slate-100',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50',
    none: '',
  };

  const spacingClasses = {
    none: '',
    sm: 'py-12 sm:py-16',
    md: 'py-16 sm:py-20',
    lg: 'py-20 sm:py-32',
    xl: 'py-32 sm:py-40',
  };

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden',
        backgroundClasses[background],
        spacingClasses[spacing],
        className
      )}
    >
      <div className={cn(
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        containerClassName
      )}>
        {children}
      </div>
    </section>
  );
}

