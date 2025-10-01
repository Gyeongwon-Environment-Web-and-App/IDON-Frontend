import { useCallback, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { regionStatisticsService } from '@/services/regionStatisticsService';
import type {
  RegionDaysResponse,
  RegionPosNegResponse,
  RegionTimePeriodsResponse,
} from '@/services/regionStatisticsService';

// Parent areas that should be filtered out from API calls
const PARENT_AREAS = ['쌍문동', '방학동'];

// Utility function to filter out parent areas from selected areas
const filterOutParentAreas = (areas: string[]): string[] => {
  return areas.filter((area) => !PARENT_AREAS.includes(area));
};

export interface RegionStatisticsData {
  posNeg: RegionPosNegResponse | null;
  days: RegionDaysResponse | null;
  timePeriods: RegionTimePeriodsResponse | null;
}

export const useRegionStatistics = () => {
  const [regionData, setRegionData] = useState<RegionStatisticsData>({
    posNeg: null,
    days: null,
    timePeriods: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegionStatistics = useCallback(
    async (
      selectedAreas: string[],
      selectedTimeline: string,
      dateRange?: DateRange
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        // Filter out parent areas before making API calls
        const filteredAreas = filterOutParentAreas(selectedAreas);

        // Fetch all three API endpoints in parallel
        const [posNegResponse, daysResponse, timePeriodsResponse] =
          await Promise.all([
            regionStatisticsService.getRegionPosNeg(filteredAreas, dateRange),
            regionStatisticsService.getRegionDays(filteredAreas, dateRange),
            regionStatisticsService.getRegionTimePeriods(
              filteredAreas,
              selectedTimeline,
              dateRange
            ),
          ]);

        setRegionData({
          posNeg: posNegResponse,
          days: daysResponse,
          timePeriods: timePeriodsResponse,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '지역 통계 불러오기 실패';
        setError(errorMessage);
        console.error('useRegionStatistics 에러:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearRegionStatistics = useCallback(() => {
    setRegionData({
      posNeg: null,
      days: null,
      timePeriods: null,
    });
    setError(null);
  }, []);

  return {
    regionData,
    isLoading,
    error,
    fetchRegionStatistics,
    clearRegionStatistics,
  };
};
