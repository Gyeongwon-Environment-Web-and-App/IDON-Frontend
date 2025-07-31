import React, { useState } from "react";
import mdLogo from "../assets/icons/logo/mid_logo.svg";

const Login: React.FC = () => {
  const [serial, setSerial] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(false);

  // 시리얼번호 유효성 검사 (임시: 4자리 이상이면 통과)
  const validateSerial = (value: string) => {
    //! 실제 검증 로직
    return value.length >= 4;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSerial(serial)) {
      setError(true);
      return;
    }
    setError(false);
    //! 로그인 처리 로직 추가
    alert(`시리얼코드: ${serial}\n자동로그인: ${autoLogin ? "예" : "아니오"}`);
  };

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSerial(e.target.value);
    if (error) setError(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen" style={{ padding: "10%" }}>
      <div className="h-full flex items-center justify-center w-1/2">
        <img className="text-2xl font-bold mb-6 text-center" src={mdLogo} alt="중간 크기 경원환경개발 초록색 로고" />
      </div>
      <div className="w-1/2">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 max-w-screen"
        >
          <h2 className="text-2xl font-bold mb-6">로그인</h2>
          <div className="mb-4">
            <input
              id="serial"
              type="text"
              className={`w-full px-3 py-2 border rounded focus:outline-none transition-colors duration-200 ${
                isFocused
                  ? error
                    ? "border-[#FF3D3D] outline-[#FF3D3D]"
                    : "border-[#00BA13] outline-[#00BA13]"
                  : error
                  ? "border-[#FF3D3D]"
                  : "border-gray-300"
              }`}
              value={serial}
              onChange={handleSerialChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required
              autoComplete="off"
              placeholder={isFocused ? "" : "시리얼코드"}
            />
            {error && (
              <p className="text-[#FF3D3D] text-sm mt-2">
                시리얼 넘버가 올바르지 않습니다. 다시 한 번 확인해 주세요.
              </p>
            )}
          </div>
          <div className="mb-6 flex items-center">
            <input
              id="autoLogin"
              type="checkbox"
              checked={autoLogin}
              onChange={e => setAutoLogin(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="autoLogin" className="text-gray-500 select-none">
              자동 로그인
            </label>
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded transition outline-none border-none focus:outline-none ${
              serial
                ? "bg-[#00BA13] text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!serial}
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
