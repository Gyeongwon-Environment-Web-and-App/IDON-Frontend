import React, { memo, useMemo } from 'react';

import type { PieChartProps } from '../../types/stats';

interface SimplePieChartProps extends PieChartProps {
  className?: string;
}

const SimplePieChartComponent: React.FC<SimplePieChartProps> = ({
  data,
  colors,
  className = '',
}) => {
  // 파이 차트 계산
  const pieData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return [];

    let currentAngle = 0;

    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle += angle;

      return {
        ...item,
        percentage,
        angle,
        startAngle,
        endAngle,
        color: colors[index % colors.length],
        pathData: createPieSlicePath(startAngle, endAngle, 110, 60),
      };
    });
  }, [data, colors]);

  // 데이터 유효성 검사
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full h-80 flex items-center justify-center ${className}`}
      >
        <div className="text-gray-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-64 h-64">
        {/* SVG 파이 차트 */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 220 220"
          className="transform -rotate-90"
        >
          {pieData.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </g>
          ))}
        </svg>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {data.reduce((sum, item) => sum + item.value, 0)}건
            </div>
            <div className="text-sm text-gray-600">총 민원</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 파이 슬라이스 경로 생성 함수
function createPieSlicePath(
  startAngle: number,
  endAngle: number,
  outerRadius: number,
  innerRadius: number
): string {
  const centerX = 110;
  const centerY = 110;

  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;

  const x1 = centerX + outerRadius * Math.cos(startAngleRad);
  const y1 = centerY + outerRadius * Math.sin(startAngleRad);
  const x2 = centerX + outerRadius * Math.cos(endAngleRad);
  const y2 = centerY + outerRadius * Math.sin(endAngleRad);

  const x3 = centerX + innerRadius * Math.cos(endAngleRad);
  const y3 = centerY + innerRadius * Math.sin(endAngleRad);
  const x4 = centerX + innerRadius * Math.cos(startAngleRad);
  const y4 = centerY + innerRadius * Math.sin(startAngleRad);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${x1} ${y1}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

// Memoized component to prevent infinite loops
export const SimplePieChart = memo(SimplePieChartComponent);

export default SimplePieChart;
