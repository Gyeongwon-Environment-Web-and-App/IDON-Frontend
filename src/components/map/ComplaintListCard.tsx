import React from 'react';

import { useNavigate } from 'react-router-dom';

import { formatDateTimeToKorean } from '@/utils/formatDate';

import sample from '../../assets/background/sample.png';
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
    // Navigate to complaint detail view using the complaint ID
    navigate(`/map/overview/complaints/${complaint.id}`);
  };

  return (
    <div className="" onClick={handleCardClick}>
      <div className="flex items-start gap-3">
        <img src={sample} alt="임시 이미지" className="rounded-lg w-40" />
        <div className="py-1">
          <div className="flex gap-1">
            <img
              src={
                complaint.category === '재활용'
                  ? recycle
                  : complaint.category === '음식물'
                    ? food
                    : complaint.category === '기타'
                      ? other
                      : general
              }
              alt="쓰레기 상성 태그"
              className="w-12"
            />
            {complaint.source.bad ? (
              <img src={bad} alt="반복민원 태그" className="w-14" />
            ) : (
              ''
            )}
            <p className="font-semibold text-base">{complaint.content}</p>
          </div>
          <p className="text-sm font-semibold text-[#7C7C7C] mt-1">
            {formatDateTimeToKorean(complaint.datetime)}
          </p>
          <div className="flex items-center pb-1">
            <img src={pin} alt="핀 아이콘" className="mt-1 mr-0.5" />
            <p className="text-sm text-black font-semibold mt-1">
              {complaint.address.slice(6)}
            </p>
          </div>
          <div className="flex items-center">
            <img
              src={complaint.status ? yellowCircle : greenCircle}
              alt="처리중 원"
              className="ml-0.5 mr-1"
            />
            <p className="text-sm text-black font-semibold">
              {complaint.status ? '처리중' : '완료'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintListCard;
