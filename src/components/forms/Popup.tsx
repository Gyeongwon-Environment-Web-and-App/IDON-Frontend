import type { JSX } from "react";

interface PopupProps {
  message: string | JSX.Element;
  yesNo: boolean;
  onFirstClick: () => void;
  onSecondClick: () => void;
  toHome: boolean;
}

export default function Popup({
  message,
  yesNo,
  onFirstClick,
  onSecondClick,
  toHome,
}: PopupProps) {
  return (
    <div className="fixed w-full max-w-sm max-h-80 p-6 bg-white rounded-lg shadow-lg text-center left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col justify-center items-center font-bold">
      {/* 메시지 */}
      <div className="mt-8 mb-4 text-xl font-bold">
        {typeof message === "string" ? <span>{message}</span> : message}
      </div>

      {/* 버튼 */}
      <div className={`flex mt-2 ${toHome ? "" : "mb-7"}`}>
        <button
          onClick={onFirstClick}
          className={`px-4 py-2 mr-2 bg-light-green text-white rounded font-semibold text-base ${yesNo ? "w-[7rem]" : ""}`}
        >
          {yesNo ? "예" : "민원 위치 확인"}
        </button>
        <button
          onClick={onSecondClick}
          className={`px-4 py-2 bg-d9d9d9 text-black rounded font-semibold text-base ${yesNo ? "w-[7rem]" : ""}`}
        >
          {yesNo ? "아니오" : "전체 민원 확인"}
        </button>
      </div>

      {/* 홈으로 돌아가기 문구 */}
      {toHome && (
        <div className="mt-4 mb-4 text-sm font-semibold text-gray-500 cursor-pointer">
          홈으로 돌아가기
        </div>
      )}
    </div>
  );
}
