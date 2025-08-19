import type { BarChartProps } from "@/types/stats";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Custom Tooltip Component
interface CustomTooltipProps {
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

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const timeRange = payload[0]?.payload?.time; // chartData의 time 가져오기

    // 중복 제거: 같은 dataKey를 가진 항목들을 필터링
    const uniqueEntries = payload.filter(
      (entry, index, self) =>
        index === self.findIndex((e) => e.dataKey === entry.dataKey)
    );

    return (
      <div className="bg-white border border-[#757575] rounded-lg p-5 mt-5 py-5 w-48 text-center">
        <p className="font-semibold text-2xl text-gray-text mb-2">
          {timeRange}
        </p>
        {uniqueEntries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 py-1 px-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <div className="flex justify-between flex-1">
              <p className="text-base font-semibold">{entry.dataKey}</p>
              <p className="text-base font-semibold">{entry.value}건</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const timeSlot = [
  "8:30",
  "9:30",
  "10:30",
  "11:30",
  "12:30",
  "1:30",
  "2:30",
  "3:30",
  "4:30",
  "5:30",
];

export const CustomBarChart: React.FC<BarChartProps> = ({ data, colors }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  // 데이터에서 카테고리 키들을 추출 (time 제외)
  const categories = Object.keys(data[0] || {}).filter((key) => key !== "time");

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
        time: data[hoveredIndex]?.time || "8:30~9:30",
        [category]: value,
      },
    };
  });

  return (
    <div className="h-80 w-[700px] flex -ml-5">
      <div className="flex-1 flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={1200}
            height={300}
            data={transformedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timeIndex"
              tickFormatter={(value) => timeSlot[Math.floor(value)]}
              type="number"
              domain={[0, timeSlot.length - 1]}
              ticks={timeSlot.map((_, index) => index)}
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
      </div>

      {/* 고정 툴팁 */}
      <div className="-ml-1 mb-8 flex items-center">
        <CustomTooltip active={true} payload={currentTooltipData} />
      </div>
    </div>
  );
};

export default CustomBarChart;
