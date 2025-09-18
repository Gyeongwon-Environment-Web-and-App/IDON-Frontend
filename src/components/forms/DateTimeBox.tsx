import { useEffect, useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ko } from '@/lib/locales';

import redo from '../../assets/icons/actions/redo.svg';
import attentionRed from '../../assets/icons/common/attention_red.svg';
import { useComplaintFormStore } from '../../stores/complaintFormStore';
import { formatDateTime } from '../../utils/formatDate';

interface DateTimeBoxProps {
  visible: boolean;
  repeat: boolean;
  onBack?: () => void;
  readOnly?: boolean;
  date?: Date;
}

export default function DateTimeBox({
  visible,
  repeat,
  onBack,
  readOnly = false,
  date,
}: DateTimeBoxProps) {
  const { formData, updateFormData } = useComplaintFormStore();
  const [now] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (readOnly) {
      return date || now;
    }
    return formData.datetime ? new Date(formData.datetime) : now;
  });
  const [open, setOpen] = useState(false);

  const displayDate = readOnly ? date || now : selectedDate || now;
  const { date: formattedDate, time } = formatDateTime(displayDate);

  useEffect(() => {
    if (!readOnly && selectedDate) {
      updateFormData({ datetime: selectedDate.toISOString() });
    }
  }, [selectedDate, updateFormData, readOnly]);

  return (
    <div className="flex items-center md:justify-between justify-start md:gap-2 md:px-6 py-3 md:border-b md:border-light-border w-full">
      <div className="flex justify-between items-center">
        <span className="font-bold xs:text-xl text-md mr-2">
          {formattedDate}
        </span>
        <span className="text-gray-400 text-sm">{time}</span>
        {!readOnly && visible ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="border border-darker-green ml-2 px-2 py-1 text-xs rounded-[2.77px] bg-darker-green text-white cursor-pointer">
                수정하기
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 custom-calendar">
              <Calendar
                locale={ko}
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  const prev = selectedDate || now;
                  const newDate = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    prev.getHours(),
                    prev.getMinutes(),
                    prev.getSeconds(),
                    prev.getMilliseconds()
                  );
                  setSelectedDate(newDate);
                  setOpen(false);
                }}
                captionLayout="dropdown"
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
                className="custom-calendar"
              />
            </PopoverContent>
          </Popover>
        ) : (
          !readOnly && (
            <>
              <img
                src={redo}
                alt="뒤로가기 아이콘"
                className="ml-2 cursor-pointer bg-efefef rounded xxs:mr-4 md:mr-0"
                onClick={onBack}
              />
            </>
          )
        )}
      </div>
      {repeat && (
        <div className="flex items-center">
          <img
            src={attentionRed}
            alt="반복 민원 아이콘"
            className="w-5 h-5 md:w-6 md:h-6"
          />
          <p className="text-red text-sm ml-1">반복 민원</p>
        </div>
      )}
    </div>
  );
}
