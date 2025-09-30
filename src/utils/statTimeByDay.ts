import type { BarChartItem } from '@/types/stats';

// Transform time period by day API data to BarChartItem format
interface TimePeriodByDayItem {
  hour: string;
  count: number;
}

interface TimePeriodByDayResponse {
  data: Record<string, TimePeriodByDayItem[]>;
}

// Normalize API hour values like "08:30" -> "8:30" to match chart ticks
const normalizeHour = (value: string): string => {
  const [hh, mm] = value.split(':');
  return `${Number(hh)}:${mm}`;
};

export const transformTimePeriodByDayData = (
  data: TimePeriodByDayResponse,
  selectedWeekday: string
): BarChartItem[] => {
  const weekdayMap: Record<string, string> = {
    월요일: '1',
    화요일: '2',
    수요일: '3',
    목요일: '4',
    금요일: '5',
    토요일: '6',
    일요일: '7',
  };

  const selectedDayNumber = weekdayMap[selectedWeekday];
  const dayData = data?.data?.[selectedDayNumber] || [];

  console.log('Transform debug:', {
    selectedWeekday,
    selectedDayNumber,
    dayData,
    allData: data?.data,
  });

  // Normalize API hour values like "08:30" -> "8:30" to match chart ticks
  const normalizedDayData = dayData.map((item) => ({
    ...item,
    hour: normalizeHour(item.hour),
  }));

  const timeSlots: BarChartItem[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    const hourKey = `${hour}:30`;
    const found = normalizedDayData.find(
      (item: TimePeriodByDayItem) => item.hour === hourKey
    );

    timeSlots.push({
      hour: hourKey,
      time: hourKey,
      count: found ? Number(found.count) : 0,
    });
  }

  console.log('Final transformed timeSlots:', timeSlots);
  return timeSlots;
};
