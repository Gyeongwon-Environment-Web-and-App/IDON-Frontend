import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import ComplaintManage from "./pages/ComplaintManage";
import MapOverview from "./pages/MapOverview";
import MainPage from "./pages/MainPage";

const App: React.FC = () => {
  //! const { isAuthenticated } = useAuth(); //! 임시
  const isAuthenticated = true;

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 페이지 */}
        <Route 
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        
        {/* 보호된 라우트들 - 조건부 렌더링 */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<MainPage />} />
            <Route path="/complaints" element={<ComplaintManage />} />
            <Route path="/complaints/table" element={<ComplaintManage />} />
            <Route path="/complaints/form" element={<ComplaintManage />} />
            <Route path="/map/overview" element={<MapOverview />} />
          </>
        ) : (
          // 인증되지 않은 경우 모든 경로를 로그인으로 리다이렉트
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
