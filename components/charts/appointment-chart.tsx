"use client";

import { AppointmentsChartProps } from "@/types/data-types";
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  Legend,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataProps {
  data: AppointmentsChartProps;
}

export const AppointmentChart = ({ data }: DataProps) => {
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          barSize={32}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#f1f5f9" 
            opacity={0.5}
          />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            tickMargin={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            tickMargin={10}
          />
          
          <Tooltip
            contentStyle={{ 
              borderRadius: "12px", 
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              fontSize: "14px"
            }}
            cursor={{ fill: "#f8fafc" }}
          />
          
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{
              paddingTop: "0px",
              paddingBottom: "20px",
              fontSize: "14px",
              fontWeight: "500"
            }}
          />
          
          <Bar
            dataKey="appointment"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
            name="Scheduled"
          />
          
          <Bar
            dataKey="completed"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            name="Completed"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
