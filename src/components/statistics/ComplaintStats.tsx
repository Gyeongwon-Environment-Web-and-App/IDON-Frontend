import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { AreaDropdown } from '@/components/ui/AreaDropdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRegionStatistics } from '@/hooks/useRegionStatistics';
import { useStatistics } from '@/hooks/useStatistics';
import { useTimePeriodByDay } from '@/hooks/useTimePeriodByDay';
import { Download, Printer } from '@/lib/icons';
import type { BarChartItem } from '@/types/stats';
import {
  getHybridChartData,
  shouldShowFirstPieChart,
} from '@/utils/hybridDataSelector';
import {
  transformRegionDataToRegionChartData,
  transformRegionDaysToBarChartData,
  transformRegionPosNegToChartData,
  transformRegionTimePeriodsToBarChartData,
} from '@/utils/regionStatsTransformers';

import triangle from '../../assets/icons/actions/triangle.svg';
import DateRangePicker from '../common/DateRangePicker';
import { SimplePieChart } from './SimplePieChart';
import { SimpleTimeSlotChart } from './SimpleTimeSlotChart';
import { SimpleWeekdayChart } from './SimpleWeekdayChart';

// Enhanced color system with fallbacks - moved outside component for stability
const ColorMappings = {
  // Trash types
  trash: {
    재활용: '#58CC02',
    일반: '#59B9FF',
    기타: '#AF8AFF',
    음식물: '#F5694A',
  } as Record<string, string>,

  // Regions/Dongs
  regions: {
    쌍문1동: '#72E900',
    쌍문2동: '#8ADEAB',
    쌍문3동: '#3CC092',
    쌍문4동: '#00BA13',
    방학1동: '#007A0C',
    방학3동: '#004207',
  } as Record<string, string>,

  // Complaint types
  complaints: {
    '반복 민원': '#FF0000',
    '일반 민원': '#a8a8a8',
    부정적: '#FF0000',
    긍정적: '#a8a8a8',
  } as Record<string, string>,

  // Special cases
  special: {
    전체통계: '#333333',
  } as Record<string, string>,
};

const mapComplaintLabel = (label: string): string => {
  const labelMap: Record<string, string> = {
    부정적: '반복 민원',
    긍정적: '일반 민원',
  };
  return labelMap[label] || label; // Return original if no mapping found
};

// Transform time period by day API data to BarChartItem format
interface TimePeriodByDayItem {
  hour: string;
  count: number;
}

interface TimePeriodByDayResponse {
  data: Record<string, TimePeriodByDayItem[]>;
}

const transformTimePeriodByDayData = (
  data: TimePeriodByDayResponse,
  selectedWeekday: string
): BarChartItem[] => {
  const weekdayMap: Record<string, string> = {
    월요일: '1',
    화요일: '2',
    수요일: '3',
    목요일: '4',
    금요일: '5',
    토요일: '6',
    일요일: '7',
  };

  const selectedDayNumber = weekdayMap[selectedWeekday];
  const dayData = data?.data?.[selectedDayNumber] || [];

  console.log('Transform debug:', {
    selectedWeekday,
    selectedDayNumber,
    dayData,
    allData: data?.data,
  });

  // Normalize API hour values like "08:30" -> "8:30" to match chart ticks
  const normalizeHour = (value: string): string => {
    const [hh, mm] = value.split(':');
    return `${Number(hh)}:${mm}`;
  };
  const normalizedDayData = dayData.map((item) => ({
    ...item,
    hour: normalizeHour(item.hour),
  }));

  const timeSlots: BarChartItem[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    const hourKey = `${hour}:30`;
    const found = normalizedDayData.find(
      (item: TimePeriodByDayItem) => item.hour === hourKey
    );

    timeSlots.push({
      hour: hourKey,
      time: hourKey,
      count: found ? Number(found.count) : 0,
    });
  }

  console.log('Final transformed timeSlots:', timeSlots);
  return timeSlots;
};

// Color getter functions - moved outside component for stability
const getTrashColor = (name: string) =>
  ColorMappings.trash[name] || ColorMappings.special[name] || '#000000';

const getRegionColor = (name: string) =>
  ColorMappings.regions[name] || '#cccccc';

const getComplaintColor = (name: string) =>
  ColorMappings.complaints[name] || '#cccccc';

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
  let maxTime = '';
  let minTime = '';

  data.forEach((item) => {
    // 각 시간대의 총 민원 수 계산 (time 제외한 모든 카테고리 합계)
    const totalTimeComplaints = Object.keys(item)
      .filter((key) => key !== 'time')
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
    useState<string>('쓰레기 종류');
  const [selectedTimeline, setSelectedTimeline] =
    useState<string>('전체 시간대');
  const [selectedWeekday, setSelectedWeekday] = useState<string>('전체 요일');

  const {
    transformedData,
    isLoading,
    error,
    fetchStatistics,
    clearStatistics,
  } = useStatistics();

  const {
    regionData,
    isLoading: regionLoading,
    error: regionError,
    fetchRegionStatistics,
    clearRegionStatistics,
  } = useRegionStatistics();

  const {
    data: timePeriodByDayData,
    isLoading: timePeriodByDayLoading,
    error: timePeriodByDayError,
    fetchTimePeriodByDay,
    clearData: clearTimePeriodByDay,
  } = useTimePeriodByDay();

  // 메모화된 차트 데이터 계산 - 안정적인 의존성으로 수정
  const chartData = useMemo(
    () => getHybridChartData(transformedData, selectedTrashType),
    [transformedData, selectedTrashType]
  );

  const showFirstPieChart = useMemo(
    () => shouldShowFirstPieChart(selectedTrashType, selectedAreas.length > 0),
    [selectedTrashType, selectedAreas.length]
  );

  // Transform region data for charts - 안정적인 의존성으로 수정
  const regionPosNegData = useMemo(
    () =>
      transformRegionPosNegToChartData(regionData.posNeg).map((item) => ({
        ...item,
        name: mapComplaintLabel(item.name),
      })),
    [regionData.posNeg]
  );

  const regionDaysData = useMemo(
    () => transformRegionDaysToBarChartData(regionData.days),
    [regionData.days]
  );

  const regionTimePeriodsData = useMemo(
    () => transformRegionTimePeriodsToBarChartData(regionData.timePeriods),
    [regionData.timePeriods]
  );

  const regionChartData = useMemo(
    () => transformRegionDataToRegionChartData(regionData.posNeg),
    [regionData.posNeg]
  );

  const getTrashTypeColor = (type: string) => {
    return getTrashColor(type) || 'black';
  };

  const getSelectedAreaDisplay = useCallback((areas: string[]) => {
    if (areas.length === 0) return '전체 지역';

    const 쌍문Children = ['쌍문 1동', '쌍문 2동', '쌍문 3동', '쌍문 4동'];
    const 방학Children = ['방학 1동', '방학 3동'];

    const selected쌍문Children = 쌍문Children.filter((child) =>
      areas.includes(child)
    );
    const selected방학Children = 방학Children.filter((child) =>
      areas.includes(child)
    );

    const displayParts = [];

    if (selected쌍문Children.length === 쌍문Children.length) {
      displayParts.push('쌍문동');
    } else if (selected쌍문Children.length > 0) {
      displayParts.push(selected쌍문Children.join(', '));
    }

    if (selected방학Children.length === 방학Children.length) {
      displayParts.push('방학동');
    } else if (selected방학Children.length > 0) {
      displayParts.push(selected방학Children.join(', '));
    }

    return displayParts.join(', ');
  }, []);

  const handleAreaSelectionChange = useCallback(
    async (areas: string[]) => {
      setSelectedAreas(areas);

      // Clear trash type data when switching to region selection
      if (areas.length > 0) {
        setSelectedTrashType('쓰레기 종류');
        clearStatistics();
      }

      if (areas.length > 0) {
        // Fetch region statistics when areas are selected
        await fetchRegionStatistics(areas, selectedTimeline, dateRange);
      } else {
        // Clear region statistics when no areas are selected
        clearRegionStatistics();
      }
    },
    [
      selectedTimeline,
      dateRange,
      fetchRegionStatistics,
      clearRegionStatistics,
      clearStatistics,
    ]
  );

  const handleTrashTypeChange = useCallback(
    async (trashType: string) => {
      setSelectedTrashType(trashType);

      setSelectedAreas([]);
      clearRegionStatistics();

      if (trashType === '전체통계' || trashType === '쓰레기 종류') {
        clearStatistics();
        return;
      }

      await fetchStatistics([trashType], dateRange);
    },
    [dateRange, fetchStatistics, clearStatistics, clearRegionStatistics]
  );

  // 가장 많고 적은 민원 시간대 계산 - 안정적인 의존성으로 수정
  const timeStats = useMemo(() => {
    if (selectedAreas.length > 0) {
      return highestComplaintTime(regionTimePeriodsData);
    }
    return highestComplaintTime(chartData.timeSlotData);
  }, [selectedAreas.length, regionTimePeriodsData, chartData.timeSlotData]);

  const weekdayStats = useMemo(() => {
    if (selectedAreas.length > 0) {
      return highestComplaintTime(regionDaysData);
    }
    return highestComplaintTime(chartData.weekdayData);
  }, [selectedAreas.length, regionDaysData, chartData.weekdayData]);

  // 메모화된 색상 배열들 - 안정적인 의존성으로 수정
  const complaintTypeColors = useMemo(
    () => chartData.complaintTypeData.map((item) => getTrashColor(item.name)),
    [chartData.complaintTypeData]
  );

  const dongComplaintColors = useMemo(() => {
    const data =
      selectedAreas.length > 0 ? regionChartData : chartData.dongComplaintData;
    return data.map((item) => getRegionColor(item.name));
  }, [selectedAreas.length, regionChartData, chartData.dongComplaintData]);

  const complaintDataColors = useMemo(() => {
    const data =
      selectedAreas.length > 0 ? regionPosNegData : chartData.complaintData;
    return data.map((item) => getComplaintColor(item.name));
  }, [selectedAreas.length, regionPosNegData, chartData.complaintData]);

  // Effect to handle filter changes and trigger data fetching
  useEffect(() => {
    const fetchData = async () => {
      // If areas are selected, fetch region statistics
      if (selectedAreas.length > 0) {
        await fetchRegionStatistics(selectedAreas, selectedTimeline, dateRange);
      } else {
        // Clear region statistics when no areas are selected
        clearRegionStatistics();
      }

      // If trash type is selected and not default, fetch statistics
      if (
        selectedTrashType &&
        selectedTrashType !== '전체통계' &&
        selectedTrashType !== '쓰레기 종류'
      ) {
        await fetchStatistics([selectedTrashType], dateRange);
      } else {
        // Clear statistics when default trash type is selected
        clearStatistics();
      }
    };

    fetchData();
  }, [
    selectedAreas,
    selectedTimeline,
    selectedWeekday,
    selectedTrashType,
    dateRange,
    fetchRegionStatistics,
    clearRegionStatistics,
    fetchStatistics,
    clearStatistics,
  ]);

  // Effect to reset related filters when one filter changes
  useEffect(() => {
    // Reset timeline and weekday when trash type changes
    if (selectedTrashType !== '쓰레기 종류') {
      setSelectedTimeline('전체 시간대');
      setSelectedWeekday('전체 요일');
    }
  }, [selectedTrashType]);

  useEffect(() => {
    if (selectedWeekday !== '전체 요일' || dateRange) {
      fetchTimePeriodByDay(dateRange, selectedWeekday);
    } else {
      clearTimePeriodByDay();
    }
  }, [selectedWeekday, dateRange, fetchTimePeriodByDay, clearTimePeriodByDay]);

  useEffect(() => {
    // Reset timeline and weekday when areas change
    setSelectedTimeline('전체 시간대');
    setSelectedWeekday('전체 요일');
  }, [selectedAreas]);

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
                  className="flex items-center shadow-none !outline-none border-[#575757] focus:border-[#575757] mr-2"
                >
                  <span className="text-sm font-semibold">
                    {selectedTrashType}
                  </span>
                  <img src={triangle} alt="쓰레기 종류 선택" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="[&>*]:justify-center !min-w-[110px]"
              >
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('전체통계');
                  }}
                  className="text-[#333333]"
                >
                  전체통계
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('음식물');
                  }}
                  className="text-[#F5694A]"
                >
                  음식물
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('재활용');
                  }}
                  className="text-[#58CC02]"
                >
                  재활용
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('일반');
                  }}
                  className="text-[#59B9FF]"
                >
                  일반
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('기타');
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
                  onClick={async () => {
                    setSelectedTimeline('전체 시간대');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '전체 시간대',
                        dateRange
                      );
                    }
                  }}
                >
                  전체 시간대
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('8:30-9:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '8:30-9:30',
                        dateRange
                      );
                    }
                  }}
                >
                  8:30-9:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('9:30-10:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '9:30-10:30',
                        dateRange
                      );
                    }
                  }}
                >
                  9:30-10:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('10:30-11:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '10:30-11:30',
                        dateRange
                      );
                    }
                  }}
                >
                  10:30-11:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('11:30-12:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '11:30-12:30',
                        dateRange
                      );
                    }
                  }}
                >
                  11:30-12:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('12:30-13:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '12:30-13:30',
                        dateRange
                      );
                    }
                  }}
                >
                  12:30-13:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('13:30-14:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '13:30-14:30',
                        dateRange
                      );
                    }
                  }}
                >
                  13:30-14:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('14:30-15:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '14:30-15:30',
                        dateRange
                      );
                    }
                  }}
                >
                  14:30-15:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('15:30-16:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '15:30-16:30',
                        dateRange
                      );
                    }
                  }}
                >
                  15:30-16:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('16:30-17:30');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        '16:30-17:30',
                        dateRange
                      );
                    }
                  }}
                >
                  16:30-17:30
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
                  onClick={async () => {
                    setSelectedWeekday('전체 요일');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        selectedTimeline,
                        dateRange
                      );
                    }
                  }}
                >
                  전체 요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedWeekday('월요일');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        selectedTimeline,
                        dateRange
                      );
                    }
                  }}
                >
                  월요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedWeekday('화요일');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        selectedTimeline,
                        dateRange
                      );
                    }
                  }}
                >
                  화요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedWeekday('수요일');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        selectedTimeline,
                        dateRange
                      );
                    }
                  }}
                >
                  수요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedWeekday('목요일');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        selectedTimeline,
                        dateRange
                      );
                    }
                  }}
                >
                  목요일
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedWeekday('금요일');
                    if (selectedAreas.length > 0) {
                      await fetchRegionStatistics(
                        selectedAreas,
                        selectedTimeline,
                        dateRange
                      );
                    }
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
        {showFirstPieChart && selectedWeekday === '전체 요일' && (
          <section className="relative">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              containerClassName="border border-[#575757] rounded-3xl px-4 py-0 md:py-1 absolute md:right-0 -top-[12.3rem] md:-top-20"
            />
            <p className="font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mt-2 w-full">
              <div className="md:w-[60%] w-[100%] flex">
                <div className="text-center md:w-[4rem] px-0 flex flex-col gap-2 mr-2 mt-2 md:mr-10 md:mt-4">
                  {chartData.complaintTypeData.map((item) => (
                    <span
                      key={item.name}
                      className="px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: getTrashColor(item.name) }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
                <SimplePieChart
                  data={chartData.complaintTypeData}
                  colors={complaintTypeColors}
                />
              </div>
              <div className="flex flex-col gap-2 md:w-[40%] w-[100%]">
                {chartData.complaintTypeData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 pt-1 pb-2 border-b border-[#dcdcdc]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getTrashColor(item.name) }}
                      />
                      <span className="text-md font-semibold">{item.name}</span>
                    </div>
                    <p className="text-md font-semibold">{item.value}건</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        {selectedWeekday === '전체 요일' && (
          <section className="mt-10">
            <p className="text-base font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
            <div className="flex flex-wrap md:flex-no-wrap items-center mt-2 w-full">
              <div className="md:w-[60%] w-[100%] flex">
                <div className="flex flex-col gap-2 mr-2 mt-2 md:mr-10 md:mt-4">
                  {(selectedAreas.length > 0
                    ? regionChartData
                    : chartData.dongComplaintData
                  ).map((item) => (
                    <span
                      key={item.name}
                      className="px-2 md:px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: getRegionColor(item.name) }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
                <SimplePieChart
                  data={
                    selectedAreas.length > 0
                      ? regionChartData
                      : chartData.dongComplaintData
                  }
                  colors={dongComplaintColors}
                />
              </div>
              <div className="flex flex-col gap-2 md:w-[40%] w-[100%]">
                {(selectedAreas.length > 0
                  ? regionChartData
                  : chartData.dongComplaintData
                ).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 pt-1 pb-2 border-b border-[#dcdcdc]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getRegionColor(item.name) }}
                      />
                      <span className="text-md font-semibold">{item.name}</span>
                    </div>
                    <p className="text-md font-semibold">{item.value}건</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        {selectedWeekday === '전체 요일' && (
          <section className="mt-10">
            <p className="font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mt-2 w-full">
              <div className="md:w-[60%] w-[100%] flex">
                <div className="inline-flex flex-col gap-2 md:mr-10 text-center mt-4">
                  {(selectedAreas.length > 0
                    ? regionPosNegData
                    : chartData.complaintData
                  ).map((item) => (
                    <span
                      key={item.name}
                      className="px-2 md:px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: getComplaintColor(item.name) }}
                    >
                      {mapComplaintLabel(item.name)}
                    </span>
                  ))}
                </div>
                <SimplePieChart
                  data={
                    selectedAreas.length > 0
                      ? regionPosNegData
                      : chartData.complaintData
                  }
                  colors={complaintDataColors}
                />
              </div>
              <div className="flex flex-col gap-2 md:w-[40%] w-[100%]">
                {(selectedAreas.length > 0
                  ? regionPosNegData
                  : chartData.complaintData
                ).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 pt-1 pb-2 border-b border-[#dcdcdc]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: getComplaintColor(item.name),
                        }}
                      />
                      <span className="text-md font-semibold">
                        {mapComplaintLabel(item.name)}
                      </span>
                    </div>
                    <p className="text-md font-semibold">{item.value}건</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        {selectedWeekday === '전체 요일' && (
          <section className="mt-10">
            <p className="font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${timeStats.totalComplaints}건`}</h1>
            <div className="mt-5 flex flex-wrap md:flex-nowrap items-center md:justify-between justify-center">
              <div className="mb-10 md:mb-5">
                <SimpleTimeSlotChart
                  data={
                    selectedAreas.length > 0
                      ? regionTimePeriodsData
                      : chartData.timeSlotData
                  }
                  colors={
                    selectedTrashType &&
                    selectedTrashType !== '전체통계' &&
                    selectedTrashType !== '쓰레기 종류'
                      ? [getTrashColor(selectedTrashType)]
                      : Object.values(ColorMappings.trash)
                  }
                />
              </div>
              <div className="flex flex-col items-center md:gap-y-3 w-[95%] ">
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
        )}
        {selectedWeekday === '전체 요일' && (
          <section className="mt-7 md:mt-10">
            <p className="font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${weekdayStats.totalComplaints}건`}</h1>
            <div className="w-full md:-mt-20 flex flex-wrap md:flex-nowrap items-center md:justify-between justify-center">
              <div className="md:mb-0 mb-5">
                <SimpleWeekdayChart
                  data={
                    selectedAreas.length > 0
                      ? regionDaysData
                      : chartData.weekdayData
                  }
                  colors={
                    selectedTrashType &&
                    selectedTrashType !== '전체통계' &&
                    selectedTrashType !== '쓰레기 종류'
                      ? [getTrashColor(selectedTrashType)]
                      : Object.values(ColorMappings.trash)
                  }
                />
              </div>
              <div className="flex flex-col items-center md:gap-y-3 w-[95%] md:ml-5 mt-10 md:mt-0">
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
        )}

        {/* Dedicated weekday time slot section - only shows when specific weekday is selected */}
        {selectedWeekday !== '전체 요일' && timePeriodByDayData && (
          <section className="mt-10">
            <p className="font-semibold text-8d8d8d">
              {selectedWeekday} 시간대별 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">
              {selectedWeekday} 민원 분포
            </h1>
            <div className="mt-5 flex flex-wrap md:flex-nowrap items-center md:justify-between justify-center">
              <div className="mb-10 md:mb-5">
                <SimpleTimeSlotChart
                  data={transformTimePeriodByDayData(
                    timePeriodByDayData,
                    selectedWeekday
                  )}
                  colors={
                    selectedTrashType &&
                    selectedTrashType !== '전체통계' &&
                    selectedTrashType !== '쓰레기 종류'
                      ? [getTrashColor(selectedTrashType)]
                      : ['#59B9FF'] // Default blue color
                  }
                />
              </div>
              <div className="flex flex-col items-center md:gap-y-3 w-[95%]">
                <div className="flex justify-between md:inline">
                  <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                    {selectedWeekday} 시간대별 민원 현황
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-black font-semibold text-sm md:text-lg">
                    총{' '}
                    {transformTimePeriodByDayData(
                      timePeriodByDayData,
                      selectedWeekday
                    ).reduce((sum, item) => sum + Number(item.count), 0)}
                    건
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {(isLoading || regionLoading || timePeriodByDayLoading) && (
          <div className="flex justify-center items-center p-2">
            <div className="text-sm text-gray-600">'통계를 불러오는 중...'</div>
          </div>
        )}

        {(error || regionError || timePeriodByDayError) && (
          <div className="flex justify-center items-center p-4">
            <div className="text-sm text-red-600">
              오류: {error || regionError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintStats;
