import React, { memo, Suspense } from 'react';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { PieChartProps } from '../../types/stats';

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

const CustomPieChartComponent: React.FC<PieChartProps> = ({ data, colors }) => {
  // 데이터 유효성 검사
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-gray-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-80 flex items-center justify-center">
          차트 로딩 중...
        </div>
      }
    >
      <ResponsiveContainer
        width="40%"
        height={300}
        minWidth={300}
        minHeight={300}
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
            isAnimationActive={false}
            animationBegin={0}
            animationDuration={0}
            animationEasing="ease"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip />}
            isAnimationActive={false}
            animationDuration={0}
            animationEasing="ease"
          />
        </PieChart>
      </ResponsiveContainer>
    </Suspense>
  );
};

// 메모화된 컴포넌트로 내보내기 - 무한 루프 방지
const CustomPieChart = memo(CustomPieChartComponent);

export { CustomPieChart };
export default CustomPieChart;
