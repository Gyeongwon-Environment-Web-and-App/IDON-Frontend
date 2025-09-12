import React, { useState, useEffect } from "react";
import TextForward from "../forms/TextForward";
import general from "../../assets/icons/categories/tags/general.svg";
import recycle from "../../assets/icons/categories/tags/recycle.svg";
import other from "../../assets/icons/categories/tags/other.svg";
import food from "../../assets/icons/categories/tags/food.svg";
import X from "../../assets/icons/navigation/arrows/X.svg";
import { formatAddressWithDong } from "../../utils/dongMapping";
import { useComplaintFormStore } from "../../stores/complaintFormStore";
import { formatDateToYYMMDD } from "@/utils/formatDateToYYMMDD";

interface ComplaintConfirmProps {
  dateTimeBox: React.ReactNode;
  onSubmit: () => void;
}

export default function ComplaintConfirm({
  dateTimeBox,
  onSubmit,
}: ComplaintConfirmProps) {
  // Get form data from Zustand store
  const { formData, updateFormData } = useComplaintFormStore();
  const [formattedAddress, setFormattedAddress] = useState(formData.address);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Format date/time for display
  const formatDisplayDateTime = (isoString: string) => {
    const date = new Date(isoString);

    let hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const isAM = hour < 12;
    const ampm = isAM ? "오전" : "오후";
    if (!isAM) hour = hour === 12 ? 12 : hour - 12;
    if (hour === 0) hour = 12;

    return {
      date: `${formatDateToYYMMDD(isoString)}`,
      time: `${ampm} ${hour}:${minute}`,
    };
  };

  console.log("uploadedFiles length:", formData.uploadedFiles.length);
  console.log("uploadedFiles:", formData.uploadedFiles);

  // Format address with dong info asynchronously
  useEffect(() => {
    const formatAddress = async () => {
      if (!formData.address) {
        setFormattedAddress("");
        return;
      }

      setIsLoadingAddress(true);
      try {
        const result = await formatAddressWithDong(formData.address);
        setFormattedAddress(result);
      } catch (error) {
        console.error("Address formatting error:", error);
        setFormattedAddress(formData.address); // Fallback to original address
      } finally {
        setIsLoadingAddress(false);
      }
    };

    formatAddress();
  }, [formData.address]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="overflow-y-auto overflow-x-hidden w-full">
      <form className="md:border md:border-light-border rounded-[15px]">
        <div className="mt-0 mpx-5">{dateTimeBox}</div>
        <div className="flex flex-col lg:flex-row md:justify-between items-center md:px-10 mt-2 md:mt-10 mb-5 text-[1rem] md:font-bold font-semibold">
          <section className="md:mr-[3rem] md:w-[65%] w-full">
            <p className="text-dark-gray">
              민원 종류 -{" "}
              <span className="text-black my-3 md:my-5">
                {formData.selectedTrash}
                {formData.trashDetail && ` (${formData.trashDetail})`}
              </span>
            </p>
            <p className="text-dark-gray my-3 md:my-5">
              민원 접수 종류 -{" "}
              <span className="text-black">
                {formData.selectedRoute}{" "}
                {formData.phone ? `(${formData.phone})` : ""}
              </span>
            </p>
            <p className="text-dark-gray my-3 md:my-5">
              민원 발생 주소 -{" "}
              <span className="text-black">
                {isLoadingAddress ? (
                  <span className="text-gray-500">주소 정보 로딩 중...</span>
                ) : (
                  formattedAddress
                )}
              </span>
            </p>
            {formData.dateTime && (
              <p className="text-dark-gray my-3 md:my-5">
                민원 발생 일시 -{" "}
                <span className="text-black">
                  {formatDisplayDateTime(formData.dateTime).date}{" "}
                  {formatDisplayDateTime(formData.dateTime).time}
                </span>
              </p>
            )}
            <p className="text-dark-gray my-3 md:my-5 flex flex-col w-full">
              민원 내용
              <span className="text-black md:mt-5 mt-3 md:p-5 bg-efefef rounded h-[7rem]">
                {formData.content}{" "}
              </span>
            </p>

            {/* 업로드된 파일 미리보기 */}
            {formData.uploadedFiles.length > 0 && (
              <div className="mt-5 border border-light-border w-full rounded overflow-hidden text-gray-text">
                <div className="font-normal text-sm flex justify-between bg-[#FAFAFB] px-2 py-1">
                  <div className="flex">
                    <img src={X} alt="닫기 아이콘" className="mr-2" />
                    파일명
                  </div>
                  <p>용량</p>
                </div>
                <div className="flex flex-col gap-3 px-2 py-2">
                  {formData.uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="relative flex items-center">
                        <img
                          src={X}
                          alt="닫기 아이콘"
                          className="mr-[6px] pt-[0.5px] pl-[0.5px] cursor-pointer"
                          onClick={() => {
                            updateFormData({
                              uploadedFiles: formData.uploadedFiles.filter(
                                (_, i) => i !== index
                              ),
                            });
                          }}
                        />
                        {file.type.startsWith("image/") ? (
                          <div className="w-8 h-8 rounded overflow-hidden relative group mr-2">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-8 h-8 object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik00OCA1NkM1Mi40MTgzIDU2IDU2IDUyLjQxODMgNT2gNDhDNTYgNTYuNDE4MyA1Mi40MTgzIDYwIDQ4IDYwQzQzLjU4MTcgNjAgNDAgNTYuNDE4MyA0MCA1MkM0MCA0Ny41ODE3IDQzLjU4MTcgNDQgNDggNDRaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik02NCA2NEgzMkMyOS43OTQ5IDY0IDI4IDYyLjIwNTEgMjggNjBWMzJDMjggMjkuNzk0OSAyOS43OTQ5IDI4IDMyIDI4SDY0QzY2LjIwNTEgMjggNjggMjkuNzk0OSA2OCAzMlY2MEM2OCA2Mi4yMDUxIDY2LjIwNTEgNjQgNjQgNjRaIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-7 h-7 text-[1.7rem] flex items-center justify-center mr-2">
                            📄
                          </div>
                        )}
                        <p className="text-xs text-center font-medium pl-1">
                          {file.name}
                        </p>
                      </div>
                      <p className="text-xs ml-2 font-medium">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="md:w-[25%] w-full md:text-center text-left">
            <p className="text-dark-gray py-2 md:py-3">
              담당 기사님 실시간 정보
            </p>
            <div className="bg-efefef rounded w-full h-[7rem] my-2 mx-auto">
              {/* 실시간 지도 */}
            </div>
            <div className="flex md:justify-between justify-start pt-3 pb-2">
              {/* 재활용 등 쓰레기 태그 */}
              {/* 기사님 정보 가져오기 */}
              <div className="flex">
                <img
                  src={
                    formData.selectedTrash === "음식물"
                      ? food
                      : formData.selectedTrash === "재활용"
                        ? recycle
                        : formData.selectedTrash === "기타"
                          ? other
                          : formData.selectedTrash === "일반"
                            ? general
                            : ""
                  }
                  className="w-1/3 mr-2"
                  alt="쓰레기 종류 태그"
                />
                <p className="text-black 3xl:text-base text-sm">
                  김승대 기사님
                </p>
              </div>
              <p className="text-light-green 3xl:text-base text-sm">운행중</p>
            </div>
            <div className="text-sm text-left text-dark-gary font-normal">
              <p className="md:py-1">010-1234-5678</p>
              <p className="md:py-1">방학1동 - 재활용 1조</p>
              <p className="md:py-1">843거 4296</p>
            </div>
          </section>
        </div>
        <div className="flex items-center justify-center my-8">
          <TextForward
            options={[
              "소장님께 전달",
              "민원팀에게 전달",
              "담당 기사님께 전달",
              "담당 팀장님께 전달",
            ]}
            mobileOptions={["소장님", "민원팀", "담당 기사님", "팀장님"]} // 모바일용 짧은 텍스트
            selectedValues={formData.forwardTargets}
            onChange={(updatedList) =>
              updateFormData({ forwardTargets: updatedList })
            }
          />
        </div>
      </form>

      {/* 제출 버튼 */}
      <div className="text-center mt-5">
        <button
          type="submit"
          className="bg-light-green hover:bg-green-600 text-white font-semibold px-20 py-2 rounded"
          onClick={onSubmit}
        >
          민원 전송
        </button>
      </div>
    </div>
  );
}
