import { useEffect, useMemo, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { statisticsService } from '@/services/statisticsService';
import type { BarChartItem } from '@/types/stats';

type PieDatum = { name: string; value: number };

interface UseInitialStatsForPiesParams {
  dateRange?: DateRange;
  selectedAreas: string[];
}

interface UseInitialStatsForPiesResult {
  categoryPie: PieDatum[];
  regionPie: PieDatum[];
  daysBar: BarChartItem[];
  loading: boolean;
  error: string | null;
  rawCategories: Record<string, { count: number }> | null;
  rawRegions: Record<string, { count: number }> | null;
  rawDays: Record<string, { count: number }> | null;
}

const DEFAULT_CATEGORIES = ['일반', '재활용', '음식물', '기타'];
const DEFAULT_REGIONS = [
  '쌍문1동',
  '쌍문2동',
  '쌍문3동',
  '쌍문4동',
  '방학1동',
  '방학3동',
];

const PARENT_AREAS = ['쌍문동', '방학동'];

const filterOutParentAreas = (areas: string[]): string[] => {
  return areas.filter((area) => !PARENT_AREAS.includes(area));
};

export function useInitialStatsForPies({
  dateRange,
  selectedAreas,
}: UseInitialStatsForPiesParams): UseInitialStatsForPiesResult {
  const [categoryPie, setCategoryPie] = useState<PieDatum[]>([]);
  const [regionPie, setRegionPie] = useState<PieDatum[]>([]);
  const [daysBar, setDaysBar] = useState<BarChartItem[]>([]);
  const [rawCategories, setRawCategories] = useState<Record<
    string,
    { count: number }
  > | null>(null);
  const [rawRegions, setRawRegions] = useState<Record<
    string,
    { count: number }
  > | null>(null);
  const [rawDays, setRawDays] = useState<Record<
    string,
    { count: number }
  > | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const regionsPayload = useMemo(() => {
    if (selectedAreas && selectedAreas.length > 0) {
      // '쌍문 1동' -> '쌍문1동'
      const filteredAreas = filterOutParentAreas(selectedAreas);
      return filteredAreas.map((name) => name.replace(/\s+/g, ''));
    }
    return DEFAULT_REGIONS;
  }, [selectedAreas]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriesResp, regionsResp, daysResp] = await Promise.all([
          statisticsService.getAllByCategories(DEFAULT_CATEGORIES, dateRange),
          statisticsService.getAllByRegions(regionsPayload, dateRange),
          statisticsService.getAllByDays(dateRange),
        ]);

        if (!isMounted) return;

        const catData = categoriesResp.data || {};
        const regData = regionsResp.data || {};
        const daysData = daysResp.data || {};

        setRawCategories(catData);
        setRawRegions(regData);
        setRawDays(daysData);

        setCategoryPie(
          Object.entries(catData).map(([name, v]) => ({
            name,
            value: Number(v?.count ?? 0),
          }))
        );

        const regionArray = Object.entries(regData).map(([name, v]) => ({
          name,
          value: Number(v?.count ?? 0),
        }));

        // Sort regions according to the request payload order (regionsPayload)
        const order = regionsPayload;
        const orderedRegionArray = regionArray.sort((a, b) => {
          const ai = order.indexOf(a.name);
          const bi = order.indexOf(b.name);
          const ax = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
          const bx = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
          return ax - bx;
        });

        setRegionPie(orderedRegionArray);

        const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일'];
        const daysArray = Object.entries(daysData).map(([dayNum, v]) => ({
          time: dayNames[parseInt(dayNum) - 1] || `Day ${dayNum}`,
          count: Number(v?.count ?? 0),
        }));

        setDaysBar(daysArray);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : 'Failed to load initial stats';
        setError(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [dateRange, dateRange?.from, dateRange?.to, regionsPayload]);

  return {
    categoryPie,
    regionPie,
    daysBar,
    loading,
    error,
    rawCategories,
    rawRegions,
    rawDays,
  };
}
