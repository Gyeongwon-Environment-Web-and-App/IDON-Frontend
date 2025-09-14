import React, { useState } from "react";
import type { Complaint } from "../../types/complaint";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import Popup from "../forms/Popup";
import food from "../../assets/icons/categories/tags/food.svg";
import general from "../../assets/icons/categories/tags/general.svg";
import other from "../../assets/icons/categories/tags/other.svg";
import recycle from "../../assets/icons/categories/tags/recycle.svg";
import attentionRed from "../../assets/icons/common/attention_red.svg";
import { formatDateToYYMMDD } from "@/utils/formatDateToYYMMDD";

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange?: (complaintId: string) => void;
  isSelected?: boolean;
  onSelectChange?: (complaintId: string, selected: boolean) => void;
  onCardClick?: (id: string) => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onStatusChange,
  isSelected = false,
  onSelectChange,
  onCardClick,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const bad = complaint.source?.bad || false;

  const handleStatusClick = () => {
    setIsPopupOpen(true);
  };

  const handleConfirmStatusChange = () => {
    onStatusChange?.(complaint.id);
    setIsPopupOpen(false);
  };

  const handleCancelStatusChange = () => {
    setIsPopupOpen(false);
  };

  const getPopupMessage = () => {
    if (complaint.status === "처리중") {
      return (
        <>
          <p className="pb-2">
            처리결과를 <span className="text-darker-green">완료</span>로
          </p>
          <p>수정하시겠습니까?</p>
        </>
      );
    } else if (complaint.status === "완료") {
      return (
        <>
          <p className="pb-2">
            처리결과를 <span className="text-[#8E8E8E]">처리중</span>으로
          </p>
          <p>되돌리시겠습니까?</p>
        </>
      );
    }
    return "";
  };

  const truncateString = (str: string, maxLength: number) => {
    if (str.length <= maxLength) {
      return str;
    } else {
      return str.slice(0, maxLength - 3) + "...";
    }
  };

  return (
    <div
      className="bg-white border border-[#A2A2A2] rounded-lg flex justify-between cursor-pointer hover:bg-gray-50"
      onClick={(e) => {
        // Prevent card click when clicking on checkboxes or status buttons
        if (e.target instanceof HTMLElement) {
          const isInteractive = e.target.closest(
            'input[type="checkbox"], button, [role="button"]'
          );
          if (!isInteractive && onCardClick) {
            onCardClick(complaint.id);
          }
        }
      }}
    >
      <div className="flex flex-col justify-around p-3">
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => onSelectChange?.(complaint.id, !!value)}
          />
          <span className="font-medium">{complaint.number}</span>
          <Separator orientation="vertical" className="h-4" />
          {formatDateToYYMMDD(complaint.date)}
          <Separator orientation="vertical" className="h-4" />
          {complaint.region_nm}
          <img
            src={bad ? attentionRed : ""}
            alt="악성민원 태그"
            className="w-5"
          />
        </div>
        <div className="flex font-bold text-lg">
          <img
            src={
              complaint.type === "재활용"
                ? recycle
                : complaint.type === "일반"
                  ? general
                  : complaint.type === "음식물"
                    ? food
                    : other
            }
            alt="쓰레기 상성 태그"
            className="mr-2"
          />
          {truncateString(complaint.content, 14)}
        </div>
      </div>
      <div
        className={`flex items-center font-semibold justify-center text-center text-white cursor-pointer w-16 text-base rounded-r ${
          complaint.status === "완료" ? "bg-light-green" : "bg-[#B1B1B1]"
        }`}
        onClick={handleStatusClick}
      >
        {complaint.status}
      </div>

      {isPopupOpen && (
        <Popup
          message={getPopupMessage()}
          yesNo={true}
          onFirstClick={handleConfirmStatusChange}
          onSecondClick={handleCancelStatusChange}
          toHome={false}
        />
      )}
    </div>
  );
};

export default ComplaintCard;
