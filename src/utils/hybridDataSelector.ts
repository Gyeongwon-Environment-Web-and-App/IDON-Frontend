import {
  complaintData,
  complaintTypeData,
  dongComplaintData,
  timeSlotData,
  weekdayData,
} from '@/data/chartData';
import type { TransformedStatisticsData } from '@/types/statistics';

export const getHybridChartData = (
  transformedData: TransformedStatisticsData | null,
  selectedCategory: string | null
) => {
  // If we have API data and a selected category, use transformed data
  if (
    transformedData &&
    selectedCategory &&
    selectedCategory !== '전체통계' &&
    selectedCategory !== '쓰레기 종류'
  ) {
    return {
      complaintTypeData: transformedData.positiveNegatives,
      dongComplaintData: transformedData.regions,
      complaintData: transformedData.positiveNegatives,
      timeSlotData: transformedData.timePeriods,
      weekdayData: transformedData.days,
    };
  }

  return {
    complaintTypeData,
    dongComplaintData,
    complaintData,
    timeSlotData,
    weekdayData,
  };
};

// Helper function to check if we should show the first pie chart
export const shouldShowFirstPieChart = (
  selectedCategory: string | null,
  hasRegionData: boolean = false
): boolean => {
  // Don't show first pie chart if region data is present
  if (hasRegionData) return false;

  return (
    !selectedCategory ||
    selectedCategory === '전체통계' ||
    selectedCategory === '쓰레기 종류'
  );
};
