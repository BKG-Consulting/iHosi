import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  const alignClasses = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={cn('max-w-3xl mb-16', alignClasses, className)}>
      {badge && (
        <div className={cn(
          'inline-flex items-center px-4 py-2 bg-gradient-to-r from-brand-cyan-50 to-brand-amber-50 border border-brand-cyan-200 rounded-full text-black text-sm font-semibold mb-6',
          align === 'center' && 'mx-auto'
        )}>
          {badge}
        </div>
      )}
      <h2 className="font-display text-display-md md:text-display-lg text-black mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-gray-700 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
