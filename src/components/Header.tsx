import { useState } from "react";
import smLogo from "../assets/icons/logo/small_logo.svg";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

const menuItems = [
  { label: "지도", submenu: ["민원 분류", "차량 조회", "구역별 통계"] },
  {
    label: "차량 관리",
    submenu: ["차량 정보", "차량 등록 / 수정", "기사정보", "기사등록 / 수정"],
  },
  { label: "민원", submenu: ["내역 / 관리", "민원 등록 / 수정", "전체 통계"] },
  { label: "통계", submenu: [] },
];

export default function Header() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative w-screen h-[8rem] bg-white py-3">
      <div className="relative md:h-full flex items-end justify-between mx-4 md:mx-[17rem] md:pt-4">
        {/* 로고 */}
        <div className="cursor-pointer mb-2 ml-4" onClick={() => navigate("/")}>
          <img
            src={smLogo}
            alt="작은 사이즈 경원환경개발 로고"
            className="object-center md:h-[7vh] h-[5vh]"
          />
        </div>

        {/* 데스크톱 메뉴 - md 이상에서만 표시 */}
        <nav
          className="hidden md:flex relative space-x-16 mb-0 pb-0 px-10 mr-[9rem]"
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
                <div className="absolute top-full bg-efefef pt-4 pb-2 px-4 z-20 w-max min-w-[9rem] text-center transition">
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

        {/* 모바일 햄버거 메뉴 - md 미만에서만 표시 */}
        <div className="md:hidden overflow-auto">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] relative h-screen border-green-500 border [&>button:first-child]:hidden !p-0"
            >
              {/* 커스텀 X 버튼 */}
              <SheetClose asChild>
                <button className="absolute -right-[3.5rem] top-6 p-3 bg-red-500 hover:bg-red-600 transition-colors z-50">
                  <X className="h-6 w-6 text-white font-bold" />
                </button>
              </SheetClose>

              {/* 로그아웃 버튼 */}
              <div className="text-sm bg-[#77BF7E] text-right pt-10">
                <button
                  className="text-right text-white hover:text-gray-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  로그아웃
                </button>
              </div>
              <div className="flex flex-col space-y-4 mt-8 p-6 pt-0">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-bold mb-2">{item.label}</h3>
                    <div className="flex flex-col space-y-2 ml-4">
                      {item.submenu.map((sub, subIdx) => (
                        <button
                          key={subIdx}
                          className="text-left py-1 hover:text-gray-600 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 오른쪽 메뉴 - 데스크톱에서만 표시 */}
        <div className="hidden md:flex space-x-4 text-base absolute top-0 right-2 cursor-pointer">
          <div className="hover:text-gray-400">로그아웃</div>
        </div>
      </div>

      {showDropdown && (
        <div
          className="absolute top-[7.25rem] left-0 w-screen h-[12rem] z-10 bg-efefef transition"
          onMouseLeave={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
