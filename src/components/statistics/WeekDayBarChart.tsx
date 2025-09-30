import React, { memo, Suspense, useCallback, useMemo, useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import type { BarChartProps } from '@/types/stats';

// Custom TimeSlotTooltip Component
interface TimeSlotToolTipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    payload: {
      time: string;
      [key: string]: unknown;
    };
  }>;
  label?: string;
}

const TimeSlotToolTip = ({ active, payload }: TimeSlotToolTipProps) => {
  if (active && payload && payload.length) {
    const timeRange = payload[0]?.payload?.time; // chartData의 time 가져오기

    const totalComplaints = payload.reduce(
      (sum, entry) => sum + entry.value,
      0
    );

    // 중복 제거: 같은 dataKey를 가진 항목들을 필터링
    const uniqueEntries = payload.filter(
      (entry, index, self) =>
        index === self.findIndex((e) => e.dataKey === entry.dataKey)
    );

    return (
      <div className="bg-white border border-[#757575] rounded-lg p-2 md:p-5 mt-2 md:mt-5 md:py-5 md:w-48 w-72 text-center">
        <div className="font-semibold text-lg md:text-2xl text-gray-text mb-2 md:mb-4 flex items-center justify-center">
          <p>{timeRange}</p>
          <span className="block md:hidden ml-2 text-black">
            ({totalComplaints}건)
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {uniqueEntries.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1 py-1 px-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></span>
              <div className="flex justify-between flex-1 text-sm md:text-base font-semibold">
                <p>{entry.dataKey}</p>
                <p>{entry.value}건</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const WeekDayBarChartComponent: React.FC<BarChartProps> = ({
  data,
  colors,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  // 데이터에서 카테고리 키들을 추출 (time 제외) - 메모화
  const categories = useMemo(
    () =>
      data && data.length > 0
        ? Object.keys(data[0] || {}).filter((key) => key !== 'time')
        : [],
    [data]
  );

  // 현재 호버된 인덱스에 따른 툴팁 데이터 생성 - 메모화
  const currentTooltipData = useMemo(
    () =>
      categories.map((category, index) => {
        const value = Number(data?.[hoveredIndex]?.[category] || 0);
        return {
          dataKey: category,
          value: value, // 0이어도 명시적으로 표시
          color: colors[index % colors.length],
          payload: {
            time: data?.[hoveredIndex]?.time || '월요일',
            [category]: value,
          },
        };
      }),
    [categories, data, hoveredIndex, colors]
  );

  // 마우스 이벤트 핸들러 최적화
  const handleMouseEnter = useCallback(
    (event: { payload?: { time?: string } }) => {
      const dataIndex =
        data?.findIndex((item) => item.time === event.payload?.time) ?? -1;
      setHoveredIndex((prev) => {
        const newIndex = dataIndex >= 0 ? dataIndex : 0;
        return prev !== newIndex ? newIndex : prev;
      });
    },
    [data]
  );

  // 데이터 유효성 검사
  if (!data || data.length === 0) {
    return (
      <div className="h-96 w-full md:w-[600px] flex items-center justify-center">
        <div className="text-gray-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full md:w-[600px] flex flex-col items-center justify-center md:flex-row mt-1 md:mt-16">
      <div className="flex-1 flex items-center min-w-[450px] scale-90 md:-mr-3">
        <Suspense
          fallback={
            <div className="w-full h-80 flex items-center justify-center">
              차트 로딩 중...
            </div>
          }
        >
          <div className="w-[320px] h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              className="xxxs:scale-[75%] xxs:scale-[82%] xs:scale-[85%] md:scale-100 md:ml-0 min-h-80"
            >
              <BarChart
                data={data}
                margin={{
                  top: 0,
                  right: 10,
                  left: -35,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" type="category" />
                <YAxis />
                {categories.map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    barSize={40}
                    radius={[0, 0, 0, 0]}
                    fill={colors[index % colors.length]}
                    onMouseEnter={handleMouseEnter}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Suspense>
      </div>

      {/* 고정 툴팁 */}
      <div className="-mt-10 md:-mt-5 mb-8 flex items-center">
        <TimeSlotToolTip active={true} payload={currentTooltipData} />
      </div>
    </div>
  );
};

// Memoized component to prevent infinite loops
export const WeekDayBarChart = memo(WeekDayBarChartComponent);

export default WeekDayBarChart;
