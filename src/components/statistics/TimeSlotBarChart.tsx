import React, { lazy, Suspense, useState } from 'react';

import type { BarChartProps } from '@/types/stats';

// Dynamic imports for Recharts components to enable tree shaking
const Bar = lazy(() =>
  import('recharts').then((module) => ({ default: module.Bar }))
);
const BarChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.BarChart }))
);
const CartesianGrid = lazy(() =>
  import('recharts').then((module) => ({ default: module.CartesianGrid }))
);
const ResponsiveContainer = lazy(() =>
  import('recharts').then((module) => ({ default: module.ResponsiveContainer }))
);
const XAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.XAxis }))
);
const YAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.YAxis }))
);

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

    // Calculate total complaints for this timeslot
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
          <p>{timeRange} </p>
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
                <p className="">{entry.dataKey}</p>
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

const timeSlot = [
  '8:30',
  '9:30',
  '10:30',
  '11:30',
  '12:30',
  '1:30',
  '2:30',
  '3:30',
  '4:30',
  '5:30',
];

export const TimeSlotBarChart: React.FC<BarChartProps> = ({ data, colors }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  // 데이터에서 카테고리 키들을 추출 (time 제외)
  const categories = Object.keys(data[0] || {}).filter((key) => key !== 'time');

  // 데이터를 timeSlot 인덱스로 변환 (0.5 단위로 조정하여 tick 사이에 위치)
  const transformedData = data.map((item, index) => ({
    ...item,
    timeIndex: index + 0.5, // 0.5, 1.5, 2.5... 로 설정하여 tick 사이에 위치
    hoverArea: 1, // 투명한 배경 바를 위한 값
  }));

  // 현재 호버된 인덱스에 따른 툴팁 데이터 생성
  const currentTooltipData = categories.map((category, index) => {
    const value = Number(data[hoveredIndex]?.[category] || 0);
    return {
      dataKey: category,
      value: value, // 0이어도 명시적으로 표시
      color: colors[index % colors.length],
      payload: {
        time: data[hoveredIndex]?.time || '8:30~9:30',
        [category]: value,
      },
    };
  });

  return (
    <div className="h-96 w-full md:w-[600px] flex flex-col justify-center md:flex-row xxxs:-mt-7 xxs:-mt-5 xs:mt-0 md:ml-3">
      <div className="flex-1 flex items-center min-w-[450px] scale-95 xs:mb-3">
        <Suspense
          fallback={
            <div className="w-full h-80 flex items-center justify-center">
              차트 로딩 중...
            </div>
          }
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            className="xxxs:scale-[71%] xxs:scale-[78%] xs:scale-90 md:scale-100 min-h-80"
          >
            <BarChart
              width={1200}
              height={300}
              data={transformedData}
              margin={{
                top: 0,
                right: 10,
                left: -35,
                bottom: -30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timeIndex"
                tickFormatter={(value) => timeSlot[Math.floor(value)]}
                type="number"
                domain={[0, timeSlot.length - 1]}
                ticks={timeSlot.map((_, index) => index)}
                height={60}
              />
              <YAxis />
              {categories.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                  fill={colors[index % colors.length]}
                  onMouseEnter={(event) => {
                    const dataIndex = event.payload?.timeIndex
                      ? Math.floor(event.payload.timeIndex - 0.5)
                      : 0;
                    setHoveredIndex(dataIndex);
                  }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Suspense>
      </div>

      {/* 고정 툴팁 */}
      <div className="-mt-8 md:mt-0 mb-3 md:mb-8 flex items-center justify-center md:justify-start">
        <TimeSlotToolTip active={true} payload={currentTooltipData} />
      </div>
    </div>
  );
};

export default TimeSlotBarChart;
