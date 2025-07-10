import { useState } from "react";
import PageLayout from "../components/PageLayout";
import editIcon from "../assets/icons/edit.svg";
import folderIcon from "../assets/icons/folder.svg";
import attentionRed from "../assets/icons/attention_red.svg";
import Header from "../components/Header";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintConfirm from "../components/ComplaintConfirm";

function formatDateTime(date: Date) {
  // 연, 월, 일
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // 오전/오후, 시, 분
  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const isAM = hour < 12;
  const ampm = isAM ? "오전" : "오후";
  if (!isAM) hour = hour === 12 ? 12 : hour - 12;
  if (hour === 0) hour = 12;

  return {
    date: `${year} . ${month}. ${day}`,
    time: `${ampm} ${hour}:${minute}`,
  };
}

function DateTimeBox({
  visible,
  repeat,
}: {
  visible: boolean;
  repeat: boolean;
}) {
  const [now] = useState(new Date());
  const { date, time } = formatDateTime(now);

  return (
    <div className="flex items-center justify-between gap-2 px-6 py-3 border-b border-light-border w-full">
      <div className="flex justify-between items-center">
        <span className="font-bold text-xl mr-2">{date}</span>
        <span className="text-gray-400 text-sm">{time}</span>
        {visible && (
          <button className="border border-darker-green ml-2 px-2 py-1 text-xs rounded-[2.77px] bg-darker-green text-white cursor-text">
            수정하기
          </button>
        )}
      </div>
      {repeat && (
        <div className="flex items-center">
          <img src={attentionRed} alt="반복 민원 아이콘" className="w-6 h-6" />
          <p className="text-red ml-1">반복 민원</p>
        </div>
      )}
    </div>
  );
}

function onSubmit() {}

const ComplaintManage = () => {
  const [activeTab, setActiveTab] = useState("register");
  const [formData, setFormData] = useState({
    address: "",
    routeInput: "",
    selectedRoute: "",
    phone: "",
    selectedTrash: "",
    trashInput: "",
    trashDetail: "",
    content: "",
    isMalicious: false,
  });
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="w-screen h-screen pt-10">
      <Header />
      <div className="flex justify-center items-center py-5">
        <PageLayout
          title="민원"
          icon={
            activeTab === "manage" ? (
              <img src={folderIcon} alt="icon" className="w-7 h-7" />
            ) : (
              <img src={editIcon} alt="icon" className="w-7 h-7" />
            )
          }
          tabs={[
            { label: "내역 / 관리", value: "manage" },
            { label: "민원 등록", value: "register" },
          ]}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          tabTitle={activeTab === "manage" ? "민원 내역 / 관리" : "민원 등록"}
        >
          {/* 민원 등록 콘텐츠 */}
          <div>
            {activeTab === "manage" && <></>}
            {activeTab === "register" &&
              (!showConfirm ? (
                <ComplaintForm
                  dateTimeBox={<DateTimeBox visible={true} repeat={false} />}
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={() => setShowConfirm(true)}
                />
              ) : (
                <ComplaintConfirm
                  dateTimeBox={
                    <DateTimeBox
                      visible={false}
                      repeat={formData.isMalicious}
                    />
                  }
                  formData={formData}
                  onSubmit={onSubmit}
                />
              ))}
          </div>
        </PageLayout>
      </div>
    </div>
  );
};

export default ComplaintManage;
