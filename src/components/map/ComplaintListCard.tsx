import React from 'react';

import { useNavigate } from 'react-router-dom';

import sample from '../../assets/background/sample.png';
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
          <div className="flex">
            {complaint.category === ''}
            <p className="font-semibold text-lg">{complaint.content}</p>
          </div>
          <p className="text-xs text-gray-600 mt-1">{complaint.address}</p>
          <p className="text-xs text-gray-500 mt-1">{complaint.date}</p>
        </div>
      </div>
    </div>
  );
};

export default ComplaintListCard;
