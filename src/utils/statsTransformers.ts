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
  return [
    { name: '부정적', value: categoryData.neg },
    { name: '긍정적', value: categoryData.pos },
  ];
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

  return dayData.map((item, index) => ({
    time: dayNames[index] || `Day ${index + 1}`,
    [selectedCategory]: item.count,
  }));
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
