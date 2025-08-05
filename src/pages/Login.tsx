import React, { useState } from "react";
import mdLogo from "../assets/icons/logo/mid_logo.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [serial, setSerial] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 로그인 API 호출 함수
  const loginWithSerial = async (serial_no: number) => {
    try {
      const response = await axios.get(
        `http://49.50.128.88:3000/user/login/${serial_no}`
      );

      if (response.status === 200) {
        // 로그인 성공
        const { message, user, token } = response.data;

        console.log(response.data, message);

        // 사용자 정보와 토큰을 함께 저장
        const userData = {
          ...user,
          token: token,
        };

        // 로컬 스토리지에 사용자 정보 저장 (자동 로그인용)
        if (autoLogin) {
          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.setItem("serial_no", user.serial_no.toString());
          localStorage.setItem("userToken", token);
        }

        // 세션 스토리지에 사용자 정보 저장
        sessionStorage.setItem("userData", JSON.stringify(userData));
        sessionStorage.setItem("serial_no", user.serial_no.toString());
        sessionStorage.setItem("userToken", token);

        return { success: true, data: userData };
      }
    } catch (error) {
      console.error("로그인 실패:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: "존재하지 않는 시리얼 번호입니다.",
          };
        } else if (error.response?.status === 400) {
          return { success: false, message: "잘못된 요청입니다." };
        } else {
          return { success: false, message: "서버 오류가 발생했습니다." };
        }
      }

      return { success: false, message: "로그인 중 오류가 발생했습니다." };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true); // 로딩 상태 추가

    try {
      const serialNo = parseInt(serial);
      const result = await loginWithSerial(serialNo);

      if (result && result.success) {
        // 로그인 성공 시 메인 페이지로 이동
        navigate("/");
      } else {
        // 로그인 실패 시 에러 메시지 표시
        alert(result?.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 처리 중 오류:", error);
      alert("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }

    console.log(
      `시리얼코드: ${serial}\n자동로그인: ${autoLogin ? "예" : "아니오"}`
    );
  };

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSerial(e.target.value);
    if (error) setError(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen w-screen">
      <div className="h-full flex items-center justify-center w-2/3 md:w-1/2">
        <img
          className="text-2xl font-bold mb-6 text-center"
          src={mdLogo}
          alt="중간 크기 경원환경개발 초록색 로고"
        />
      </div>
      <div className="md:w-2/4 md:pr-20">
        <form onSubmit={handleSubmit} className="bg-white p-8 max-w-screen">
          <h2 className="text-3xl font-bold mb-6">로그인</h2>
          <div className="mb-4">
            <input
              id="serial"
              type="text"
              className={`w-full px-5 py-3 text-xl border rounded focus:outline-none transition-colors duration-200 ${
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
              onChange={(e) => setAutoLogin(e.target.checked)}
              className="mr-2"
            />
            <label
              htmlFor="autoLogin"
              className="text-gray-500 select-none text-lg"
            >
              자동 로그인
            </label>
          </div>
          <button
            type="submit"
            className={`w-full py-2 text-lg rounded transition outline-none border-none focus:outline-none ${
              serial
                ? "bg-[#00BA13] text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
