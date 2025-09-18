import React, { useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ko } from '@/lib/locales';

import calendar from '../../assets/icons/categories/map_categories/calendar.svg';

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  placeholder,
  className = '',
  containerClassName = '',
}) => {
  const [open, setOpen] = useState(false);

  const formatDateDisplay = () => {
    if (
      dateRange?.from &&
      dateRange?.to &&
      dateRange.from instanceof Date &&
      dateRange.to instanceof Date
    ) {
      const from = dateRange.from;
      const to = dateRange.to;

      // 같은 년도, 같은 달이고, 시작일이 1일이고, 종료일이 해당 달의 마지막 날인지 확인
      const isFullMonth =
        from.getFullYear() === to.getFullYear() &&
        from.getMonth() === to.getMonth() &&
        from.getDate() === 1 &&
        to.getDate() ===
          new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();

      const isSameDate =
        from.getFullYear() === to.getFullYear() &&
        from.getMonth() === to.getMonth() &&
        from.getDate() === to.getDate();

      if (isFullMonth) {
        return `${from.getFullYear()}. ${from.getMonth() + 1}`;
      } else if (isSameDate) {
        return `${from.getFullYear()}.${from.getMonth() + 1}.${from.getDate()}`;
      } else {
        return `${from.getFullYear()}.${from.getMonth() + 1}.${from.getDate()} - ${to.getFullYear()}.${to.getMonth() + 1}.${to.getDate()}`;
      }
    }
    return (
      placeholder ||
      `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate()}`
    );
  };

  return (
    <div className={`inline-flex items-center ${containerClassName}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="inline-flex items-center cursor-pointer">
            <Button className="cursor-pointer bg-white outline-none shadow-none p-0 hover:bg-white">
              <img
                src={calendar}
                alt="캘린더 아이콘"
                className="h-5 w-5 md:h-6 md:w-6"
              />
            </Button>
            <span
              className={`text-base font-medium md:text-xl md:font-semibold ml-2 ${className}`}
            >
              {formatDateDisplay()}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              onDateRangeChange(range);
            }}
            locale={ko}
            captionLayout="dropdown"
            disabled={(date) =>
              date > new Date() || date < new Date('1900-01-01')
            }
            className="rounded-md border custom-calendar"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
