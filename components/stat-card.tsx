import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatNumber } from "@/utils";

interface CardProps {
  title: string;
  icon: LucideIcon;
  note: string;
  value: number;
  className?: string;
  iconClassName?: string;
  link: string;
}

const CardIcon = ({ icon: Icon, className }: { icon: LucideIcon; className?: string }) => {
  return <Icon className={cn("w-5 h-5", className)} />;
};

export const StatCard = ({
  title,
  icon,
  note,
  value,
  className,
  iconClassName,
  link,
}: CardProps) => {
  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 pb-2">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100"
        >
          <Link href={link}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="px-6 py-2">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
              iconClassName
            )}
          >
            <CardIcon icon={icon} className="text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {formatNumber(value)}
            </h2>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-3 pt-0">
        <p className="text-sm text-gray-500 font-medium">{note}</p>
      </CardFooter>
    </Card>
  );
};
