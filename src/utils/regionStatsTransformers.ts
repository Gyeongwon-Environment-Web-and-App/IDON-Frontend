import type {
  RegionDaysResponse,
  RegionPosNegResponse,
  RegionTimePeriodsResponse,
} from '@/services/regionStatisticsService';
import type { BarChartItem, ChartDataItem } from '@/types/stats';

// Transform region positive/negative data to chart format
export const transformRegionPosNegToChartData = (
  response: RegionPosNegResponse | null
): ChartDataItem[] => {
  if (!response?.data) {
    return [];
  }

  const chartData: ChartDataItem[] = [];

  // Aggregate all regions' positive and negative values
  let totalPos = 0;
  let totalNeg = 0;

  Object.values(response.data).forEach((regionData) => {
    totalPos += regionData.pos;
    totalNeg += regionData.neg;
  });

  if (totalPos > 0) {
    chartData.push({ name: '긍정적', value: totalPos });
  }
  if (totalNeg > 0) {
    chartData.push({ name: '부정적', value: totalNeg });
  }

  return chartData;
};

// Transform region days data to bar chart format
export const transformRegionDaysToBarChartData = (
  response: RegionDaysResponse | null
): BarChartItem[] => {
  if (!response?.data) {
    return [];
  }

  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일'];
  const dayTotals: Record<string, number> = {};

  // Aggregate counts by day across all regions
  Object.values(response.data).forEach((regionDays) => {
    regionDays.forEach((dayData) => {
      const dayName = dayNames[dayData.day - 1] || `Day ${dayData.day}`;
      dayTotals[dayName] = (dayTotals[dayName] || 0) + dayData.count;
    });
  });

  // Convert to BarChartItem format
  return Object.entries(dayTotals).map(([day, count]) => ({
    time: day,
    전체: count,
  }));
};

// Transform region time periods data to bar chart format
export const transformRegionTimePeriodsToBarChartData = (
  response: RegionTimePeriodsResponse | null
): BarChartItem[] => {
  if (!response?.data) {
    return [];
  }

  const timeTotals: Record<string, number> = {};

  // Aggregate counts by time period across all regions
  Object.values(response.data).forEach((regionTimePeriods) => {
    regionTimePeriods.forEach((timeData) => {
      timeTotals[timeData.hour] =
        (timeTotals[timeData.hour] || 0) + timeData.count;
    });
  });

  // Convert to BarChartItem format and sort by time
  return Object.entries(timeTotals)
    .map(([hour, count]) => ({
      time: hour,
      전체: count,
    }))
    .sort((a, b) => {
      // Sort by time (HH:MM format)
      const timeA = a.time.replace(':', '');
      const timeB = b.time.replace(':', '');
      return timeA.localeCompare(timeB);
    });
};

// Transform region data to individual region chart data (for region-specific pie charts)
export const transformRegionDataToRegionChartData = (
  response: RegionPosNegResponse | null
): ChartDataItem[] => {
  if (!response?.data) {
    return [];
  }

  return Object.entries(response.data).map(([regionName, data]) => ({
    name: regionName,
    value: data.pos + data.neg,
  }));
};
