import React, { useState } from "react";
import underArrow from "../../assets/icons/functions/under_arrow.svg";
import attention from "../../assets/icons/attention.svg";
import attentionRed from "../../assets/icons/attention_red.svg";
import FileAttach from "../FileAttach";
import type { ComplaintFormData } from "../../types/complaint";

interface ComplaintFormProps {
  dateTimeBox: React.ReactNode;
  formData: ComplaintFormData;
  setFormData: React.Dispatch<React.SetStateAction<ComplaintFormData>>;
  onSubmit: () => void;
}

export default function ComplaintForm({
  dateTimeBox,
  formData,
  setFormData,
  onSubmit,
}: ComplaintFormProps) {
  const [focus, setFocus] = useState({
    routeInput: false,
    trashInput: false,
    input3: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.address.trim() ||
      !formData.selectedRoute.trim() ||
      !formData.selectedTrash.trim()
    ) {
      window.alert(
        "필수 입력 정보를 작성해주세요. (민원 발생 주소, 민원 접수 경로, 민원 종류)"
      );
      return;
    }
    onSubmit();
  };

  return (
    <div className="overflow-y-auto overflow-x-hidden max-w-screen">
      <form className="md:border md:border-light-border rounded-[15px]">
        <div className="mt-0 md:px-5">{dateTimeBox}</div>
        <div className="max-w-4xl md:mx-10 md:my-10 my-5 grid grid-cols-3 md:grid-cols-[150px_1fr_1fr_1fr_150px] gap-x-1 md:gap-x-4 gap-y-3 md:gap-y-0 items-start md:items-center text-sm">
          {/* 민원 발생 주소 */}
          <label
            htmlFor="address"
            className="md:col-span-1 col-span-3 font-bold md:text-[1rem] text-base md:mb-1 -mb-3"
          >
            민원 발생 주소
            <span className="text-red pr-0"> *</span>
          </label>
          <div className="block md:hidden col-span-2"></div>

          <input
            type="text"
            id="address"
            className="col-span-2 md:col-span-3 border border-light-border px-3 py-2 rounded w-full outline-none"
            value={formData.address}
            onChange={(e) =>
              setFormData((f: ComplaintFormData) => ({
                ...f,
                address: e.target.value,
              }))
            }
          />
          <button
            type="button"
            className="col-span-1 border border-light-border px-4 py-2 rounded w-full font-bold"
          >
            주소 찾기
          </button>

          {/* 지도 확인 */}
          <div className="hidden md:block md:col-span-1"></div>
          <button
            type="button"
            className="w-full text-left font-bold bg-lighter-green border md:col-span-4 col-span-3 border-light-green px-4 -mt-1 md:mt-2 md:mb-5 rounded focus:outline-none flex"
          >
            지도에서 민원 위치 확인하기
            <img
              src={underArrow}
              alt="아래방향 화살표"
              className="pl-2 w-6 h-5"
            />
          </button>

          {/* 민원 접수 경로 */}
          <label
            className={`md:col-span-1 col-span-3 font-bold text-[1rem] pt-5 ${formData.selectedRoute !== "경원환경" ? "mb:mb-5" : ""}`}
          >
            민원 접수 경로
            <span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-3 md:mt-5 text-[0.73rem] md:text-sm border border-light-border rounded ${formData.selectedRoute !== "경원환경" ? "md:mb-5" : ""}`}
          >
            {["경원환경", "120", "구청", "주민센터"].map((label, idx, arr) => (
              <button
                key={label}
                type="button"
                className={`
                  flex-1 px-4 font-bold
                  ${formData.selectedRoute === label ? "bg-lighter-green" : ""}
                  ${idx === 0 ? "rounded-l" : ""}
                  ${idx === arr.length - 1 ? "rounded-r" : ""}
                  focus:outline-none
                `}
                style={{
                  borderRight:
                    idx !== arr.length - 1 ? "1px solid #ACACAC" : "none",
                }}
                onClick={() =>
                  setFormData((f: ComplaintFormData) => ({
                    ...f,
                    selectedRoute: label,
                  }))
                }
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={focus.routeInput ? "" : "직접 입력"}
            className={`md:col-span-1 col-span-3 border border-light-border px-3 py-2 md:mt-5 rounded w-full md:text-center text-left outline-none font-bold ${formData.selectedRoute !== "경원환경" ? "mb:mb-5" : ""}`}
            value={
              !["경원환경", "다산콜(120)", "구청", "주민센터"].includes(
                formData.selectedRoute
              )
                ? formData.selectedRoute
                : ""
            }
            onChange={(e) =>
              setFormData((f: ComplaintFormData) => ({
                ...f,
                selectedRoute: e.target.value,
              }))
            }
            onFocus={() => setFocus((f) => ({ ...f, routeInput: true }))}
            onBlur={() => setFocus((f) => ({ ...f, routeInput: false }))}
            onClick={() =>
              setFormData((f: ComplaintFormData) => ({
                ...f,
                selectedRoute: "",
              }))
            }
          />

          {/* 직접 전화번호 입력 - 데스크톱에서만 표시 */}
          {formData.selectedRoute === "경원환경" && (
            <>
              <div className="hidden md:block md:col-span-1"></div>
              <input
                id="경원환경 직접 전화번호 입력"
                type="text"
                value={formData.phone}
                className="hidden md:block md:col-span-4 w-full text-left font-bold border border-light-border px-4 py-2 mt-2 mb-5 rounded focus:outline-none"
                placeholder="직접 전화번호 입력"
                onChange={(e) => {
                  setFormData((f: ComplaintFormData) => ({
                    ...f,
                    phone: e.target.value,
                  }));
                }}
              />
            </>
          )}

          {/* 민원 종류 선택 */}
          <label className="md:col-span-1 col-span-3 font-bold text-[1rem] md:py-5 py-0">
            민원 종류 선택
            <span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-3 md:my-5 text-[0.73rem] md:text-sm border border-light-border rounded`}
          >
            {["재활용", "일반", "음식물", "기타"].map((label, idx, arr) => (
              <button
                key={label}
                type="button"
                className={`
                  flex-1 px-4 font-bold
                  ${formData.selectedTrash === label ? "bg-lighter-green" : ""}
                  ${idx === 0 ? "rounded-l" : ""}
                  ${idx === arr.length - 1 ? "rounded-r" : ""}
                  focus:outline-none
                `}
                style={{
                  borderRight:
                    idx !== arr.length - 1 ? "1px solid #ACACAC" : "none",
                }}
                onClick={() =>
                  setFormData((f: ComplaintFormData) => ({
                    ...f,
                    selectedTrash: label,
                  }))
                }
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={
              !["재활용", "일반", "음식물", "기타"].includes(
                formData.selectedTrash
              )
                ? formData.selectedTrash
                : ""
            }
            placeholder={focus.trashInput ? "" : "직접 입력"}
            className={`md:col-span-1 col-span-3 border border-light-border px-3 py-2 md:my-5 rounded w-full md:text-center text-left outline-none font-bold`}
            onFocus={() => setFocus((f) => ({ ...f, trashInput: true }))}
            onBlur={() => setFocus((f) => ({ ...f, trashInput: false }))}
            onChange={(e) =>
              setFormData((f: ComplaintFormData) => ({
                ...f,
                selectedTrash: e.target.value,
              }))
            }
            onClick={() =>
              setFormData((f: ComplaintFormData) => ({
                ...f,
                selectedTrash: "",
              }))
            }
          />

          {/* 쓰레기 상세 종류 */}
          <label className="md:col-span-1 col-span-3 font-bold text-[1rem] py-5">
            쓰레기 상세 종류
          </label>
          <input
            type="text"
            placeholder={focus.input3 ? "" : "입력란"}
            className="w-full md:w-[200px] md:col-span-1 col-span-3 border border-light-border px-3 py-2 rounded md:text-center text-left outline-none font-bold md:my-5 -mt-5"
            onFocus={() => setFocus((f) => ({ ...f, input3: true }))}
            onBlur={() => setFocus((f) => ({ ...f, input3: false }))}
            value={formData.trashDetail}
            onChange={(e) =>
              setFormData((f) => ({ ...f, trashDetail: e.target.value }))
            }
          />
          <div className="hidden md:block md:col-span-3"></div>

          {/* 파일 첨부 */}
          <FileAttach formData={formData} setFormData={setFormData} />

          {/* 민원 내용 */}
          <label className="md:col-span-1 col-span-3 font-bold text-[1rem] md:mt-5 self-start">
            민원 내용
          </label>
          <textarea
            id="content"
            value={formData.content}
            className="md:col-span-4 col-span-3 border border-light-border px-3 md:py-2 md:mt-5 rounded w-full h-40 resize-none outline-none"
            onChange={(e) => {
              setFormData((f) => ({ ...f, content: e.target.value }));
            }}
          />

          {/* 악성 민원 체크 */}
          <div className="hidden md:block md:col-span-1"></div>
          <div className="md:col-span-1 col-span-2 flex items-center gap-2 row-span-1 md:mt-5">
            <input
              type="checkbox"
              id="malicious"
              className="w-5 h-5 accent-red"
              checked={formData.isMalicious}
              onChange={(e) =>
                setFormData((f) => ({ ...f, isMalicious: e.target.checked }))
              }
            />
            <label
              htmlFor="malicious"
              className={`flex items-center text-[1rem] ${formData.isMalicious ? "text-red" : ""}`}
            >
              <img
                src={formData.isMalicious ? attentionRed : attention}
                alt="찡그린 표정"
                className="w-6 h-6 mr-1"
              />
              반복 민원
            </label>
          </div>
        </div>
      </form>

      {/* 제출 버튼 */}
      <div className="text-center mt-5">
        <button
          type="submit"
          className="bg-light-green hover:bg-green-600 text-white font-semibold px-20 py-2 rounded"
          onClick={handleSubmit}
        >
          검토 및 전송
        </button>
      </div>
    </div>
  );
}
