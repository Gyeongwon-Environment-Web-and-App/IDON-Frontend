import { useEffect, useMemo, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { statisticsService } from '@/services/statisticsService';

type PieDatum = { name: string; value: number };

interface UseInitialStatsForPiesParams {
  dateRange?: DateRange;
  selectedAreas: string[];
}

interface UseInitialStatsForPiesResult {
  categoryPie: PieDatum[];
  regionPie: PieDatum[];
  loading: boolean;
  error: string | null;
  // Reserved for future charts to reuse same fetch window
  rawCategories: Record<string, { count: number }> | null;
  rawRegions: Record<string, { count: number }> | null;
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

export function useInitialStatsForPies({
  dateRange,
  selectedAreas,
}: UseInitialStatsForPiesParams): UseInitialStatsForPiesResult {
  const [categoryPie, setCategoryPie] = useState<PieDatum[]>([]);
  const [regionPie, setRegionPie] = useState<PieDatum[]>([]);
  const [rawCategories, setRawCategories] = useState<Record<
    string,
    { count: number }
  > | null>(null);
  const [rawRegions, setRawRegions] = useState<Record<
    string,
    { count: number }
  > | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const regionsPayload = useMemo(() => {
    return selectedAreas && selectedAreas.length > 0
      ? // Normalize possible names like '쌍문 1동' -> '쌍문1동'
        selectedAreas.map((name) => name.replace(/\s+/g, ''))
      : DEFAULT_REGIONS;
  }, [selectedAreas]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriesResp, regionsResp] = await Promise.all([
          statisticsService.getAllByCategories(DEFAULT_CATEGORIES, dateRange),
          statisticsService.getAllByRegions(regionsPayload, dateRange),
        ]);

        if (!isMounted) return;

        const catData = categoriesResp.data || {};
        const regData = regionsResp.data || {};

        setRawCategories(catData);
        setRawRegions(regData);

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

  return { categoryPie, regionPie, loading, error, rawCategories, rawRegions };
}
