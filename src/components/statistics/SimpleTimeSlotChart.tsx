import React, { memo, useMemo, useState } from 'react';

import type { BarChartProps } from '@/types/stats';

interface SimpleTimeSlotChartProps extends BarChartProps {
  className?: string;
}

const SimpleTimeSlotChartComponent: React.FC<SimpleTimeSlotChartProps> = ({
  data,
  colors,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  // 차트 데이터 계산
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        categories: [],
        maxValue: 0,
        bars: [],
      };
    }

    const categories = Object.keys(data[0] || {}).filter(
      (key) => key !== 'time'
    );

    if (categories.length === 0) {
      return {
        categories: [],
        maxValue: 0,
        bars: [],
      };
    }

    const maxValue = Math.max(
      ...data.map((item) =>
        categories.reduce(
          (sum, category) => sum + Number(item[category] || 0),
          0
        )
      )
    );

    return {
      categories,
      maxValue,
      bars: data.map((item, index) => ({
        ...item,
        index,
        totalValue: categories.reduce(
          (sum, category) => sum + Number(item[category] || 0),
          0
        ),
        segments: categories.map((category, catIndex) => ({
          category,
          value: Number(item[category] || 0),
          color: colors[catIndex % colors.length],
          percentage:
            maxValue > 0 ? (Number(item[category] || 0) / maxValue) * 100 : 0,
        })),
      })),
    };
  }, [data, colors]);

  const ticks = [
    '8:30',
    '9:30',
    '10:30',
    '11:30',
    '12:30',
    '13:30',
    '14:30',
    '15:30',
    '16:30',
    '17:30',
  ];

  // 데이터 유효성 검사
  if (!data || data.length === 0) {
    return (
      <div
        className={`h-96 w-full md:w-[600px] flex items-center justify-center ${className}`}
      >
        <div className="text-gray-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  // 현재 호버된 데이터
  const currentData = chartData.bars[hoveredIndex] || chartData.bars[0];

  return (
    <div
      className={`h-96 w-[300px] md:w-[670px] flex flex-col justify-center border border-green-500 md:flex-row ${className}`}
    >
      <div className="flex-1 flex items-center md:w-[450px] border border-red md:ml-5">
        <div className="w-full h-56 flex flex-col justify-end border border-blue-500">
          {/* Y축 라벨 */}
          <div className="flex justify-evenly items-end h-full pb-8">
            {chartData.bars.map((bar, index) => (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(0)}
              >
                {/* 바 차트 */}
                <div className="w-6 md:w-8 h-48 flex flex-col justify-end mb-2">
                  <div className="w-full h-full flex flex-col justify-end">
                    {bar.segments.map((segment, segIndex) => (
                      <div
                        key={segIndex}
                        className="w-full transition-all duration-200"
                        style={{
                          height: `${segment.percentage}%`,
                          backgroundColor: segment.color,
                          minHeight: segment.value > 0 ? '2px' : '0px',
                        }}
                        title={`${segment.category}: ${segment.value}건`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X축 틱 - 바 사이에 위치 */}
          <div className="relative w-full -mt-8">
            {ticks.map((tick, idx) => (
              <div
                key={idx}
                className="text-[10px] md:text-xs text-gray-600 text-center absolute"
                style={{
                  left: `${(idx / (ticks.length - 1)) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {tick}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 툴팁 */}
      <div className="flex items-center justify-center md:justify-start px-4 pt-10 md:pt-0">
        <div className="bg-white border border-[#757575] rounded-lg p-4 w-48 text-center">
          <div className="font-semibold text-lg text-gray-600 mb-2">
            {currentData?.time}
          </div>
          <div className="space-y-1">
            {currentData?.segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span>{segment.category}</span>
                </div>
                <span className="font-semibold">{segment.value}건</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized component to prevent infinite loops
export const SimpleTimeSlotChart = memo(SimpleTimeSlotChartComponent);

export default SimpleTimeSlotChart;
