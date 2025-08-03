import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ko } from "date-fns/locale";
import attentionRed from "../assets/icons/attention_red.svg";
import redo from "../assets/icons/redo.svg";

function formatDateTime(date: Date) {
  // 연, 월, 일
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // 오전/오후, 시, 분
  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const isAM = hour < 12;
  const ampm = isAM ? "오전" : "오후";
  if (!isAM) hour = hour === 12 ? 12 : hour - 12;
  if (hour === 0) hour = 12;

  return {
    date: `${year} . ${month}. ${day}`,
    time: `${ampm} ${hour}:${minute}`,
  };
}

interface DateTimeBoxProps {
  visible: boolean;
  repeat: boolean;
  onBack?: () => void;
}

export default function DateTimeBox({
  visible,
  repeat,
  onBack,
}: DateTimeBoxProps) {
  const [now] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(now);
  const [open, setOpen] = useState(false);
  const { date, time } = formatDateTime(selectedDate || now);

  return (
    <div className="flex items-center md:justify-between justify-center gap-2 px-6 py-3 border-b border-light-border w-full">
      <div className="flex justify-between items-center">
        <span className="font-bold xs:text-xl mr-2">
          {selectedDate ? formatDateTime(selectedDate).date : date}
        </span>
        <span className="text-gray-400 text-sm">{time}</span>
        {visible ? (
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
                  date > new Date() || date < new Date("1900-01-01")
                }
                className="custom-calendar"
              />
            </PopoverContent>
          </Popover>
        ) : (
          <>
            <img
              src={redo}
              alt="뒤로가기 아이콘"
              className="ml-2 cursor-pointer bg-efefef rounded"
              onClick={onBack}
            />
          </>
        )}
      </div>
      {repeat && (
        <div className="flex items-center">
          <img src={attentionRed} alt="반복 민원 아이콘" className="w-6 h-6" />
          <p className="text-red ml-1">반복 민원</p>
        </div>
      )}
    </div>
  );
}
