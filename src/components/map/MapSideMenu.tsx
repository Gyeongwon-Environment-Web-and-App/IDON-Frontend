// src/components/VerticalMenuBar.tsx

import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// 아이콘 import
import editIcon from "../../assets/icons/common/edit.svg";
import truckIcon from "../../assets/icons/common/truck.svg";
import chartIcon from "../../assets/icons/common/chart.svg";

type SidebarType = "complaint" | "vehicle" | "stats" | "allmenu" | null;

const VerticalMenuBar: React.FC = () => {
  const [openSidebar, setOpenSidebar] = useState<SidebarType>(null);

  // 사이드바 닫기
  const handleClose = () => setOpenSidebar(null);

  // 각 사이드바에 들어갈 content 컴포넌트
  const sidebarContents = {
    complaint: <div className="p-6">민원 목록 컴포넌트</div>,
    vehicle: <div className="p-6">차량 정보 컴포넌트</div>,
    stats: <div className="p-6">구역별 통계 컴포넌트</div>,
    allmenu: <div className="p-6">전체 메뉴 컴포넌트</div>,
  };

  return (
    <>
      {/* 왼쪽 고정 세로 메뉴 바 */}
      <nav className="fixed left-0 top-0 h-screen w-20 flex flex-col justify-between bg-white border-r z-50">
        {/* 상단 버튼 */}
        <div className="flex flex-col items-center gap-4 pt-6">
          {/* 로고 버튼 */}
          <button
            className="w-12 h-12 border border-gray-300 rounded mb-2"
            onClick={() => (window.location.href = "/")}
          />
          {/* 민원 목록 */}
          <button
            className="w-12 h-12 flex items-center justify-center"
            onClick={() => setOpenSidebar("complaint")}
          >
            <img src={editIcon} alt="민원 목록" className="w-8 h-8" />
          </button>
          {/* 차량 조회 */}
          <button
            className="w-12 h-12 flex items-center justify-center"
            onClick={() => setOpenSidebar("vehicle")}
          >
            <img src={truckIcon} alt="차량 조회" className="w-8 h-8" />
          </button>
          {/* 구역별 통계 */}
          <button
            className="w-12 h-12 flex items-center justify-center"
            onClick={() => setOpenSidebar("stats")}
          >
            <img src={chartIcon} alt="구역별 통계" className="w-8 h-8" />
          </button>
        </div>
      </nav>

      {/* 오른쪽 슬라이드 사이드바 (Shadcn Sheet 활용) */}
      <Sheet open={!!openSidebar} onOpenChange={handleClose}>
        <SheetContent side="left" className="w-[400px] max-w-full">
          {/* 사이드바 내부 content */}
          {openSidebar && sidebarContents[openSidebar]}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default VerticalMenuBar;
