import React from "react";
import { useNavigate } from "react-router-dom";
import type { Complaint } from "../../types/complaint";
import sample from "../../assets/background/sample.png";

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
    <div className="scrollbar-hide" onClick={handleCardClick}>
      <div className="flex">
        <img src={sample} alt="임시 이미지" className="rounded-lg w-40" />
        <div className="">
          <h3 className="font-semibold text-sm">{complaint.content}</h3>
          <p className="text-xs text-gray-600 mt-1">{complaint.address}</p>
          <p className="text-xs text-gray-500 mt-1">{complaint.date}</p>
        </div>
      </div>
    </div>
  );
};

export default ComplaintListCard;
