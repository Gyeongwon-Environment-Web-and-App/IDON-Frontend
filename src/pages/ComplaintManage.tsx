import { useState, useEffect } from "react";
import axios from "axios";
import type { ComplaintFormData } from "../types/complaint";
import editIcon from "../assets/icons/edit.svg";
import folderIcon from "../assets/icons/folder.svg";
import PageLayout from "../components/PageLayout";
import Header from "../components/Header";
import ComplaintForm from "../components/complaints/ComplaintForm";
import ComplaintConfirm from "../components/complaints/ComplaintConfirm";
import DateTimeBox from "../components/DateTimeBox";
import Popup from "@/components/Popup";

const ComplaintManage = () => {
  const initialFormData: ComplaintFormData = {
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
    uploadedFiles: [] as Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>,
  };
  const [activeTab, setActiveTab] = useState("register");
  const [formData, setFormData] = useState(initialFormData);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  // !백엔드로 정보 전송
  const onSubmit = async () => {
    try {
      // 1. 파일들을 FormData로 변환
      const formDataToSend = new FormData();

      // 2. 텍스트 데이터 추가
      formDataToSend.append("address", formData.address);
      formDataToSend.append("selectedRoute", formData.selectedRoute);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("selectedTrash", formData.selectedTrash);
      formDataToSend.append("trashDetail", formData.trashDetail);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("isMalicious", formData.isMalicious.toString());
      formDataToSend.append(
        "forwardTargets",
        JSON.stringify(formData.forwardTargets)
      );

      // 3. 파일들 추가 (Data URL을 Blob으로 변환)
      for (let i = 0; i < formData.uploadedFiles.length; i++) {
        const file = formData.uploadedFiles[i];
        // Data URL을 Blob으로 변환
        const response = await fetch(file.url);
        const blob = await response.blob();
        formDataToSend.append(`file_${i}`, blob, file.name);
      }

      // 4. 백엔드로 전송
      const response = await axios.post(
        "http://localhost:5000/api/complaints",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("민원 제출 성공:", response.data);
      setIsPopupOpen(true)

      // 5. 폼 초기화
      setFormData(initialFormData);
      setShowConfirm(false);
    } catch (error) {
      console.error("민원 제출 실패:", error);
      alert("민원 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="w-screen h-screen relative">
      {isPopupOpen && (
        <Popup
          message={<>
            <p>민원 전송이</p>
            <p>완료되었습니다.</p>
          </>}
          yesNo={false}
          onFirstClick={() => {
            // ! navigate to map
            console.log('first click')
          }}
          onSecondClick={() => {
            // ! navigate to complaint list
            console.log('second click')
          }}
          toHome={true}
        />
      )}
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
                      onBack={() => setShowConfirm(false)}
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
