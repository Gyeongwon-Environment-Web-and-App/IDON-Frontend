import { CustomPieChart } from "./PieChart";
import { TimeSlotBarChart } from "./TimeSlotBarChart";
import type { DateRange } from "react-day-picker";
import {
  complaintTypeData,
  dongComplaintData,
  complaintData,
  timeSlotData,
  weekdayData,
} from "../../data/chartData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useState } from "react";
import DateRangePicker from "../common/DateRangePicker";
import WeekDayBarChart from "./WeekDayBarChart";
import type { BarChartItem } from "@/types/stats";

// 날짜 포매팅 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month}.${day}`;
};

// 날짜 범위 포매팅 함수
const formatDateRange = (from: Date, to: Date): string => {
  return `${formatDate(from)} - ${formatDate(to)}`;
};

const highestComplaintTime = (data: BarChartItem[]) => {
  let maxComplaints = -1;
  let minComplaints = Infinity;
  let totalComplaints = 0;
  let maxTime = "";
  let minTime = "";

  data.forEach((item) => {
    // 각 시간대의 총 민원 수 계산 (time 제외한 모든 카테고리 합계)
    const totalTimeComplaints = Object.keys(item)
      .filter((key) => key !== "time")
      .reduce((sum, key) => sum + Number(item[key]), 0);

    // 가장 많은 민원 시간대 찾기
    if (totalTimeComplaints > maxComplaints) {
      maxComplaints = totalTimeComplaints;
      maxTime = item.time;
    }

    // 가장 적은 민원 시간대 찾기
    if (totalTimeComplaints < minComplaints) {
      minComplaints = totalTimeComplaints;
      minTime = item.time;
    }

    totalComplaints += totalTimeComplaints;
  });

  return {
    maxTime,
    minTime,
    maxComplaints,
    minComplaints,
    totalComplaints,
  };
};

const ComplaintStats = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // 가장 많고 적은 민원 시간대 계산
  const timeStats = highestComplaintTime(timeSlotData);
  const weekdayStats = highestComplaintTime(weekdayData);

  console.log(weekdayStats.totalComplaints);

  const DongChartColors = [
    "#72E900",
    "#8ADEAB",
    "#3CC092",
    "#00BA13",
    "#007A0C",
    "#004207",
  ];
  const TrashChartColors = ["#58CC02", "#59B9FF", "#AF8AFF", "#F5694A"];
  const ComplaintChartColors = ["red", "#a8a8a8"];

  return (
    <div className="w-[100%] h-screen">
      <div className="pb-20">
        <header className="flex justify-between items-end border-b border-under pt-0 pb-3 mb-5">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            containerClassName="border border-black rounded-3xl px-4 py-1"
          />
          <div className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">다운로드</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {}}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center shadow-none bg-[#646464] text-white border-none outline-none hover:bg-under hover:text-white text-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm">인쇄</span>
            </Button>
          </div>
        </header>
        <section>
          <p className="font-semibold text-8d8d8d">
            최근{" "}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
          <div className="flex items-center gap-4 mt-2 w-full">
            <div className="w-[60%] flex">
              <div className="inline-flex flex-col gap-2 mr-10 mt-4">
                {dongComplaintData.map((item, index) => (
                  <span
                    key={item.name}
                    className="px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: DongChartColors[index] }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <CustomPieChart
                data={dongComplaintData}
                colors={DongChartColors}
              />
            </div>
            <div className="flex flex-col gap-2 w-[40%]">
              {dongComplaintData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 pt-1 pb-2 border-b border-[#dcdcdc]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: DongChartColors[index] }}
                    />
                    <span className="text-md font-semibold">{item.name}</span>
                  </div>
                  <p className="text-md font-semibold">{item.value}건</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-10">
          <p className="font-semibold text-8d8d8d">
            최근{" "}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
          <div className="flex items-center gap-4 mt-2 w-full">
            <div className="w-[60%] flex">
              <div className="inline-flex flex-col gap-2 mr-10 text-center w-[4rem] mt-4">
                {complaintTypeData.map((item, index) => (
                  <span
                    key={item.name}
                    className="px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: TrashChartColors[index] }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <CustomPieChart
                data={complaintTypeData}
                colors={TrashChartColors}
              />
            </div>
            <div className="flex flex-col gap-2 w-[40%]">
              {complaintTypeData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 pt-1 pb-2 border-b border-[#dcdcdc]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: TrashChartColors[index] }}
                    />
                    <span className="text-md font-semibold">{item.name}</span>
                  </div>
                  <p className="text-md font-semibold">{item.value}건</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-10">
          <p className="font-semibold text-8d8d8d">
            최근{" "}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
          <div className="flex items-center gap-4 mt-2 w-full">
            <div className="w-[60%] flex">
              <div className="inline-flex flex-col gap-2 mr-10 text-center mt-4">
                {complaintData.map((item, index) => (
                  <span
                    key={item.name}
                    className="px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: ComplaintChartColors[index] }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <CustomPieChart
                data={complaintData}
                colors={ComplaintChartColors}
              />
            </div>
            <div className="flex flex-col gap-2 w-[40%]">
              {complaintData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 pt-1 pb-2 border-b border-[#dcdcdc]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: ComplaintChartColors[index] }}
                    />
                    <span className="text-md font-semibold">{item.name}</span>
                  </div>
                  <p className="text-md font-semibold">{item.value}건</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-10">
          <p className="font-semibold text-8d8d8d">
            최근{" "}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
          <div className="w-full mt-5 flex items-center justify-between">
            <div className="-ml-10 mr-5">
              <TimeSlotBarChart data={timeSlotData} colors={TrashChartColors} />
            </div>
            <div className="flex flex-col gap-y-3">
              <p className="text-[#585858] font-semibold text-xl">
                가장 많은 민원이 들어온 시간대
              </p>
              <p className="text-black font-semibold text-3xl mb-10">
                {timeStats.maxTime} ({timeStats.maxComplaints}건)
              </p>
              <p className="text-[#585858] font-semibold text-xl">
                가장 적은 민원이 들어온 시간대
              </p>
              <p className="text-black font-semibold text-3xl">
                {timeStats.minTime} ({timeStats.minComplaints}건)
              </p>
            </div>
          </div>
        </section>
        <section className="mt-10">
          <p className="font-semibold text-8d8d8d">
            최근{" "}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-3xl mt-1">{`총 ${weekdayStats.totalComplaints}건`}</h1>
          <div className="w-full mt-5 flex items-center justify-between">
            <div className="-ml-10 mr-5">
              <WeekDayBarChart data={weekdayData} colors={TrashChartColors} />
            </div>
            <div className="flex flex-col gap-y-3">
              <p className="text-[#585858] font-semibold text-xl">
                가장 많은 민원이 들어온 요일
              </p>
              <p className="text-black font-semibold text-3xl mb-10">
                {weekdayStats.maxTime} ({weekdayStats.maxComplaints}건)
              </p>
              <p className="text-[#585858] font-semibold text-xl">
                가장 적은 민원이 들어온 요일
              </p>
              <p className="text-black font-semibold text-3xl">
                {weekdayStats.minTime} ({weekdayStats.minComplaints}건)
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComplaintStats;
