import type {
  CategoriesDaysResponse,
  CategoriesPosNegResponse,
  CategoriesRegionsResponse,
  CategoriesTimePeriodsResponse,
} from '@/types/statistics';
import type { BarChartItem, ChartDataItem } from '@/types/stats';

export const transformPosNegToChartData = (
  response: CategoriesPosNegResponse,
  selectedCategory: string
): ChartDataItem[] => {
  if (!response.data[selectedCategory]) {
    return [];
  }

  const categoryData = response.data[selectedCategory];
  const chartData: ChartDataItem[] = [];

  // Only include non-zero values
  if (categoryData.neg > 0) {
    chartData.push({ name: '부정적', value: categoryData.neg });
  }
  if (categoryData.pos > 0) {
    chartData.push({ name: '긍정적', value: categoryData.pos });
  }

  return chartData;
};

export const transformDaysToBarChartData = (
  response: CategoriesDaysResponse,
  selectedCategory: string
): BarChartItem[] => {
  if (!response.data[selectedCategory]) {
    return [];
  }

  const dayData = response.data[selectedCategory];
  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일'];

  const dayMap = new Map();
  dayNames.forEach((name, index) => {
    dayMap.set(index + 1, { time: name, count: 0 });
  });

  dayData.forEach((item) => {
    const dayIndex = parseInt(item.day);
    if (dayMap.has(dayIndex)) {
      dayMap.set(dayIndex, {
        time: dayNames[dayIndex - 1],
        count: item.count
      });
    }    
  });

  return Array.from(dayMap.values());
};

export const transformTimePeriodsToBarChartData = (
  response: CategoriesTimePeriodsResponse,
  selectedCategory: string
): BarChartItem[] => {
  if (!response.data[selectedCategory]) {
    return [];
  }
  const timeData = response.data[selectedCategory];
  return timeData.map((item) => ({
    time: item.hour,
    [selectedCategory]: item.count,
  }));
};

export const transformRegionsToChartData = (
  response: CategoriesRegionsResponse,
  selectedCategory: string
): ChartDataItem[] => {
  if (!response.data[selectedCategory]) {
    return [];
  }
  const regionData = response.data[selectedCategory];
  return regionData.map((item) => ({
    name: item.region_nm,
    value: item.count,
  }));
};
