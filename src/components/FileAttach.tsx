import React, { useRef, useState } from "react";
import axios, { AxiosError } from "axios";

const FileAttach = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileUploadFail, setFileUploadFail] = useState(false);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploadedFileName(null); // 이전 업로드 상태 초기화
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadedFileName(selectedFile.name);
      if (!res) {
        throw new Error("파일 전송 실패", res)
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      setFileUploadFail(true)
      if (error.response) {
        // 서버가 응답했으나 에러(404, 500 등)
        console.error("에러 코드:", error.response.status);
        console.error("에러 메시지:", error.response.data);
      } else if (error.request) {
        // 요청은 갔으나 응답이 없음
        console.error("응답 없음", error.request);
      } else {
        // 기타 에러
        console.error("에러 발생", error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <label className="col-span-1 font-bold text-[1rem] py-5">파일 첨부</label>
      <div className="col-span-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          style={{ display: "none" }}
        />

        <button
          type="button"
          onClick={handleFileClick}
          className="w-[200px] border border-light-border px-3 py-2 rounded text-center outline-none font-bold my-5"
        >
          파일 선택
        </button>

        <span className="ml-5">
          {uploading
            ? "업로드 중..."
            : uploadedFileName
            ? `${uploadedFileName}`
            : fileUploadFail
            ? "업로드 실패"
            : "선택된 파일 없음"}
        </span>
      </div>
      <div className="col-span-1"></div>
    </>
  );
};

export default FileAttach;
