import React from "react";
import { useNavigate } from "react-router-dom";
import type { Complaint } from "../../types/complaint";

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
    <div
      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{complaint.content}</h3>
          <p className="text-xs text-gray-600 mt-1">{complaint.address}</p>
          <p className="text-xs text-gray-500 mt-1">{complaint.date}</p>
        </div>
        <div className="ml-2">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              complaint.status === "처리중"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {complaint.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComplaintListCard;
