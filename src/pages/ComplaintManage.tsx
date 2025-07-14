import { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";
import editIcon from "../assets/icons/edit.svg";
import folderIcon from "../assets/icons/folder.svg";
import Header from "../components/Header";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintConfirm from "../components/ComplaintConfirm";
import DateTimeBox from "../components/DateTimeBox";

function onSubmit() {
  // ! 백엔드로 모든 정보 전송
}

const ComplaintManage = () => {
  const initialFormData = {
    address: "",
    routeInput: "",
    selectedRoute: "",
    phone: "",
    selectedTrash: "",
    trashInput: "",
    trashDetail: "",
    content: "",
    isMalicious: false,
    forwardTargets: [] as string[],
  };
  const [activeTab, setActiveTab] = useState("register");
  const [formData, setFormData] = useState(initialFormData);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 폼 데이터 변경 감지
  useEffect(() => {
    const hasData = !!(
      formData.address ||
      formData.selectedRoute ||
      formData.selectedTrash ||
      formData.content ||
      formData.trashDetail ||
      formData.phone
    );

    setHasUnsavedChanges(hasData);
  }, [formData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "작성 중인 민원이 있습니다. 정말 나가시겠습니까?";
        return "작성 중인 민원이 있습니다. 정말 나가시겠습니까?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTabClick = (nextTab: string) => {
    if (
      activeTab === "register" && // 작성 중에서
      nextTab !== "register" && // 다른 탭으로 이동
      hasUnsavedChanges
    ) {
      const confirmLeave = window.confirm(
        "작성 중인 민원이 있습니다. 정말 나가시겠습니까?"
      );
      if (!confirmLeave) return;
    }
    setFormData(initialFormData);
    setActiveTab(nextTab);
  };

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
          onTabClick={handleTabClick}
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
                  setFormData={setFormData}
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
