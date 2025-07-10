import { useState } from "react";

const menuItems = [
  { label: "지도", submenu: ["민원 분류", "차량 조회", "지역 통계"] },
  { label: "차량 관리", submenu: ["차량 정보", "차량 동선"] },
  { label: "민원", submenu: ["내역 / 관리", "민원 등록"] },
  { label: "통계", submenu: ["전체 통계"] },
];

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="relative w-screen h-[8rem] bg-white py-3">
      <div className="relative h-full flex items-end justify-between mx-[17rem] pt-4">
        {/* 로고 */}
        <div className="w-[10vw] h-[8vh] border border-black cursor-pointer" />
        {/* 
        // !임시로고
        */}

        {/* 메뉴 */}
        <nav
          className="relative flex space-x-16 mb-0 pb-0 px-10 mr-[9rem]"
          onMouseEnter={() => setShowDropdown(true)}
        >
          {menuItems.map((item, idx) => (
            <div key={idx} className="relative flex flex-col items-center">
              {/* 상단 메뉴 텍스트 */}
              <div
                className={`cursor-pointer px-2 pb-4 border-b-2 font-bold text-xl ${showDropdown ? "border-black" : "border-white"}`}
              >
                {item.label}
              </div>

              {/* 개별 드롭다운: 상단 메뉴 바로 아래 위치 */}
              {showDropdown && (
                <div className="absolute top-full bg-efefef pt-4 pb-2 px-4 z-10 w-max min-w-[9rem] text-center transition">
                  {item.submenu.map((sub, subIdx) => (
                    <div
                      key={subIdx}
                      className="py-2 hover:text-gray-400 cursor-pointer font-semibold text-lg"
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 오른쪽 메뉴 */}
        <div className="flex space-x-4 text-base absolute top-0 right-2 cursor-pointer">
          <div className="hover:text-gray-400">마이페이지</div>
          <div className="hover:text-gray-400">로그아웃</div>
        </div>
      </div>

      {showDropdown && (
        <div
          className="absolute top-[7.25rem] left-0 w-screen h-[12rem] bg-efefef transition"
          onMouseLeave={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
