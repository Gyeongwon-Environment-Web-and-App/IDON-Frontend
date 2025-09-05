import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import editIcon from "../../assets/icons/common/edit.svg";
import editWhite from "../../assets/icons/common/edit_white.svg";
import truckIcon from "../../assets/icons/common/truck.svg";
import truckWhite from "../../assets/icons/common/truck_white.svg";
import chartIcon from "../../assets/icons/common/chart.svg";
import chartWhite from "../../assets/icons/common/chart_white.svg";
import logo from "../../assets/icons/brand/logo.svg";
import grayLeftArrow from "../../assets/icons/navigation/arrows/gray_arrow_left.svg";
import grayRightArrow from "../../assets/icons/navigation/arrows/gray_arrow_right.svg";
import ComplaintDetail from "./ComplaintDetail";
import { useMapOverviewStore } from "../../stores/mapOverviewStore";

type SidebarType = "complaint" | "vehicle" | "stats" | null;

interface MapSideMenuProps {
  onSidebarChange: (isOpen: boolean) => void;
}

const MapSideMenu: React.FC<MapSideMenuProps> = ({ onSidebarChange }) => {
  const [lastOpenedSidebar, setLastOpenedSidebar] = useState<SidebarType>(null);
  const navigate = useNavigate();
  const onSidebarChangeRef = React.useRef(onSidebarChange);

  // Update ref when callback changes
  React.useEffect(() => {
    onSidebarChangeRef.current = onSidebarChange;
  }, [onSidebarChange]);

  // Get state from store
  const { activeSidebar, selectedComplaintId, setActiveSidebar, sidebarOpen } =
    useMapOverviewStore();

  // 토글 함수
  const toggleSidebar = () => {
    if (activeSidebar) {
      setActiveSidebar(null);
      onSidebarChange(false);
    } else {
      setActiveSidebar(lastOpenedSidebar || "complaint");
      onSidebarChange(true);
    }
  };

  // 사이드바 클릭 핸들러 - 마지막 열린 사이드바 기억
  const handleSidebarClick = (type: SidebarType) => {
    setLastOpenedSidebar(type);
    setActiveSidebar(type);
    onSidebarChange(true);
  };

  // Sync sidebar state with parent component
  React.useEffect(() => {
    onSidebarChangeRef.current(sidebarOpen);
  }, [sidebarOpen]);

  // 각 사이드바에 들어갈 content 컴포넌트
  const sidebarContents = {
    complaint: selectedComplaintId ? (
      <ComplaintDetail complaintId={selectedComplaintId} />
    ) : (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <p className="text-sm">민원을 선택해주세요.</p>
        </div>
      </div>
    ),
    vehicle: <div className="p-6">차량 정보 컴포넌트</div>,
    stats: <div className="p-6">구역별 통계 컴포넌트</div>,
  };

  return (
    <>
      {/* 왼쪽 고정 세로 메뉴 바 */}
      <nav className="fixed left-0 top-0 h-screen w-20 flex flex-col justify-between bg-white border-r z-50 p-0">
        {/* 상단 버튼 */}
        <div className="flex flex-col items-center">
          {/* 로고 버튼 */}
          <button
            className="p-0 py-2 w-20 flex items-center justify-center border-b border-d9d9d9"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="로고" className="w-16 h-16" />
          </button>
          {/* 민원 목록 */}
          <button
            className={`w-full h-20 flex flex-col items-center justify-center m-0 p-0 text-xs font-semibold mb-0 ${activeSidebar === "complaint" ? "bg-darker-green text-white" : ""}`}
            onClick={() => handleSidebarClick("complaint")}
          >
            <img
              src={activeSidebar === "complaint" ? editWhite : editIcon}
              alt="민원 목록"
              className="w-10 h-10"
            />
            민원 목록
          </button>
          {/* 차량 조회 */}
          <button
            className={`w-full h-20 flex flex-col items-center justify-center m-0 p-0 text-xs font-semibold mb-0 ${activeSidebar === "vehicle" ? "bg-darker-green text-white" : ""}`}
            onClick={() => handleSidebarClick("vehicle")}
          >
            <img
              src={activeSidebar === "vehicle" ? truckWhite : truckIcon}
              alt="차량 조회"
              className="w-10 h-10"
            />
            차량 조회
          </button>
          {/* 구역별 통계 */}
          <button
            className={`w-full h-20 flex flex-col items-center justify-center m-0 p-0 text-xs font-semibold mb-0 ${activeSidebar === "stats" ? "bg-darker-green text-white" : ""}`}
            onClick={() => handleSidebarClick("stats")}
          >
            <img
              src={activeSidebar === "stats" ? chartWhite : chartIcon}
              alt="구역별 통계"
              className="w-10 h-10"
            />
            구역별 통계
          </button>
        </div>
      </nav>

      {/* 토글 버튼 - 동적 위치 */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-2 w-10 h-20 bg-white border border-l-0 border-d9d9d9 rounded-r-md ease-in-out transition duration-600 ${
          activeSidebar
            ? "left-[35rem] animate-slideIn"
            : "left-[7.5rem] animate-slideOut"
        }`}
      >
        <img
          src={activeSidebar ? grayLeftArrow : grayRightArrow}
          alt="사이드바 펼치기/접기"
        />
      </button>

      {activeSidebar && (
        <div
          className={`w-[30rem] max-w-full fixed inset-y-0 left-20 h-full bg-white border-r z-40 
          ${activeSidebar ? "animate-slideIn" : "animate-slideOut"}`}
          aria-label="사이드바 메뉴"
        >
          {sidebarContents[activeSidebar]}
        </div>
      )}
    </>
  );
};

export default MapSideMenu;
