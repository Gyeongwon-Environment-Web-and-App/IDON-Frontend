import { CustomPieChart } from "./CustomPieChart";
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
import triangle from "../../assets/icons/actions/triangle.svg";
import { AreaDropdown } from "@/components/ui/AreaDropdown";

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
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedTrashType, setSelectedTrashType] =
    useState<string>("쓰레기 종류");
  const [selectedTimeline, setSelectedTimeline] = useState<string>("시간대");
  const [selectedWeekday, setSelectedWeekday] = useState<string>("요일별");

  const getTrashTypeColor = (type: string) => {
    switch (type) {
      case "음식물":
        return "#F5694A";
      case "재활용":
        return "#58CC02";
      case "일반":
        return "#59B9FF";
      case "기타":
        return "#AF8AFF";
      default:
        return "black";
    }
  };

  const handleAreaSelectionChange = (areas: string[]) => {
    setSelectedAreas(areas);
  };

  const getSelectedAreaDisplay = (areas: string[]) => {
    if (areas.length === 0) return "전체 지역";

    const 쌍문Children = ["쌍문 1동", "쌍문 2동", "쌍문 3동", "쌍문 4동"];
    const 방학Children = ["방학 1동", "방학 3동"];

    const selected쌍문Children = 쌍문Children.filter((child) =>
      areas.includes(child)
    );
    const selected방학Children = 방학Children.filter((child) =>
      areas.includes(child)
    );

    const displayParts = [];

    if (selected쌍문Children.length === 쌍문Children.length) {
      displayParts.push("쌍문동");
    } else if (selected쌍문Children.length > 0) {
      displayParts.push(selected쌍문Children.join(", "));
    }

    if (selected방학Children.length === 방학Children.length) {
      displayParts.push("방학동");
    } else if (selected방학Children.length > 0) {
      displayParts.push(selected방학Children.join(", "));
    }

    return displayParts.join(", ");
  };

  // 가장 많고 적은 민원 시간대 계산
  const timeStats = highestComplaintTime(timeSlotData);
  const weekdayStats = highestComplaintTime(weekdayData);

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
      <div className="pb-28 md:pb-20 overflow-hidden">
        <header className="flex flex-wrap-reverse md:flex-nowrap justify-between md:items-end border-b border-under pt-0 pb-3 mb-5 mt-3 md:mt-0">
          <div className="flex mt-12 md:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    color: getTrashTypeColor(selectedTrashType),
                  }}
                  className="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
                >
                  <span className="text-sm font-semibold">{selectedTrashType}</span>
                  <img src={triangle} alt="쓰레기 종류 선택" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="[&>*]:justify-center !min-w-[110px] !font-semibold"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTrashType("음식물");
                  }}
                  className="text-[#F5694A]"
                >
                  음식물
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTrashType("재활용");
                  }}
                  className="text-[#58CC02]"
                >
                  재활용
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTrashType("일반");
                  }}
                  className="text-[#59B9FF]"
                >
                  일반
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTrashType("기타");
                  }}
                  className="text-[#AF8AFF]"
                >
                  기타
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
                >
                  <span className="text-sm">{selectedTimeline}</span>
                  <img src={triangle} alt="시간대 선택" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="[&>*]:justify-center !min-w-[80px]"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTimeline("연도별");
                  }}
                >
                  연도별
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTimeline("월별");
                  }}
                >
                  월별
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTimeline("주간");
                  }}
                >
                  주간
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTimeline("일간");
                  }}
                >
                  일간
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
                >
                  <span className="text-sm">{selectedWeekday}</span>
                  <img src={triangle} alt="요일별 선택" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="[&>*]:justify-center !min-w-[80px]"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedWeekday("월요일");
                  }}
                >
                  월요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedWeekday("화요일");
                  }}
                >
                  화요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedWeekday("수요일");
                  }}
                >
                  수요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedWeekday("목요일");
                  }}
                >
                  목요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedWeekday("금요일");
                  }}
                >
                  금요일
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2">
              <AreaDropdown
                onSelectionChange={handleAreaSelectionChange}
                buttonText="구역 선택"
                buttonClassName="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
                contentClassName="w-28 !p-0"
                childItemClassName="pl-10 bg-f0f0f0 rounded-none"
                triangleIcon={triangle}
              />
            </div>
          </div>
          <div className="flex absolute md:static top-[9rem] right-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2 px-[6px] md:px-3"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:block text-sm">다운로드</span>
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
              className="flex items-center shadow-none bg-[#646464] text-white border-none outline-none hover:bg-under hover:text-white text-sm px-2 md:px-3"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm hidden md:block">인쇄</span>
            </Button>
          </div>
        </header>
        <div className="mb-4 pb-3 rounded-lg">
          <p className="text-base text-gray-600 mb-1">현재 조회 중인 지역은</p>
          <h3 className="text-xl font-semibold text-gray-800">
            도봉구 {getSelectedAreaDisplay(selectedAreas)}
          </h3>
        </div>
        <section className="relative">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            containerClassName="border border-[#575757] rounded-3xl px-4 py-0 md:py-1 absolute md:right-0 -top-[12.3rem] md:-top-20"
          />
          <p className="text-base font-semibold text-8d8d8d">
            최근{" "}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
          <div className="flex flex-wrap md:flex-no-wrap items-center mt-2 w-full">
            <div className="md:w-[60%] w-[100%] flex">
              <div className="flex flex-col gap-2 mr-2 mt-2 md:mr-10 md:mt-4">
                {dongComplaintData.map((item, index) => (
                  <span
                    key={item.name}
                    className="px-2 md:px-3 py-1 text-xs font-semibold text-white"
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
            <div className="flex flex-col gap-2 md:w-[40%] w-[100%]">
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
          <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mt-2 w-full">
            <div className="md:w-[60%] w-[100%] flex">
              <div className="text-center md:w-[4rem] px-0 flex flex-col gap-2 mr-2 mt-2 md:mr-10 md:mt-4">
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
            <div className="flex flex-col gap-2 md:w-[40%] w-[100%]">
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
          <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mt-2 w-full">
            <div className="md:w-[60%] w-[100%] flex">
              <div className="inline-flex flex-col gap-2 md:mr-10 text-center mt-4">
                {complaintData.map((item, index) => (
                  <span
                    key={item.name}
                    className="px-2 md:px-3 py-1 text-xs font-semibold text-white"
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
            <div className="flex flex-col gap-2 md:w-[40%] w-[100%]">
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
          <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
          <div className="mt-5 flex flex-wrap md:flex-nowrap items-center md:justify-between justify-center">
            <div className="mb-10 md:mb-5">
              <TimeSlotBarChart data={timeSlotData} colors={TrashChartColors} />
            </div>
            <div className="flex flex-col items-center md:gap-y-3 w-[95%] md:ml-5">
              <div className="flex justify-between md:inline">
                <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                  가장 많은 민원이 들어온 시간대
                </p>
                <p className="text-black font-semibold text-sm md:text-3xl md:mb-10 mb-3">
                  {timeStats.maxTime} ({timeStats.maxComplaints}건)
                </p>
              </div>
              <div className="flex justify-between md:inline">
                <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                  가장 적은 민원이 들어온 시간대
                </p>
                <p className="text-black font-semibold text-sm md:text-3xl">
                  {timeStats.minTime} ({timeStats.minComplaints}건)
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-7 md:mt-10">
          <p className="font-semibold text-8d8d8d">
            최근{" "}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${weekdayStats.totalComplaints}건`}</h1>
          <div className="w-full md:-mt-20 flex flex-wrap md:flex-nowrap items-center md:justify-between justify-center">
            <div className="md:mb-0 mb-5">
              <WeekDayBarChart data={weekdayData} colors={TrashChartColors} />
            </div>
            <div className="flex flex-col items-center md:gap-y-3 w-[95%] md:ml-5">
              <div className="flex justify-between md:inline">
                <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                  가장 많은 민원이 들어온 요일
                </p>
                <p className="text-black font-semibold text-sm md:text-3xl mb-3">
                  {weekdayStats.maxTime} ({weekdayStats.maxComplaints}건)
                </p>
              </div>
              <div className="flex justify-between md:inline">
                <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                  가장 적은 민원이 들어온 요일
                </p>
                <p className="text-black font-semibold text-sm md:text-3xl">
                  {weekdayStats.minTime} ({weekdayStats.minComplaints}건)
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComplaintStats;
