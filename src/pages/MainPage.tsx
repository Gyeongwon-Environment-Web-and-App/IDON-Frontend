import React from "react";
import { useNavigate } from "react-router-dom";
import bg1 from "../assets/icons/logo/bg1.png";
import Header from "@/components/Header";
import leftArrow from "../assets/icons/functions/arrow_left_white.svg";
import rightArrow from "../assets/icons/functions/arrow_right_white.svg";
import truck from "../assets/icons/home_menu/vehicle.svg";
import folder from "../assets/icons/home_menu/folder.svg";
import write from "../assets/icons/home_menu/write.svg";
import mapping from "../assets/icons/home_menu/mapping.svg";

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const menuButtons = [
    {
      title: "민원 관리",
      description: "입력한 민원을 간편하게 관리",
      icon: folder,
      route: "/",
      alt: "민원 관리 아이콘",
    },
    {
      title: "민원 등록",
      description: "실시간으로 간편하게 민원 입력",
      icon: write,
      route: "/register",
      alt: "민원 등록 아이콘",
    },
    {
      title: "지도",
      description: "간략화된 정보를 지도로 조회",
      icon: mapping,
      route: "/",
      alt: "지도 아이콘",
    },
    {
      title: "차량 조회",
      description: "업체에서 사용되는 차량 조회",
      icon: truck,
      route: "/",
      alt: "차량 아이콘",
    },
  ];

  return (
    <div className="w-screen h-screen overflow-auto absolute top-0 text-center">
      <Header />
      {/* 배경 이미지 공간 */}
      <div className="w-screen overflow-hidden absolute">
        <img
          src={bg1}
          alt="배경 이미지"
          className="h-[43vh] w-full object-cover object-center transition-all duration-500 sm:scale-100 md:scale-105 lg:scale-110 xl:scale-125"
        />
        {/* 좌우 화살표 버튼 */}
        <button className="absolute top-[50%] left-[20%] -translate-y-[50%] cursor-pointer z-5">
          <img
            src={leftArrow}
            alt="왼쪽 이동 화살표"
            className="cursor-pointer"
          />
        </button>
        <button className="absolute top-[50%] right-[20%] -translate-y-[50%] cursor-pointer">
          <img
            src={rightArrow}
            alt="오른쪽 이동 화살표"
            className="cursor-pointer"
          />
        </button>

        <div className="absolute left-[23%] bottom-20 font-bold text-white text-[1.7rem] text-center ">
          <p className="relative mb-2 text-shadow">미래의 쾌적한 삶을 위해,</p>
          <p className="relative left-[8rem] text-shadow">
            경원환경이 함께합니다
          </p>
        </div>
      </div>

      {/* 화면 하단 */}
      <div className="absolute md:flex md:flex-row flex-col justify-center items-center text-left md:text-center top-[55%] w-screen 2xl:px-80 pt-10">
        <p className="md:hidden font-bold text-lg px-10 pt-5 pb-3">메인 메뉴</p>
        {/* 기능 페이지 이동 버튼들 */}
        <div className="flex flex-wrap justify-center xxs:gap-0.5 xs:gap-4 md:gap-8 md:w-[60rem] 2xl:w-[150rem]md:mr-10 md:mb-10 items-center px-2 border border-red">
          {menuButtons.map((button, index) => (
            <button
              key={index}
              className={`rounded-xl w-[10.5rem] md:w-[25rem] h-[10rem] h-1000:h-[12rem] flex flex-col-reverse md:flex-row justify-around items-start md:items-center bg-white md:border-none md:shadow-custom border-[1.5px] border-[#C8C8C8] p-0 px-2 md:px-5 py-5 md:py-0 ${
                button.title === "민원 등록" || button.title === "민원 관리"
                  ? "hover:shadow-[#C8F2CE]"
                  : button.title === "지도"
                    ? "hover:shadow-[#D4EDFF]"
                    : button.title === "차량 조회"
                      ? "hover:shadow-[#6666664D]"
                      : ""
              }`}
              onClick={() => handleCardClick(button.route)}
            >
              <div className="ml-1 flex flex-col justify-between text-left">
                <p className="font-bold text-xl md:text-2xl mb-1">
                  {button.title}
                </p>
                <p className="text-xs md:text-lg md:hidden lg:block sm:block text-4e4e4e">
                  {button.description}
                </p>
              </div>
              <img
                src={button.icon}
                alt={button.alt}
                className="h-[3rem] md:h-20"
              />
            </button>
          ))}
        </div>
        <div className="mx-auto border border-red h-full max-w-60 my-10">
          현재 개발 중입니다. 공지사항페이지들어갈자리 공지사항페이지들어갈자리
          공지사항페이지들어갈자리 공지사항페이지들어갈자리
          공지사항페이지들어갈자리 공지사항페이지들어갈자리
          공지사항페이지들어갈자리 공지사항페이지들어갈자리
          공지사항페이지들어갈자리
        </div>
      </div>
    </div>
  );
};

export default MainPage;
