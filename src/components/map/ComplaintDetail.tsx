import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { createStatusChangeHandler } from '@/lib/popupHandlers';
import { useComplaintTableStore } from '@/stores/complaintTableStore';
import { useMapOverviewStore } from '@/stores/mapOverviewStore';
import type { Complaint } from '@/types/complaint';

import sample from '../../assets/background/sample.png';
// import general from "../../assets/icons/categories/tags/general.svg";
import recycle from '../../assets/icons/categories/tags/recycle.svg';
import fix from '../../assets/icons/common/fix.svg';
import pin from '../../assets/icons/map_card/location_pin.svg';
import phone from '../../assets/icons/map_card/phone.svg';
import truck from '../../assets/icons/map_card/truck.svg';
// import other from "../../assets/icons/categories/tags/other.svg";
// import food from "../../assets/icons/categories/tags/food.svg";
//! ---------------------------------------------------------------------
// import greenCircle from "../../assets/icons/map_card/green_circle.svg"
import yellowCircle from '../../assets/icons/map_card/yellow_circle.svg';
import leftArrow from '../../assets/icons/navigation/arrows/gray_arrow_left.svg';
import rightArrow from '../../assets/icons/navigation/arrows/gray_arrow_right.svg';
import Popup from '../forms/Popup';

// Helper function to safely access nested properties
const getPhoneNumber = (complaint: Complaint | null): string | null => {
  return complaint?.source?.phone_no || null;
};

const getFirstUsername = (complaint: Complaint | null): string | null => {
  return complaint?.notify?.usernames?.[0] || null;
};

const ComplaintDetail: React.FC = () => {
  const { complaintId } = useParams<{ complaintId: string }>();
  const { selectedComplaintId, selectedComplaint, setSelectedComplaint } =
    useMapOverviewStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    complaints,
    isPopupOpen,
    selectedComplaintStatus,
    setSelectedComplaintStatus,
    setIsPopupOpen,
    setSelectedComplaintId,
    updateComplaint,
  } = useComplaintTableStore();

  const statusChangeHandler = createStatusChangeHandler(
    selectedComplaintId,
    selectedComplaintStatus,
    updateComplaint,
    () => {
      setIsPopupOpen(false);
      setSelectedComplaintId(null);
      setSelectedComplaintStatus(null);
    }
  );

  // Get the complaint ID from URL params
  const currentComplaintId = complaintId;

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
          setError('민원 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('민원 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching complaint:', err);
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
    console.log('Complaint Detail Error: ', error);

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

  // if (!selectedComplaint) {
  //   return (
  //     <div className="p-6">
  //       <div className="text-center text-gray-500">
  //         <p className="text-sm">선택된 민원이 없습니다.</p>
  //       </div>
  //     </div>
  //   );
  // }
  if (!selectedComplaint) {
    console.log('no selected complaint');
  }

  return (
    <div className="w-full">
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => {
            console.log('clicked!');
            if (e.target === e.currentTarget) {
              setIsPopupOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <Popup
              message={statusChangeHandler.getMessage()}
              yesNo={true}
              onFirstClick={statusChangeHandler.onConfirm}
              onSecondClick={statusChangeHandler.onCancel}
              toHome={false}
            />
          </div>
        </div>
      )}
      {/* Header */}
      <header className="w-full flex items-center">
        <button
          className="flex text-xl font-semibold text-gray-900 px-2 gap-1"
          onClick={() => navigate('/map/overview/complaints')}
        >
          <img src={leftArrow} alt="왼쪽 화살표" />
          민원 목록
        </button>
      </header>

      {/* Complaint Details */}
      <div className="p-4 py-2">
        <img src={sample} alt="샘플사진" className="rounded-sm mb-6" />

        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <img src={recycle} alt={`${selectedComplaint?.type || '재활용'}`} />
            <p className="text-xl font-semibold">
              {selectedComplaint?.content || '민원 제목'}
            </p>
            <button
              className="flex p-0 w-[3.2rem]"
              onClick={() => {
                console.log('수정버튼 클릭');
              }}
            >
              <img src={fix} alt="수정버튼" />
            </button>
          </div>
          <p className="text-base text-[#7C7C7C] font-semibold">
            {selectedComplaint?.date
              ? new Date(selectedComplaint.date).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : '날짜 정보 없음'}
          </p>

          <div className="flex gap-2 items-center">
            <img src={pin} alt="주소 핀" className="w-5 h-5" />
            <label className="text-lg font-semibold">
              {selectedComplaint?.address || '주소 정보 없음'}
            </label>
          </div>

          <div className="flex gap-2 items-center">
            <img src={phone} alt="전화" className="w-5 h-5" />
            <label className="text-lg font-semibold">
              {selectedComplaint?.department || '담당부서'} (
              {selectedComplaint?.contact ||
                getPhoneNumber(selectedComplaint) ||
                '연락처 없음'}
              )
            </label>
          </div>

          <div className="flex gap-2 items-center">
            <img src={yellowCircle} alt="상태" className="w-4 h-4 mx-0.5" />
            <label className="text-lg font-semibold">
              {selectedComplaint?.status === '완료'
                ? '민원 처리 완료'
                : '민원 처리 중'}
            </label>
            <button
              className="text-[#0009FF] p-0 ml-1"
              onClick={() => {
                setIsPopupOpen(true);
              }}
            >
              상태수정
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <img src={truck} alt="차량" className="w-5 h-5" />
            <label className="text-lg font-semibold">
              {selectedComplaint?.driver ||
                getFirstUsername(selectedComplaint) ||
                '담당자 정보 없음'}
            </label>
            <p className="text-base font-semibold text-[#7C7C7C]">
              {selectedComplaint?.status === '완료'
                ? '수거 완료'
                : '차량이 수거 중이에요'}
            </p>
            <button className="text-[#0009FF] p-0">동선 조회</button>
          </div>

          <div className="pt-5">
            <label className="text-lg font-semibold">민원 내용</label>
            <div className="mt-2 p-3 rounded-lg bg-ebebeb h-40">
              <p className="text-sm whitespace-pre-wrap">
                {selectedComplaint?.content || '민원 내용이 없습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-2 right-1 w-full flex justify-end items-center">
        <button
          className="flex text-lg font-semibold text-gray-900 px-2 gap-1"
          onClick={() => navigate('/complaints/table')}
        >
          민원 내역 / 관리로 돌아가기
          <img src={rightArrow} alt="오른쪽 화살표" />
        </button>
      </footer>
    </div>
  );
};

export default ComplaintDetail;
