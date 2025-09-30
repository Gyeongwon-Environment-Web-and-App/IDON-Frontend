import type { ChartDataItem, BarChartItem } from './stats';

export interface StatisticsRequest {
  startDate: string;
  endDate: string;
  categories: string[];
}

export type CategoriesPosNegRequest = StatisticsRequest;

export interface CategoriesDaysRequest extends StatisticsRequest {
  days: number[]; // [1, 2, 3, 4, 5] for weekdays
}

export interface CategoriesTimePeriodsRequest extends StatisticsRequest {
  startTime: string; // "9:30"
  endTime: string; // "17:30"
}

export type CategoriesRegionsRequest = StatisticsRequest;

export interface CategoriesPosNegResponse {
  message: string;
  data: {
    [category: string]: {
      neg: number;
      pos: number;
    };
  };
}

export interface CategoriesDaysResponse {
  message: string;
  data: {
    [category: string]: [{ day: string; count: number }];
  };
}

export interface CategoriesTimePeriodsResponse {
  message: string;
  data: {
    [category: string]: [{ hour: string; count: number }];
  };
}

export interface CategoriesRegionsResponse {
  message: string;
  data: {
    [category: string]: [{ region_nm: string; count: number }];
  };
}

export interface StatisticsData {
  positiveNegatives: CategoriesPosNegResponse;
  days: CategoriesDaysResponse;
  timePeriods: CategoriesTimePeriodsResponse;
  regions: CategoriesRegionsResponse;
}

export interface TransformedStatisticsData {
  positiveNegatives: ChartDataItem[];
  days: BarChartItem[];
  timePeriods: BarChartItem[];
  regions: ChartDataItem[];
}

export interface HybridChartData {
  complaintTypeData: ChartDataItem[];
  dongComplaintData: ChartDataItem[];
  complaintData: ChartDataItem[];
  timeSlotData: BarChartItem[];
  weekdayData: BarChartItem[];
}

export interface TimerPeriodByDayRequest {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: number[];
}

export interface TimePeriodByDayResponse {
  message: string;
  data: {
    [key:string]: TimePeriodResponseFormat[];
  }
}

export interface TimePeriodResponseFormat {
  hour: string;
  count: number;
}