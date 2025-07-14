import React from "react";
import TextForward from "./TextForward";
import general from "../assets/icons/general.svg"
import recycle from "../assets/icons/recycle.svg"
import other from "../assets/icons/other.svg"
import food from "../assets/icons/food.svg"

interface ComplaintFormData {
  address: string;
  routeInput: string;
  selectedRoute: string;
  phone: string;
  selectedTrash: string;
  trashInput: string;
  trashDetail: string;
  content: string;
  isMalicious: boolean;
  forwardTargets: string[];
}

interface ComplaintConfirmProps {
  dateTimeBox: React.ReactNode;
  formData: ComplaintFormData;
  setFormData: React.Dispatch<React.SetStateAction<ComplaintFormData>>;
  onSubmit: () => void;
}

export default function ComplaintConfirm({
  formData,
  dateTimeBox,
  setFormData,
  onSubmit,
}: ComplaintConfirmProps) {
  console.log(formData);

  return (
    <div className="">
      <form className="border border-light-border rounded-[15px]">
        <div className="mt-0 mpx-5">
          {dateTimeBox}
        </div>
        <div className="flex justify-between px-10 mt-10 mb-5 text-[1rem] font-bold w-full">
          <section className="mr-[3rem] w-[70%]">
            <p className="text-dark-gray">
              민원 종류 -{" "}
              <span className="text-black my-5">
                {formData.selectedTrash}
                {formData.trashDetail && ` (${formData.trashDetail})`}
              </span>
            </p>
            <p className="text-dark-gray my-5">
              민원 접수 종류 -{" "}
              <span className="text-black">
                {formData.selectedRoute}{" "}
                {formData.phone ? `(${formData.phone})` : ""}
              </span>
            </p>
            <p className="text-dark-gray my-5">
              민원 발생 주소 -{" "}
              <span className="text-black">{formData.address} </span>
            </p>
            <p className="text-dark-gray my-5 flex flex-col w-full">
              민원 내용
              <span className="text-black mt-5 p-5 bg-efefef rounded h-[7rem]">
                {formData.content}{" "}
              </span>
            </p>
          </section>
          <section className="w-[23%] text-center">
            <p className="text-dark-gr py-3">담당 기사님 실시간 정보</p>
            <div className="bg-efefef rounded w-full h-[7rem] my-2 mx-auto">
              {/* 실시간 지도 */}
            </div>
            <div className="flex justify-between pt-3 pb-2">
              {/* 재활용 등 쓰레기 태그 */}
              {/* 기사님 정보 가져오기 */}
              <div className="flex">
                <img src={formData.selectedTrash === '음식물' ? food : formData.selectedTrash === '재활용' ? recycle : formData.selectedTrash === '기타' ? other : formData.selectedTrash === '일반' ? general : ''} className="w-2/8 mr-2"alt="쓰레기 종류 태그" />
                <p className="text-black">김승대 기사님</p>
              </div>
              <p className="text-light-green">운행중</p>
            </div>
            <div className="text-sm text-left text-dark-gary font-normal">
              <p className="py-1">010-1234-5678</p>
              <p className="py-1">방학1동 - 재활용 1조</p>
              <p className="py-1">843거 4296</p>
            </div>
          </section>
        </div>
        <div className="flex items-center justify-center my-8">
          <TextForward
            options={['소장님께 전달', '클린팀에게 전달', '담당 기사님께 전달']}
            selectedValues={formData.forwardTargets}
            onChange={(updatedList) =>
              setFormData((prev) => ({ ...prev, forwardTargets: updatedList }))
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
