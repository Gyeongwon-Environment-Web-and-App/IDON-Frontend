import React, { useState } from "react";
import triangle from "../../assets/icons/actions/triangle.svg";
import ComplaintListCard from "./ComplaintListCard";
import { AreaDropdown } from "@/components/ui/AreaDropdown";
import { complaints } from "../../data/complaintData";
import { useComplaints } from "../../hooks/useComplaints";
import type { DateRange } from "react-day-picker";
import { useOutletContext } from "react-router-dom";

const ComplaintListContainer: React.FC = () => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Get dateRange from outlet context
  const { dateRange } = useOutletContext<{ dateRange?: DateRange }>();

  // Use the useComplaints hook with the dateRange from context
  //! const { complaints, isLoading, error } = useComplaints(dateRange);
  const { isLoading, error } = useComplaints(dateRange);

  const handleAreaSelectionChange = (areas: string[]) => {
    setSelectedAreas(areas);
  };

  const getSelectedAreaDisplay = (areas: string[]) => {
    if (areas.length === 0 || areas.length === 8) return "전체 지역";

    const 쌍문Children = ["쌍문 1동", "쌍문 2동", "쌍문 3동", "쌍문 4동"];
    const 방학Children = ["방학 1동", "방학 3동"];

    const selected쌍문Children = 쌍문Children.filter((child) =>
      areas.includes(child)
    );
    const selected방학Children = 방학Children.filter((child) =>
      areas.includes(child)
    );

    const displayParts = [];

    if (selected쌍문Children.length === 쌍문Children.length) {
      displayParts.push("쌍문동");
    } else if (selected쌍문Children.length > 0) {
      displayParts.push(selected쌍문Children.join(", "));
    }

    if (selected방학Children.length === 방학Children.length) {
      displayParts.push("방학동");
    } else if (selected방학Children.length > 0) {
      displayParts.push(selected방학Children.join(", "));
    }

    return displayParts.join(", ");
  };

  return (
    <div className="p-6 w-full h-full border border-black">
      {isLoading && (
        <div className="text-center text-gray-500">
          <p className="text-sm">민원 목록을 불러오는 중...</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500">
          <p className="text-sm">에러: {error}</p>
        </div>
      )}
      {!isLoading && !error && complaints.length === 0 && (
        <div className="text-center text-gray-500">
          <p className="text-sm">해당 기간에 민원이 없습니다.</p>
        </div>
      )}
      {!isLoading && !error && complaints.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <div className="mb-4 pb-3 rounded-lg">
              <p className="text-base text-gray-600 mb-1">
                현재 조회 중인 지역은
              </p>
              <h3 className="text-xl font-semibold text-gray-800">
                서울특별시 도봉구 {getSelectedAreaDisplay(selectedAreas)}
              </h3>
            </div>
            <AreaDropdown
              onSelectionChange={handleAreaSelectionChange}
              buttonText="구역 선택"
              buttonClassName="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
              contentClassName="w-28 !p-0"
              childItemClassName="pl-10 bg-f0f0f0 rounded-none bg-[#E9FFD4] hover:bg-[#E2F7CF]"
              triangleIcon={triangle}
            />
          </div>
          <div className="space-y-2">
            {complaints.map((complaint) => (
              <ComplaintListCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintListContainer;
