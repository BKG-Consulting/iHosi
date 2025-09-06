import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
  onClick,
}) => {
  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
          iconClassName || "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 font-medium">
            {description}
          </p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1">
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


