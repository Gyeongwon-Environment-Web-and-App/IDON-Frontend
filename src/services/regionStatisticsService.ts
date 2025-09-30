import type { DateRange } from 'react-day-picker';

import apiClient from '@/lib/api';

// API Request/Response Types
export interface RegionStatisticsRequest {
  startDate: string;
  endDate: string;
  region_names: string[];
}

export interface RegionTimePeriodsRequest extends RegionStatisticsRequest {
  startTime: string;
  endTime: string;
}

export interface RegionPosNegResponse {
  message: string;
  data: Record<string, { pos: number; neg: number }>;
}

export interface RegionDaysResponse {
  message: string;
  data: Record<string, Array<{ day: number; count: number }>>;
}

export interface RegionTimePeriodsResponse {
  message: string;
  data: Record<string, Array<{ hour: string; count: number }>>;
}

// Helper function to format date for API
const formatDate = (date: Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  return dateObj.toISOString();
};

// Helper function to get date range from picker
const getDateRangeFromPicker = (dateRange: DateRange | undefined) => {
  const today = new Date();

  if (!dateRange?.from || !dateRange?.to) {
    // Default: one month before to today
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      startDate: formatDate(oneMonthAgo),
      endDate: formatDate(today),
    };
  }

  return {
    startDate: formatDate(dateRange.from),
    endDate: formatDate(dateRange.to),
  };
};

// Helper function to get time range from selected timeline
const getTimeRangeFromTimeline = (selectedTimeline: string) => {
  if (selectedTimeline === '전체 시간대') {
    return { startTime: '08:30', endTime: '17:30' };
  }

  // Extract time range from selected timeline (e.g., "8:30-9:30")
  const timeMatch = selectedTimeline.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
  if (timeMatch) {
    return {
      startTime: timeMatch[1].padStart(5, '0'), // Ensure HH:MM format
      endTime: timeMatch[2].padStart(5, '0'),
    };
  }

  // Default fallback
  return { startTime: '08:30', endTime: '17:30' };
};

// Helper function to convert area selection to region names
const convertAreasToRegionNames = (selectedAreas: string[]): string[] => {
  if (selectedAreas.length === 0) {
    // Return all available regions if no specific areas selected
    return ['쌍문1동', '쌍문2동', '쌍문3동', '쌍문4동', '방학1동', '방학3동'];
  }

  // Convert area names to region names (remove spaces)
  return selectedAreas.map((area) => area.replace(/\s+/g, ''));
};

export const regionStatisticsService = {
  async getRegionPosNeg(
    selectedAreas: string[],
    dateRange?: DateRange
  ): Promise<RegionPosNegResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const regionNames = convertAreasToRegionNames(selectedAreas);

      const request: RegionStatisticsRequest = {
        startDate,
        endDate,
        region_names: regionNames,
      };

      const response = await apiClient.post<RegionPosNegResponse>(
        '/stat/regions_positive_negatives',
        request
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error fetching region positive/negative statistics:',
        error
      );
      throw error;
    }
  },

  async getRegionDays(
    selectedAreas: string[],
    dateRange?: DateRange
  ): Promise<RegionDaysResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const regionNames = convertAreasToRegionNames(selectedAreas);

      const request: RegionStatisticsRequest = {
        startDate,
        endDate,
        region_names: regionNames,
      };

      const response = await apiClient.post<RegionDaysResponse>(
        '/stat/regions_days',
        request
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching region days statistics:', error);
      throw error;
    }
  },

  async getRegionTimePeriods(
    selectedAreas: string[],
    selectedTimeline: string,
    dateRange?: DateRange
  ): Promise<RegionTimePeriodsResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const { startTime, endTime } = getTimeRangeFromTimeline(selectedTimeline);
      const regionNames = convertAreasToRegionNames(selectedAreas);

      const request: RegionTimePeriodsRequest = {
        startDate,
        endDate,
        startTime,
        endTime,
        region_names: regionNames,
      };

      const response = await apiClient.post<RegionTimePeriodsResponse>(
        '/stat/regions_time_periods',
        request
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching region time periods statistics:', error);
      throw error;
    }
  },
};
