export interface ChartDataItem {
  name: string;
  value: number;
}

export interface BarChartItem {
  time: string;
  [key: string]: string | number; // 동적 속성을 허용
}

export interface Stats {
  complaintTypeData: ChartDataItem[];
}

export interface PieChartProps {
  data: ChartDataItem[];
  colors: string[];
}

export interface BarChartProps {
  data: BarChartItem[];
  colors: string[];
}
