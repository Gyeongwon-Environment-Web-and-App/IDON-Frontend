import React, { useState } from "react";
import PageLayout from "../components/PageLayout";
import editIcon from "../assets/icons/edit.svg";

const ComplaintManage = () => {
  const [activeTab, setActiveTab] = useState("register");

  return (
    <div className="w-screen h-[90vh] flex justify-center mt-10">
      <PageLayout
        title="민원 등록"
        icon={<img src={editIcon} alt="icon" className="w-7 h-7" />}
        tabs={[
          { label: "내역 / 관리", value: "manage" },
          { label: "민원 등록", value: "register" },
        ]}
        activeTab={activeTab}
        onTabClick={setActiveTab}
      >
        {/* 민원 등록 콘텐츠 */}
        <div className="">
          {activeTab === "manage" && <div>민원 내역 및 관리 화면</div>}
          {activeTab === "register" && (
            <div>민원 등록 폼{/* 여기에 form 요소들 추가 */}</div>
          )}
        </div>
      </PageLayout>
    </div>
  );
};

export default ComplaintManage;
