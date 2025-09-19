import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useMapOverviewStore } from '@/stores/mapOverviewStore';
import { formatDateTimeToKorean } from '@/utils/formatDate';

import sample from '../../assets/background/sample.jpg';
import food from '../../assets/icons/categories/tags/food.svg';
import general from '../../assets/icons/categories/tags/general.svg';
import other from '../../assets/icons/categories/tags/other.svg';
import recycle from '../../assets/icons/categories/tags/recycle.svg';
import bad from '../../assets/icons/categories/tags/repeat.svg';
import greenCircle from '../../assets/icons/map_card/green_circle.svg';
import pin from '../../assets/icons/map_card/location_pin.svg';
import yellowCircle from '../../assets/icons/map_card/yellow_circle.svg';
import type { Complaint } from '../../types/complaint';

interface ComplaintListCardProps {
  complaint: Complaint;
}

const ComplaintListCard: React.FC<ComplaintListCardProps> = ({ complaint }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // 페이지 이동 전 현재 경로 저장
    const { preserveCurrentPath } = useMapOverviewStore.getState();
    preserveCurrentPath();

    navigate(`/map/overview/complaints/${complaint.id}`);
  };

  return (
    <div className="cursor-pointer" onClick={handleCardClick}>
      <div className="flex items-center md:items-start gap-3 ">
        <img
          src={sample}
          alt="임시 이미지"
          className="rounded-lg w-28 xsm:w-32 md:w-40"
        />
        <div className="py-1">
          <div className="flex gap-1">
            <img
              src={
                complaint.teams[0].category === '재활용'
                  ? recycle
                  : complaint.teams[0].category === '음식물'
                    ? food
                    : complaint.teams[0].category === '기타'
                      ? other
                      : complaint.teams[0].category === '기타'
                        ? general
                        : ''
              }
              alt="쓰레기 상성 태그"
              className="w-10 md:w-12"
            />
            {complaint.source.bad ? (
              <img src={bad} alt="반복민원 태그" className="w-12 md:w-14" />
            ) : (
              ''
            )}
            <p className="font-semibold text-sm md:text-base truncate">
              {complaint.content}
            </p>
          </div>
          <p className="text-xs md:text-sm font-semibold text-[#7C7C7C] mt-1">
            {formatDateTimeToKorean(complaint.datetime)}
          </p>
          <div className="flex items-center pb-1">
            <img src={pin} alt="핀 아이콘" className="mt-1 mr-0.5" />
            <p className="text-xs md:text-sm text-black font-semibold mt-1">
              {complaint.address.slice(6)}
            </p>
          </div>
          <div className="flex items-center">
            <img
              src={complaint.status ? greenCircle : yellowCircle}
              alt="처리중 원"
              className="ml-0.5 mr-1"
            />
            <p className="text-xs md:text-sm text-black font-semibold">
              {complaint.status ? '완료' : '처리중'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintListCard;
