import React, { useEffect, useState } from "react";
import { useMapOverviewStore } from "@/stores/mapOverviewStore";
import { useComplaintTableStore } from "@/stores/complaintTableStore";

interface ComplaintDetailProps {
  complaintId?: string;
}

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({ complaintId }) => {
  const { selectedComplaintId, selectedComplaint, setSelectedComplaint } =
    useMapOverviewStore();
  const { complaints } = useComplaintTableStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the complaint ID from props or store
  const currentComplaintId = complaintId || selectedComplaintId;

  // Fetch complaint data when ID changes
  useEffect(() => {
    if (!currentComplaintId) {
      setSelectedComplaint(null);
      return;
    }

    const fetchComplaint = async () => {
      setLoading(true);
      setError(null);

      try {
        // First try to find in local store
        const localComplaint = complaints.find(
          (c) => c.id === currentComplaintId
        );

        if (localComplaint) {
          setSelectedComplaint(localComplaint);
        } else {
          // If not found locally, you could fetch from API here
          // For now, we'll show an error
          setError("민원 정보를 찾을 수 없습니다.");
        }
      } catch (err) {
        setError("민원 정보를 불러오는 중 오류가 발생했습니다.");
        console.error("Error fetching complaint:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [currentComplaintId, complaints, setSelectedComplaint]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedComplaint) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <p className="text-sm">선택된 민원이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            민원 상세 정보
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            ID: {selectedComplaint.id}
          </p>
        </div>

        {/* Complaint Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                접수 일자
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {selectedComplaint.date}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">종류</label>
              <p className="text-sm text-gray-900 mt-1">
                {selectedComplaint.type}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">주소</label>
            <p className="text-sm text-gray-900 mt-1">
              {selectedComplaint.address}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">상태</label>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                selectedComplaint.status === "완료"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {selectedComplaint.status}
            </span>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              민원 내용
            </label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {selectedComplaint.content}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            처리 상태 변경
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
