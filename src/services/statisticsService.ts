import type { DateRange } from 'react-day-picker';

import apiClient from '@/lib/api';
import type {
  CategoriesDaysRequest,
  CategoriesDaysResponse,
  CategoriesPosNegRequest,
  CategoriesPosNegResponse,
  CategoriesRegionsRequest,
  CategoriesRegionsResponse,
  CategoriesTimePeriodsRequest,
  CategoriesTimePeriodsResponse,
  StatisticsData,
} from '@/types/statistics';

const getDefaultDateRange = (): { startDate: string; endDate: string } => {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  return {
    startDate: oneMonthAgo.toISOString(),
    endDate: today.toISOString(),
  };
};

const getDateRangeFromPicker = (
  dateRange?: DateRange
): { startDate: string; endDate: string } => {
  if (dateRange?.from && dateRange?.to) {
    return {
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
    };
  }
  return getDefaultDateRange();
};

export const statisticsService = {
  async getCategoriesPosNeg(
    categories: string[],
    dateRange?: DateRange
  ): Promise<CategoriesPosNegResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const requestBody: CategoriesPosNegRequest = {
        startDate,
        endDate,
        categories,
      };
      const response = await apiClient.post<CategoriesPosNegResponse>(
        '/stat/categories_positive_negatives',
        requestBody
      );
      return response.data;
    } catch (error) {
      console.error('반복민원 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getCategoriesDays(
    categories: string[],
    dateRange?: DateRange
  ): Promise<CategoriesDaysResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const requestBody: CategoriesDaysRequest = {
        startDate,
        endDate,
        categories,
        days: [1, 2, 3, 4, 5],
      };

      const response = await apiClient.post<CategoriesDaysResponse>(
        '/stat/categories_days',
        requestBody
      );

      return response.data;
    } catch (error) {
      console.error('요일별 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getCategoriesTimePeriods(
    categories: string[],
    dateRange?: DateRange
  ): Promise<CategoriesTimePeriodsResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const requestBody: CategoriesTimePeriodsRequest = {
        startDate,
        endDate,
        categories,
        startTime: '9:30',
        endTime: '17:30',
      };

      const response = await apiClient.post<CategoriesTimePeriodsResponse>(
        '/stat/categories_time_periods',
        requestBody
      );

      return response.data;
    } catch (error) {
      console.error('시간대별 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getCategoriesRegions(
    categories: string[],
    dateRange?: DateRange
  ): Promise<CategoriesRegionsResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const requestBody: CategoriesRegionsRequest = {
        startDate,
        endDate,
        categories,
      };

      const response = await apiClient.post<CategoriesRegionsResponse>(
        '/stat/categories_regions',
        requestBody
      );

      return response.data;
    } catch (error) {
      console.error('동별 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getAllStatistics(
    categories: string[],
    dateRange?: DateRange
  ): Promise<StatisticsData> {
    try {
      console.log(`🌐 ${categories.join(' ')}의 통계 정보 불러오기`);
      const [positiveNegatives, days, timePeriods, regions] = await Promise.all(
        [
          this.getCategoriesPosNeg(categories, dateRange),
          this.getCategoriesDays(categories, dateRange),
          this.getCategoriesTimePeriods(categories, dateRange),
          this.getCategoriesRegions(categories, dateRange),
        ]
      );

      const result: StatisticsData = {
        positiveNegatives,
        days,
        timePeriods,
        regions,
      };
      console.log(`✅ 모든 통계 fetch 성공:`, result);
      return result;
    } catch (error) {
      console.log(
        `😈 ${categories.join(' ')}의 통계 정보 불러오기 실패: ${error}`
      );
      throw error;
    }
  },
};
