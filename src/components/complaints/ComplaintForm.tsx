import React, { useState, useEffect, useRef } from "react";
import underArrow from "../../assets/icons/functions/under_arrow.svg";
import attention from "../../assets/icons/attention.svg";
import attentionRed from "../../assets/icons/attention_red.svg";
import FileAttach from "../FileAttach";
import { AddressService } from "../../services/addressService";
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

  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [addresses, setAddresses] = useState<
    Array<{
      roadAddress: string;
      jibunAddress: string;
      englishAddress: string;
      x: string;
      y: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 주소 검색 기능
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // 로딩 중이거나 에러가 있을 때는 드롭다운을 유지
        if (!loading && !error) {
          setShowAddressSearch(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [loading, error]);

  // 주소 검색 함수
  const searchAddresses = async () => {
    if (!formData.address.trim() || formData.address.length < 2) {
      setAddresses([]);
      setError("주소를 2글자 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setShowAddressSearch(true);

    try {
      const results = await AddressService.searchAddress(formData.address);
      setAddresses(results);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "주소 검색에 실패했습니다.";

      // 더 친화적인 에러 메시지로 변환
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes("검색 시간이 초과되었습니다")) {
        userFriendlyMessage = "검색 시간이 초과되었습니다. 다시 시도해주세요.";
      } else if (errorMessage.includes("API 키가 유효하지 않습니다")) {
        userFriendlyMessage =
          "API 설정에 문제가 있습니다. 관리자에게 문의해주세요.";
      } else if (errorMessage.includes("API 호출 한도를 초과했습니다")) {
        userFriendlyMessage =
          "일일 검색 한도를 초과했습니다. 내일 다시 시도해주세요.";
      } else if (errorMessage.includes("잘못된 요청입니다")) {
        userFriendlyMessage = "검색어를 확인해주세요. (예: 시루봉로200길)";
      }

      setError(userFriendlyMessage);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="overflow-y-auto overflow-x-hidden max-w-screen w-full">
      <form className="md:border md:border-light-border rounded-[15px]">
        <div className="mt-0">{dateTimeBox}</div>
        <div className="max-w-4xl md:mx-10 md:my-10 my-2 grid grid-cols-3 md:grid-cols-[150px_1fr_1fr_1fr_150px] gap-x-1 md:gap-x-4 gap-y-3 md:gap-y-0 items-start md:items-center text-sm">
          {/* 민원 발생 주소 */}
          <label
            htmlFor="address"
            className="md:col-span-1 col-span-3 font-bold md:text-[1rem] text-base md:mb-1 -mb-3"
          >
            민원 발생 주소
            <span className="text-red pr-0"> *</span>
          </label>
          <div className="block md:hidden col-span-2"></div>

          <div className="col-span-2 md:col-span-3 relative">
            <input
              type="text"
              id="address"
              className={`border px-3 py-2 rounded w-full outline-none ${
                error ? "border-red-500" : "border-light-border"
              }`}
              value={formData.address}
              onChange={(e) => {
                setFormData((f: ComplaintFormData) => ({
                  ...f,
                  address: e.target.value,
                }));
                // 입력 시 에러 상태 초기화
                if (error) setError(null);
                // 드롭다운 숨기기
                setShowAddressSearch(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  searchAddresses();
                }
              }}
              placeholder="주소를 입력하세요"
            />

            {/* 주소 검색 드롭다운 */}
            {showAddressSearch && (
              <div
                ref={dropdownRef}
                className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{ top: "100%", left: 0 }}
              >
                {loading && (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto mb-2"></div>
                    검색 중... (최대 3초)
                  </div>
                )}

                {!loading && !error && addresses.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <svg
                      className="w-5 h-5 mx-auto mb-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    검색 결과가 없습니다.
                    <br />
                    <span className="text-xs">다른 키워드로 검색해보세요.</span>
                  </div>
                )}

                {!loading &&
                  !error &&
                  addresses.length > 0 &&
                  addresses.map((address, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                      onClick={() => {
                        // 도로명 주소가 있으면 도로명 주소를, 없으면 지번 주소를 사용
                        const selectedAddress =
                          address.roadAddress || address.jibunAddress;
                        setFormData((f: ComplaintFormData) => ({
                          ...f,
                          address: selectedAddress,
                        }));
                        setShowAddressSearch(false);
                      }}
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {address.roadAddress}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {address.jibunAddress}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="col-span-1 border border-light-border px-4 py-2 rounded w-full font-bold"
            onClick={searchAddresses}
          >
            주소 찾기
          </button>

          {/* 지도 확인 */}
          <div className="hidden md:block md:col-span-1"></div>
          <button
            type="button"
            className="w-full text-left font-bold bg-lighter-green border md:col-span-4 col-span-3 border-light-green px-4 -mt-1 md:mt-2 rounded focus:outline-none flex"
          >
            지도에서 민원 위치 확인하기
            <img
              src={underArrow}
              alt="아래방향 화살표"
              className="pl-2 w-6 h-5"
            />
          </button>

          {!loading && error && (
            <>
              <div className="hidden md:block md:col-span-1"></div>
              <div className="text-red col-span-2 flex justify-start items-center md:mt-2 md:mb-2">
                <img src={attentionRed} alt="경고 아이콘" className="w-5 h-5 mr-1" />
                {error}
              </div>
              <div className="md:col-span-2"></div>
            </>
          )}

          {/* 민원 접수 경로 */}
          <label
            className={`md:col-span-1 col-span-3 font-bold text-[1rem] pt-5 ${formData.selectedRoute !== "경원환경" ? "md:mb-5" : ""}`}
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
            className={`md:col-span-1 col-span-3 border border-light-border px-3 py-2 md:mt-5 rounded w-full md:text-center text-left outline-none font-bold ${formData.selectedRoute !== "경원환경" ? "md:mb-5" : ""}`}
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
          <div className="h-5 md:hidden"></div>

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
