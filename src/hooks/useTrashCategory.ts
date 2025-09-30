import { useCallback, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { statisticsService } from '@/services/statisticsService';
import type {
  StatisticsData,
  TransformedStatisticsData,
} from '@/types/statistics';
import {
  transformDaysToBarChartData,
  transformPosNegToChartData,
  transformRegionsToChartData,
  transformTimePeriodsToBarChartData,
} from '@/utils/statsTransformers';

export const useTrashCategory = () => {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null
  );
  const [transformedData, setTransformedData] =
    useState<TransformedStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchStatistics = useCallback(
    async (categories: string[], dateRange?: DateRange) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await statisticsService.getAllStatistics(
          categories,
          dateRange
        );
        setStatisticsData(data);
        setSelectedCategory(categories[0]);

        const transformed: TransformedStatisticsData = {
          positiveNegatives: transformPosNegToChartData(
            data.positiveNegatives,
            categories[0]
          ),
          days: transformDaysToBarChartData(data.days, categories[0]),
          timePeriods: transformTimePeriodsToBarChartData(
            data.timePeriods,
            categories[0]
          ),
          regions: transformRegionsToChartData(data.regions, categories[0]),
        };

        setTransformedData(transformed);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '쓰레기 상성 통계 불러오기 실패';
        setError(errorMessage);
        console.log('useTrashCategory 에러:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearStatistics = useCallback(() => {
    setStatisticsData(null);
    setTransformedData(null);
    setSelectedCategory(null);
    setError(null);
  }, []);

  return {
    statisticsData,
    transformedData,
    selectedCategory,
    isLoading,
    error,
    fetchStatistics,
    clearStatistics,
  };
};
