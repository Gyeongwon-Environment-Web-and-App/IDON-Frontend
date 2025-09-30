import { useMemo } from 'react';

import type { TransformedStatisticsData } from '@/types/statistics';
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
import { transformTimePeriodByDayData } from '@/utils/statTimeByDay';

// Enhanced color system with fallbacks
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
  return labelMap[label] || label;
};

// Color getter functions
const getTrashColor = (name: string) =>
  ColorMappings.trash[name] || ColorMappings.special[name] || '#000000';

const getRegionColor = (name: string) =>
  ColorMappings.regions[name] || '#cccccc';

const getComplaintColor = (name: string) =>
  ColorMappings.complaints[name] || '#cccccc';

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

interface UseComplaintChartsParams {
  transformedData: TransformedStatisticsData | null;
  regionData: any;
  selectedAreas: string[];
  selectedTrashType: string;
  timePeriodByDayData: any;
  selectedWeekday: string;
}

export const useComplaintCharts = ({
  transformedData,
  regionData,
  selectedAreas,
  selectedTrashType,
  timePeriodByDayData,
  selectedWeekday,
}: UseComplaintChartsParams) => {
  // 메모화된 차트 데이터 계산
  const chartData = useMemo(
    () => getHybridChartData(transformedData, selectedTrashType),
    [transformedData, selectedTrashType]
  );

  const showFirstPieChart = useMemo(
    () => shouldShowFirstPieChart(selectedTrashType, selectedAreas.length > 0),
    [selectedTrashType, selectedAreas.length]
  );

  // Transform region data for charts
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

  // Transform time period by day data
  const weekdayTimeSlotData = useMemo(() => {
    if (selectedWeekday !== '전체 요일' && timePeriodByDayData) {
      return transformTimePeriodByDayData(timePeriodByDayData, selectedWeekday);
    }
    return [];
  }, [timePeriodByDayData, selectedWeekday]);

  // 가장 많고 적은 민원 시간대 계산
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

  // 메모화된 색상 배열들
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

  const getTrashTypeColor = (type: string) => {
    return getTrashColor(type) || 'black';
  };

  return {
    // Chart data
    chartData,
    regionPosNegData,
    regionDaysData,
    regionTimePeriodsData,
    regionChartData,
    weekdayTimeSlotData,

    // Stats
    timeStats,
    weekdayStats,

    // Colors
    complaintTypeColors,
    dongComplaintColors,
    complaintDataColors,
    getTrashTypeColor,
    getTrashColor,
    getRegionColor,
    getComplaintColor,
    mapComplaintLabel,

    // Flags
    showFirstPieChart,

    // Color mappings for external use
    ColorMappings,
  };
};
