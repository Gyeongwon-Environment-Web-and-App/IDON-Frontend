import React, { useEffect } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { useComplaints } from '@/hooks/useComplaints';
import { createStatusChangeHandler } from '@/lib/popupHandlers';
import { complaintService } from '@/services/complaintService';
import { useComplaintTableStore } from '@/stores/complaintTableStore';
import { useMapOverviewStore } from '@/stores/mapOverviewStore';
import type { Complaint } from '@/types/complaint';

import sample from '../../assets/background/sample.jpg';
import recycle from '../../assets/icons/categories/tags/recycle.svg';
import fix from '../../assets/icons/common/fix.svg';
import greenCircle from '../../assets/icons/map_card/green_circle.svg';
import pin from '../../assets/icons/map_card/location_pin.svg';
import phone from '../../assets/icons/map_card/phone.svg';
import truck from '../../assets/icons/map_card/truck.svg';
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
  const navigate = useNavigate();

  const {
    isPopupOpen,
    selectedComplaintStatus,
    setSelectedComplaintStatus,
    setIsPopupOpen,
    setSelectedComplaintId,
    updateComplaint,
  } = useComplaintTableStore();

  const { getComplaintById, isLoading, fetchError } = useComplaints();

  const statusChangeHandler = createStatusChangeHandler(
    selectedComplaintId,
    selectedComplaintStatus,
    (id: string, updates: Partial<Complaint>) => {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        console.error('Invalid complaint ID:', id);
        return;
      }
      updateComplaint(numericId, updates);
    },
    () => {
      setIsPopupOpen(false);
      setSelectedComplaintId(null);
      setSelectedComplaintStatus(null);
    },
    async (id: number, status: boolean) => {
      if (selectedComplaint) {
        try {
          await complaintService.updateComplaint(id, {
            phone_no: selectedComplaint.source?.phone_no || '',
            content: selectedComplaint.content,
            type: selectedComplaint.type,
            route: selectedComplaint.route,
            status: status,
          });

          // Force refresh the complaint data immediately after successful update
          const updatedComplaint = await getComplaintById(id.toString());
          setSelectedComplaint(updatedComplaint);
          console.log('상태 업데이트 완료:', updatedComplaint.status);
        } catch (error) {
          console.error(`${id}번 민원 업데이트 실패:`, error);
          throw error;
        }
      }
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
      try {
        const complaint = await getComplaintById(currentComplaintId);
        setSelectedComplaint(complaint);
      } catch (error) {
        console.error('Failed to fetch complaint:', error);
      }
    };

    fetchComplaint();
  }, [currentComplaintId, getComplaintById, setSelectedComplaint]);

  useEffect(() => {
    if (!isPopupOpen && currentComplaintId) {
      console.log('팝업이 닫혔습니다. 민원 데이터를 새로고침합니다.');
      const refreshComplaint = async () => {
        try {
          const updatedComplaint = await getComplaintById(currentComplaintId);
          setSelectedComplaint(updatedComplaint);
          console.log('민원 상태 업데이트&새로고침:', updatedComplaint.status);
        } catch (error) {
          console.error('민원 상태 업데이트&새로고침 실패:', error);
        }
      };
      refreshComplaint();
    }
  }, [isPopupOpen, currentComplaintId, getComplaintById, setSelectedComplaint]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    console.log('Complaint Detail Error: ', fetchError);

    return (
      <div className="">
        <header className="w-full flex items-center">
          <button
            className="flex text-xl font-semibold text-gray-900 px-2 gap-1"
            onClick={() => navigate('/map/overview/complaints')}
          >
            <img src={leftArrow} alt="왼쪽 화살표" />
            민원 목록
          </button>
        </header>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">{fetchError}</div>
          </div>
        </div>
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
  }

  if (!selectedComplaint) {
    console.log('no selected complaint');
  }

  return (
    <div className="w-full">
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => {
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
            {selectedComplaint?.datetime
              ? new Date(selectedComplaint.datetime).toLocaleString('ko-KR', {
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
              {selectedComplaint?.teams[0]?.team_nm || '담당부서'} (
              {selectedComplaint?.user.phone_no ||
                getPhoneNumber(selectedComplaint) ||
                '연락처 없음'}
              )
            </label>
          </div>

          <div className="flex gap-2 items-center">
            <img
              src={selectedComplaint?.status ? greenCircle : yellowCircle}
              alt="상태"
              className="w-4 h-4 mx-0.5"
            />
            <label className="text-lg font-semibold">
              {selectedComplaint?.status === true
                ? '민원 처리 완료'
                : '민원 처리 중'}
            </label>
            <button
              className="text-[#0009FF] p-0 ml-1"
              onClick={() => {
                if (selectedComplaint) {
                  setSelectedComplaintId(selectedComplaint.id.toString());
                  setSelectedComplaintStatus(selectedComplaint.status);
                  setIsPopupOpen(true);
                }
              }}
            >
              상태수정
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <img src={truck} alt="차량" className="w-5 h-5" />
            <label className="text-lg font-semibold">
              {selectedComplaint?.teams[0]?.drivers[0]?.name ||
                getFirstUsername(selectedComplaint) ||
                '담당자 정보 없음'}
            </label>
            <p className="text-base font-semibold text-[#7C7C7C]">
              {selectedComplaint?.status ? '수거 완료' : '차량이 수거 중이에요'}
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
