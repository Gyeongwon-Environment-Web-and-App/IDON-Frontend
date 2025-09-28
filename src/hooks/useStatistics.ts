import { useCallback, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { statisticsService } from '@/services/statisticsService';
import type { StatisticsData } from '@/types/statistics';


export const useStatistics = () => {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(
    async (categories:string[], dateRange?: DateRange) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await statisticsService.getAllStatistics(categories, dateRange);
        setStatisticsData(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '쓰레기 상성 통계 불러오기 실패';
        setError(errorMessage);
        console.log('useStatistics 에러:', error);
      } finally {
        setIsLoading(false);
      }
    }, []
  );

  const clearStatistics = useCallback(() => {
    setStatisticsData(null);
    setError(null);
  }, [])

  return {
    statisticsData,
    isLoading,
    error,
    fetchStatistics,
    clearStatistics,
  };
}