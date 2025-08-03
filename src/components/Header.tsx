import { useState } from "react";
import smLogo from "../assets/icons/logo/small_logo.svg";
import logo from "../assets/icons/logo/logo.svg";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import topArrow from "../assets/icons/functions/top_arrow.svg";
import bottomArrow from "../assets/icons/functions/bottom_arrow.svg";

const menuItems = [
  {
    label: "지도",
    submenu: ["민원 분류", "차량 조회", "구역별 통계", "관할 구역 수정"],
  },
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
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

  const toggleMenu = (index: number) => {
    setExpandedMenus((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isMenuExpanded = (index: number) => expandedMenus.includes(index);

  return (
    <header className="relative w-screen xs:h-[3rem] md:h-[7rem] bg-white py-3 z-50">
      <div className="relative md:h-full flex items-center justify-between mx-5 2xl:mx-[18rem] pt-4">
        {/* 로고 */}
        <div
          className="cursor-pointer mb-2 md:ml-4"
          onClick={() => navigate("/")}
        >
          {/* 작은 화면용 로고 */}
          <img
            src={logo}
            alt="경원환경개발 로고"
            className="object-center h-[7vh] lg:hidden"
          />
          {/* 큰 화면용 로고 */}
          <img
            src={smLogo}
            alt="경원환경개발 로고"
            className="object-center h-[7vh] hidden lg:block"
          />
        </div>

        {/* 데스크톱 메뉴 - md 이상에서만 표시 */}
        <nav
          className="hidden md:flex relative space-x-16 mb-0 pb-0 px-10 lg:mr-[9rem] md:mr-[3rem]"
          onMouseEnter={() => setShowDropdown(true)}
        >
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center box-border"
            >
              {/* 상단 메뉴 텍스트 */}
              <div
                className={`cursor-pointer px-4 pt-7 pb-4 border-b-2 font-bold lg:text-xl text-md ${showDropdown ? "border-black" : "border-white"}`}
              >
                {item.label}
              </div>

              {/* 개별 드롭다운: 상단 메뉴 바로 아래 위치 */}
              {showDropdown && (
                <div className="absolute top-full bg-efefef pt-4 pb-2 px-4 z-20 w-max min-w-[9rem] text-center transition">
                  {item.submenu.map((sub, subIdx) => (
                    <div
                      key={subIdx}
                      className="py-2 hover:text-gray-400 cursor-pointer font-semibold lg:text-lg text-md"
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
          <Sheet
            open={mobileMenuOpen}
            onOpenChange={(open) => {
              setMobileMenuOpen(open);
            }}
          >
            <SheetTrigger asChild>
              <button
                className="p-2 hover:bg-gray-100 rounded-md"
                onClick={() => {
                  setMobileMenuOpen(true);
                }}
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] relative h-screen [&>button:first-child]:hidden !p-0 border-none z-[9999]"
              style={{
                left: 0,
                right: "auto",
                transform: "translateX(0)",
                position: "fixed",
                zIndex: 9999,
              }}
            >
              {/* 접근성을 위한 제목과 설명 */}
              <SheetTitle className="sr-only">모바일 메뉴</SheetTitle>
              <SheetDescription className="sr-only">
                네비게이션 메뉴를 선택하세요
              </SheetDescription>

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
                  <div key={idx} className="border-b border-bababa pb-4">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() =>
                        item.submenu.length > 0 ? toggleMenu(idx) : null
                      }
                    >
                      <h3 className="text-lg font-bold mb-2">{item.label}</h3>
                      {item.submenu.length > 0 && (
                        <img
                          src={isMenuExpanded(idx) ? topArrow : bottomArrow}
                          alt={isMenuExpanded(idx) ? "접기" : "펼치기"}
                          className="w-4 h-4 transition-transform"
                        />
                      )}
                    </div>
                    {isMenuExpanded(idx) && item.submenu.length > 0 && (
                      <div className="flex flex-col space-y-2 mt-2">
                        {item.submenu.map((sub, subIdx) => (
                          <button
                            key={subIdx}
                            className="text-left py-1 text-[#656565] hover:text-gray-600 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 오른쪽 메뉴 - 데스크톱에서만 표시 */}
        <div className="hidden sm:flex space-x-4 text-base md:text-sm absolute top-0 right-2 cursor-pointer">
          <div className="hover:text-gray-400">로그아웃</div>
        </div>
      </div>

      {showDropdown && (
        <div
          className="hidden sm:block absolute top-[6.25rem] left-0 !w-screen md:h-[15rem] h-[13rem] z-10 bg-efefef transition border border-red"
          onMouseLeave={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
