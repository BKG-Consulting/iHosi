"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Users, Calendar, CheckCircle } from "lucide-react";
import { formatNumber } from "@/utils";

export const StatSummary = ({ data, total }: { data: any; total: number }) => {
  const dataInfo = [
    { name: "Total", count: total || 0, fill: "#f8fafc" },
    {
      name: "Scheduled",
      count: (data?.PENDING || 0) + (data?.SCHEDULED || 0),
      fill: "#3b82f6",
    },
    { name: "Completed", count: data?.COMPLETED || 0, fill: "#10b981" },
  ];

  const scheduled = dataInfo[1].count;
  const completed = dataInfo[2].count;
  const totalCount = scheduled + completed;

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Appointment Summary</h2>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="text-xs border-gray-300 hover:bg-gray-50"
        >
          <Link href="/record/appointments">View all</Link>
        </Button>
      </div>

      <div className="relative w-full h-[200px] mb-6">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="85%"
            barSize={20}
            data={dataInfo}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar 
              background 
              dataKey="count"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totalCount)}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-gray-700">Scheduled</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">{formatNumber(scheduled)}</div>
            <div className="text-xs text-gray-500">
              {totalCount > 0 ? ((scheduled / totalCount) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">{formatNumber(completed)}</div>
            <div className="text-xs text-gray-500">
              {totalCount > 0 ? ((completed / totalCount) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
