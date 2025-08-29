import React, { useState } from "react";
import { Sheet, SheetPortal } from "@/components/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import editIcon from "../../assets/icons/common/edit.svg";
import truckIcon from "../../assets/icons/common/truck.svg";
import chartIcon from "../../assets/icons/common/chart.svg";
import logo from "../../assets/icons/brand/logo.svg";
import grayLeftArrow from "../../assets/icons/navigation/arrows/gray_arrow_left.svg";
import grayRightArrow from "../../assets/icons/navigation/arrows/gray_arrow_right.svg";

type SidebarType = "complaint" | "vehicle" | "stats" | null;

const VerticalMenuBar: React.FC = () => {
  const [openSidebar, setOpenSidebar] = useState<SidebarType>(null);
  const [lastOpenedSidebar, setLastOpenedSidebar] = useState<SidebarType>(null);
  const navigate = useNavigate();

  // 사이드바 닫기
  const handleClose = () => setOpenSidebar(null);

  // 토글 함수
  const toggleSidebar = () => {
    if (openSidebar) {
      setOpenSidebar(null);
    } else {
      setOpenSidebar(lastOpenedSidebar || "complaint");
    }
  };

  // 사이드바 클릭 핸들러 - 마지막 열린 사이드바 기억
  const handleSidebarClick = (type: SidebarType) => {
    setLastOpenedSidebar(type);
    setOpenSidebar(type);
  };

  // 각 사이드바에 들어갈 content 컴포넌트
  const sidebarContents = {
    complaint: <div className="p-6">민원 목록 컴포넌트</div>,
    vehicle: <div className="p-6">차량 정보 컴포넌트</div>,
    stats: <div className="p-6">구역별 통계 컴포넌트</div>,
  };

  return (
    <>
      {/* 왼쪽 고정 세로 메뉴 바 */}
      <nav className="fixed left-0 top-0 h-screen w-20 flex flex-col justify-between bg-white border-r z-50 p-0 px-2">
        {/* 상단 버튼 */}
        <div className="flex flex-col items-center gap-4">
          {/* 로고 버튼 */}
          <button
            className="p-0 py-2 w-20 flex items-center justify-center border-b border-d9d9d9"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="로고" className="w-16 h-16" />
          </button>
          {/* 민원 목록 */}
          <button
            className="flex flex-col items-center justify-center p-0 text-xs font-semibold mb-0"
            onClick={() => handleSidebarClick("complaint")}
          >
            <img src={editIcon} alt="민원 목록" className="w-10 h-10 mb-1" />
            민원 목록
          </button>
          {/* 차량 조회 */}
          <button
            className="flex flex-col items-center justify-center p-0 text-xs font-semibold mb-0"
            onClick={() => handleSidebarClick("vehicle")}
          >
            <img src={truckIcon} alt="차량 조회" className="w-10 h-10 mb-1" />
            차량 조회
          </button>
          {/* 구역별 통계 */}
          <button
            className="flex flex-col items-center justify-center p-0 text-xs font-semibold mb-0"
            onClick={() => handleSidebarClick("stats")}
          >
            <img src={chartIcon} alt="구역별 통계" className="w-10 h-10 mb-1" />
            구역별 통계
          </button>
        </div>
      </nav>

      {/* 토글 버튼 - 동적 위치 */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-2 w-10 h-20 bg-white border border-l-0 border-d9d9d9 rounded-r-md ease-in-out transition duration-600 ${
          openSidebar ? "left-[35rem]" : "left-20"
        }`}
      >
        <img
          src={openSidebar ? grayLeftArrow : grayRightArrow}
          alt="사이드바 펼치기/접기"
        />
      </button>

      <Sheet open={!!openSidebar} onOpenChange={handleClose}>
        <SheetPortal>
          <SheetPrimitive.Content className="w-[30rem] max-w-full transition ease-in-out fixed inset-y-0 left-20 h-full bg-white border-r z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-300 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
            {openSidebar && sidebarContents[openSidebar]}
          </SheetPrimitive.Content>
        </SheetPortal>
      </Sheet>
    </>
  );
};

export default VerticalMenuBar;
