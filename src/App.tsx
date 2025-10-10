import React from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import CacheManager from './components/common/CacheManager';
import { useAuth } from './hooks/useAuth';
import ComplaintManage from './pages/ComplaintManage';
import EditComplaintPage from './pages/EditComplaintPage';
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import MapOverview from './pages/MapOverview';
import NoticeManage from './pages/NoticeManage';

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
    <>
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
            <Route path="/dev/cache" element={<CacheManager />} />
            <Route path="/" element={<MainPage />} />
            <Route path="/complaints" element={<ComplaintManage />} />
            <Route path="/complaints/table" element={<ComplaintManage />} />
            <Route path="/complaints/form" element={<ComplaintManage />} />
            <Route path="/complaints/stats" element={<ComplaintManage />} />
            <Route
              path="/complaints/edit/:complaintId"
              element={<EditComplaintPage />}
            />
            <Route path="/map/overview" element={<MapOverview />} />
            <Route
              path="/map/overview/complaints/:complaintId"
              element={<MapOverview />}
            />
            <Route path="/map/overview/complaints" element={<MapOverview />} />
            <Route path="/notice" element={<NoticeManage />} />
            <Route path="/notice/table" element={<NoticeManage />} />
            <Route path="/notice/form" element={<NoticeManage />} />
            <Route path="/notice/detail" element={<NoticeManage />} />
          </>
        ) : (
          // 인증되지 않은 경우 모든 경로를 로그인으로 리다이렉트
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </>
  );
};

export default App;
