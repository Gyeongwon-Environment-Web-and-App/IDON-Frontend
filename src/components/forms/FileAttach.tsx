import React, { useRef, useState } from 'react';

import type { ComplaintFormData } from '../../types/complaint';

interface FileAttachProps {
  formData: ComplaintFormData;
  setFormData: React.Dispatch<React.SetStateAction<ComplaintFormData>>;
}

const FileAttach = ({ formData, setFormData }: FileAttachProps) => {
  const [uploading, setUploading] = useState(false);
  const [, setUploadedFileName] = useState<string | null>(null);
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

    try {
      // 백엔드 없이 로컬에서 파일 처리
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        const fileUrl = event.target?.result as string;

        // formData에 파일 정보 추가
        const newFile = {
          name: selectedFile.name,
          url: fileUrl, // FileReader로 생성된 로컬 URL
          type: selectedFile.type,
          size: selectedFile.size,
        };

        console.log('새로 추가된 파일:', newFile);
        console.log('파일 크기:', selectedFile.size, '바이트');

        setFormData((prev) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, newFile],
        }));

        setUploadedFileName(selectedFile.name);
        setUploading(false);
      };

      fileReader.onerror = () => {
        setFileUploadFail(true);
        setUploading(false);
        console.error('파일 읽기 실패');
      };

      // 파일을 Data URL로 읽기
      fileReader.readAsDataURL(selectedFile);
    } catch (err: unknown) {
      setFileUploadFail(true);
      console.error('파일 처리 중 에러 발생:', err);
      setUploading(false);
    }
  };

  return (
    <>
      <label className="col-span-1 font-bold text-[1rem] md:py-5 pt-5">
        파일 첨부
      </label>
      <div className="col-span-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={handleFileClick}
          className="md:w-[200px] border border-light-border md:px-3 py-2 rounded text-center outline-none font-bold md:my-5"
        >
          파일 선택
        </button>

        <span className="ml-5">
          {uploading
            ? '업로드 중...'
            : formData.uploadedFiles.length > 0
              ? formData.uploadedFiles[formData.uploadedFiles.length - 1].name
              : fileUploadFail
                ? '업로드 실패'
                : '선택된 파일 없음'}
        </span>
      </div>
      <div className="col-span-1"></div>
    </>
  );
};

export default FileAttach;
