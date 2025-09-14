import React, { useState, useEffect } from "react";
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
import { useMapOverviewStore } from "../../stores/mapOverviewStore";
import { Search } from "lucide-react";
import ComplaintListCard from "./ComplaintListCard";
import { useComplaints } from "../../hooks/useComplaints";
import type { DateRange } from "react-day-picker";
import { complaints } from "../../data/complaintData";
import triangle from "../../assets/icons/actions/triangle.svg";
import { AreaDropdown } from "@/components/ui/AreaDropdown";

type SidebarType = "complaint" | "vehicle" | "stats" | null;

interface MapSideMenuProps {
  onSidebarChange: (isOpen: boolean) => void;
  dateRange?: DateRange;
}

const MapSideMenu: React.FC<MapSideMenuProps> = ({
  onSidebarChange,
  dateRange,
}) => {
  const [lastOpenedSidebar, setLastOpenedSidebar] = useState<SidebarType>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedTrash, setSelectedTrash] = useState<string>("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const navigate = useNavigate();
  const onSidebarChangeRef = React.useRef(onSidebarChange);

  // Use the useComplaints hook with the dateRange from props
  //! const { complaints, isLoading, error } = useComplaints(dateRange);
  const { isLoading, error } = useComplaints(dateRange);

  // Update ref when callback changes
  useEffect(() => {
    onSidebarChangeRef.current = onSidebarChange;
  }, [onSidebarChange]);

  const handleAreaSelectionChange = (areas: string[]) => {
    setSelectedAreas(areas);
  };

  const getSelectedAreaDisplay = (areas: string[]) => {
    if (areas.length === 0 || areas.length === 8) return "전체 지역";

    const 쌍문Children = ["쌍문 1동", "쌍문 2동", "쌍문 3동", "쌍문 4동"];
    const 방학Children = ["방학 1동", "방학 3동"];

    const selected쌍문Children = 쌍문Children.filter((child) =>
      areas.includes(child)
    );
    const selected방학Children = 방학Children.filter((child) =>
      areas.includes(child)
    );

    const displayParts = [];

    if (selected쌍문Children.length === 쌍문Children.length) {
      displayParts.push("쌍문동");
    } else if (selected쌍문Children.length > 0) {
      displayParts.push(selected쌍문Children.join(", "));
    }

    if (selected방학Children.length === 방학Children.length) {
      displayParts.push("방학동");
    } else if (selected방학Children.length > 0) {
      displayParts.push(selected방학Children.join(", "));
    }

    return displayParts.join(", ");
  };

  // Get state from store
  const { activeSidebar, setActiveSidebar, sidebarOpen } =
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

  // 사이드바 클릭 핸들러 - 마지막 열린 사이드바 기억 및 토글 기능
  const handleSidebarClick = (type: SidebarType) => {
    if (activeSidebar === type) {
      // 같은 버튼을 클릭하면 사이드바 닫기
      setActiveSidebar(null);
      onSidebarChange(false);
      navigate("/map/overview");
    } else {
      // 다른 버튼을 클릭하면 해당 사이드바 열기
      setLastOpenedSidebar(type);
      setActiveSidebar(type);
      onSidebarChange(true);

      // Navigate to appropriate route based on sidebar type
      if (type === "complaint") {
        navigate("/map/overview/complaints");
      }
      // Add other sidebar types as needed
    }
  };

  // Sync sidebar state with parent component
  React.useEffect(() => {
    onSidebarChangeRef.current(sidebarOpen);
  }, [sidebarOpen]);

  // 각 사이드바에 들어갈 content 컴포넌트
  const sidebarContents = {
    complaint: (
      <div className="p-6 w-full h-full border border-black">
        {isLoading && (
          <div className="text-center text-gray-500">
            <p className="text-sm">민원 목록을 불러오는 중...</p>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">
            <p className="text-sm">에러: {error}</p>
          </div>
        )}
        {!isLoading && !error && complaints.length === 0 && (
          <div className="text-center text-gray-500">
            <p className="text-sm">해당 기간에 민원이 없습니다.</p>
          </div>
        )}
        {!isLoading && !error && complaints.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <div className="mb-4 pb-3 rounded-lg">
                <p className="text-base text-gray-600 mb-1">
                  현재 조회 중인 지역은
                </p>
                <h3 className="text-xl font-semibold text-gray-800">
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
            <div className="space-y-2">
              {complaints.map((complaint) => (
                <ComplaintListCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    vehicle: <div className="p-6">차량 정보 컴포넌트</div>,
    stats: <div className="p-6">구역별 통계 컴포넌트</div>,
  };

  return (
    <div className="">
      {/* 왼쪽 고정 세로 메뉴 바 */}
      <nav className="fixed left-0 top-0 h-screen w-14 md:w-20 flex flex-col justify-between bg-white border-r z-50 p-0">
        {/* 상단 버튼 */}
        <div className="flex flex-col items-center">
          {/* 로고 버튼 */}
          <button
            className="p-0 py-2 w-14 md:w-20 flex items-center justify-center border-b border-d9d9d9"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="로고" className="w-10 h-10 md:w-16 md:h-16" />
          </button>
          {/* 민원 목록 */}
          <button
            className={`w-full h-12 md:h-20 flex flex-col items-center justify-center m-0 p-0 text-xs font-semibold mb-0 ${activeSidebar === "complaint" ? "bg-darker-green text-white" : ""}`}
            onClick={() => handleSidebarClick("complaint")}
          >
            <img
              src={activeSidebar === "complaint" ? editWhite : editIcon}
              alt="민원 목록"
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="hidden md:block">민원 목록</span>
          </button>
          {/* 차량 조회 */}
          <button
            className={`w-full h-12 md:h-20 flex flex-col items-center justify-center m-0 p-0 text-xs font-semibold mb-0 ${activeSidebar === "vehicle" ? "bg-darker-green text-white" : ""}`}
            onClick={() => handleSidebarClick("vehicle")}
          >
            <img
              src={activeSidebar === "vehicle" ? truckWhite : truckIcon}
              alt="차량 조회"
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="hidden md:block">차량 조회</span>
          </button>
          {/* 구역별 통계 */}
          <button
            className={`w-full h-12 md:h-20 flex flex-col items-center justify-center m-0 p-0 text-xs font-semibold mb-0 ${activeSidebar === "stats" ? "bg-darker-green text-white" : ""}`}
            onClick={() => handleSidebarClick("stats")}
          >
            <img
              src={activeSidebar === "stats" ? chartWhite : chartIcon}
              alt="구역별 통계"
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="hidden md:block">구역별 통계</span>
          </button>
        </div>
      </nav>

      {/* 토글 버튼 - 동적 위치 */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-2 w-8 h-14 md:w-10 md:h-20 bg-white border border-l-0 border-d9d9d9 rounded-r-md ease-in-out transition duration-600 ${
          activeSidebar
            ? "left-[35rem] animate-slideIn"
            : "left-[5.5rem] md:left-[7.5rem] animate-slideOut"
        }`}
      >
        <img
          src={activeSidebar ? grayLeftArrow : grayRightArrow}
          alt="사이드바 펼치기/접기"
        />
      </button>

      {activeSidebar && (
        <div
          className={`w-[calc(100%-3.5rem)] md:w-[30rem] max-w-full fixed inset-y-0 left-14 md:left-20 h-full bg-white border-r z-40 
          ${activeSidebar ? "animate-slideIn" : "animate-slideOut"} flex flex-col items-center p-3`}
          aria-label="사이드바 메뉴"
        >
          <div className="relative w-full flex h-9 mb-3">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                isSearchFocused ? "text-light-green" : "text-[#575757]"
              }`}
            />
            <input
              type="text"
              placeholder={`${activeSidebar === "vehicle" ? "차량 정보/기사님 성함을 입력해보세요" : ""}`}
              className="pl-10 pr-4 py-1 border border-[#575757] rounded-md focus:outline-none focus:ring-1 focus:ring-light-green focus:border-transparent mx-[2px] flex-1 md:flex-auto text-sm font-[#575757]"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          <div
            className={`flex w-full text-[0.73rem] md:text-sm border border-light-border rounded ${activeSidebar === "complaint" ? "hidden" : "block"}`}
          >
            {["재활용", "일반", "음식물", "기타"].map((label, idx, arr) => (
              <button
                key={label}
                type="button"
                className={`
                  flex-1 px-4 font-bold
                  ${selectedTrash === label ? "bg-lighter-green" : ""}
                  ${idx === 0 ? "rounded-l" : ""}
                  ${idx === arr.length - 1 ? "rounded-r" : ""}
                  focus:outline-none
                `}
                style={{
                  borderRight:
                    idx !== arr.length - 1 ? "1px solid #ACACAC" : "none",
                }}
                onClick={() => setSelectedTrash(label)}
              >
                {label}
              </button>
            ))}
          </div>
          {sidebarContents[activeSidebar]}
        </div>
      )}
    </div>
  );
};

export default MapSideMenu;
