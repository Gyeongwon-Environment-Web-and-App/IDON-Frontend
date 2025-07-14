import React, { useState } from "react";
import underArrow from "../assets/icons/under_arrow.svg";
import attention from "../assets/icons/attention.svg";
import attentionRed from "../assets/icons/attention_red.svg";
import FileAttach from "./FileAttach";
import type { ComplaintFormData } from "../types/complaint";

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
    <div className="">
      <form className="border border-light-border rounded-[15px]">
        <div className="mt-0 mpx-5">{dateTimeBox}</div>
        <div className="max-w-4xl mx-10 my-10 grid grid-cols-[150px_1fr_1fr_1fr_150px] gap-x-4 items-center text-sm">
          {/* 민원 발생 주소 */}
          <label htmlFor="address" className="col-span-1 font-bold text-[1rem]">
            민원 발생 주소
            <span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            id="address"
            className="col-span-3 border border-light-border px-3 py-2 rounded w-full outline-none"
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
          <div className="col-span-1"></div>
          <button
            type="button"
            className="w-full text-left font-bold bg-lighter-green border col-span-4 border-light-green px-4 mt-2 mb-5 rounded focus:outline-none flex"
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
            className={`col-span-1 font-bold text-[1rem] pt-5 ${formData.selectedRoute !== "경원환경" ? "mb-5" : ""}`}
          >
            민원 접수 경로
            <span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-3 mt-5 border border-light-border rounded ${formData.selectedRoute !== "경원환경" ? "mb-5" : ""}`}
          >
            {["경원환경", "다산콜(120)", "구청", "주민센터"].map(
              (label, idx, arr) => (
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
              )
            )}
          </div>
          <input
            type="text"
            placeholder={focus.routeInput ? "" : "직접 입력"}
            className={`col-span-1 border border-light-border px-3 py-2 mt-5 rounded w-full text-center outline-none font-bold ${formData.selectedRoute !== "경원환경" ? "mb-5" : ""}`}
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

          {/* 직접 전화번호 입력 */}
          {formData.selectedRoute === "경원환경" && (
            <>
              <div className="col-span-1"></div>
              <input
                type="text"
                value={formData.phone}
                className="col-span-4 w-full text-left font-bold border border-light-border px-4 py-2 mt-2 mb-5 rounded focus:outline-none flex"
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
          <label className="col-span-1 font-bold text-[1rem] py-5">
            민원 종류 선택
            <span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-3 my-5 border border-light-border rounded`}
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
            className={`col-span-1 border border-light-border px-3 py-2 my-5 rounded w-full text-center outline-none font-bold`}
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
          <label className="col-span-1 font-bold text-[1rem] py-5">
            쓰레기 상세 종류
          </label>
          <input
            type="text"
            placeholder={focus.input3 ? "" : "입력란"}
            className="w-[200px] col-span-2 border border-light-border px-3 py-2 rounded text-center outline-none font-bold my-5"
            onFocus={() => setFocus((f) => ({ ...f, input3: true }))}
            onBlur={() => setFocus((f) => ({ ...f, input3: false }))}
            value={formData.trashDetail}
            onChange={(e) =>
              setFormData((f) => ({ ...f, trashDetail: e.target.value }))
            }
          />
          <div className="col-span-2"></div>

          {/* 파일 첨부 */}
          <FileAttach formData={formData} setFormData={setFormData} />

          {/* 민원 내용 */}
          <label className="col-span-1 font-bold text-[1rem] mt-5 self-start">
            민원 내용
          </label>
          <textarea
            id="content"
            value={formData.content}
            className="col-span-4 border border-light-border px-3 py-2 mt-5 rounded w-full h-40 resize-none outline-none"
            onChange={(e) => {
              setFormData((f) => ({ ...f, content: e.target.value }));
            }}
          />

          {/* 악성 민원 체크 */}
          <div className="col-span-1"></div>
          <div className="col-span-2 flex items-center gap-2 row-span-1 mt-5">
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
