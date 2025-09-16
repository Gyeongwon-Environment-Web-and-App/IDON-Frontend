import React, { useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { AreaDropdown } from '@/components/ui/AreaDropdown';

import triangle from '../../assets/icons/actions/triangle.svg';
import { complaints } from '../../data/complaintData';
import { useComplaints } from '../../hooks/useComplaints';
import ComplaintListCard from './ComplaintListCard';

interface ComplaintListContainerProps {
  dateRange?: DateRange;
}

const ComplaintListContainer: React.FC<ComplaintListContainerProps> = ({
  dateRange,
}) => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Use the useComplaints hook with the dateRange from context
  //! const { complaints, isLoading, error } = useComplaints(dateRange);
  const { isLoading, error } = useComplaints(dateRange);

  const handleAreaSelectionChange = (areas: string[]) => {
    setSelectedAreas(areas);
  };

  const getSelectedAreaDisplay = (areas: string[]) => {
    if (areas.length === 0 || areas.length === 8) return '전체 지역';

    const 쌍문Children = ['쌍문 1동', '쌍문 2동', '쌍문 3동', '쌍문 4동'];
    const 방학Children = ['방학 1동', '방학 3동'];

    const selected쌍문Children = 쌍문Children.filter((child) =>
      areas.includes(child)
    );
    const selected방학Children = 방학Children.filter((child) =>
      areas.includes(child)
    );

    const displayParts = [];

    if (selected쌍문Children.length === 쌍문Children.length) {
      displayParts.push('쌍문동');
    } else if (selected쌍문Children.length > 0) {
      displayParts.push(selected쌍문Children.join(', '));
    }

    if (selected방학Children.length === 방학Children.length) {
      displayParts.push('방학동');
    } else if (selected방학Children.length > 0) {
      displayParts.push(selected방학Children.join(', '));
    }

    return displayParts.join(', ');
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading && (
        <div className="text-center text-gray-500 py-5">
          <p className="text-sm">민원 목록을 불러오는 중...</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 py-5">
          <p className="text-sm">에러: {error}</p>
        </div>
      )}
      {!isLoading && !error && complaints.length === 0 && (
        <div className="text-center text-gray-500 py-5">
          <p className="text-sm">해당 기간에 민원이 없습니다.</p>
        </div>
      )}
      {!isLoading && !error && complaints.length > 0 && (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-2 py-5">
            <div className="rounded-lg">
              <p className="font-semibold text-base text-[#8D8D8D] mb-1">
                현재 조회 중인 지역은
              </p>
              <h3 className="text-xl font-bold">
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
          <div className="px-2 pb-5">
            <p className="font-semibold text-sm pb-1 mb-5 border-b border-d9d9d9">
              전체 민원 목록
            </p>
            <div className="h-[60%] space-y-2 overflow-y-auto scrollbar-hide">
              {complaints.map((complaint) => (
                <ComplaintListCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintListContainer;
