import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ComplaintManage from "./pages/ComplaintManage";
import MapOverview from "./pages/MapOverview";
import MainPage from "./pages/MainPage";
import { useAuth } from "./hooks/useAuth";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* 로그인 페이지 */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={login} />
          )
        }
      />

      {/* 보호된 라우트들 - 조건부 렌더링 */}
      {isAuthenticated ? (
        <>
          <Route path="/" element={<MainPage />} />
          <Route path="/complaints" element={<ComplaintManage />} />
          <Route path="/complaints/table" element={<ComplaintManage />} />
          <Route path="/complaints/form" element={<ComplaintManage />} />
          <Route path="/complaints/stats" element={<ComplaintManage />} />
          <Route path="/map/overview" element={<MapOverview />} />
          <Route path="/map/overview/:complaintId" element={<MapOverview />} />
        </>
      ) : (
        // 인증되지 않은 경우 모든 경로를 로그인으로 리다이렉트
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default App;
