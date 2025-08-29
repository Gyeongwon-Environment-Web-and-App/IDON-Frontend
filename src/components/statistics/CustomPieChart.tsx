import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import type { PieChartProps } from "../../types/stats";

// Custom Tooltip Component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-dark-gray mb-1">{data.name}</p>
        <p className="text-sm text-gray-600">{`${data.value}건`}</p>
      </div>
    );
  }
  return null;
};

export const CustomPieChart: React.FC<PieChartProps> = ({ data, colors }) => {
  return (
    <ResponsiveContainer
      width="40%"
      height={300}
      className="md:w-[40%] !w-[80%]"
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={110}
          paddingAngle={0}
          height={300}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
      </PieChart>
    </ResponsiveContainer>
  );
};
