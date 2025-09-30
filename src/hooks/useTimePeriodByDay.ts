import { useCallback, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { statisticsService } from '@/services/statisticsService';
import type { TimePeriodByDayResponse } from '@/types/statistics';

export const useTimePeriodByDay = () => {
  const [data, setData] = useState<TimePeriodByDayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimePeriodByDay = useCallback(
    async (dateRange?: DateRange, selectedWeekDay?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await statisticsService.getTimePeriodByDay(
          dateRange,
          selectedWeekDay
        );
        console.log('useTimePeriodByDay:', result);
        setData(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'useTimePeriodByDay - error';
        setError(errorMessage);
        console.log('useTimePeriodByDay 에러:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchTimePeriodByDay,
    clearData,
  };
};
