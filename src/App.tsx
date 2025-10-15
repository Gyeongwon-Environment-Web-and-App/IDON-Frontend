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
import TransportManage from './pages/TransportManage';

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

            {/* 민원 관리 */}
            <Route path="/complaints" element={<ComplaintManage />} />
            <Route path="/complaints/table" element={<ComplaintManage />} />
            <Route path="/complaints/form" element={<ComplaintManage />} />
            <Route path="/complaints/stats" element={<ComplaintManage />} />
            <Route
              path="/complaints/edit/:complaintId"
              element={<EditComplaintPage />}
            />

            {/* 지도 */}
            <Route path="/map/overview" element={<MapOverview />} />
            <Route
              path="/map/overview/complaints/:complaintId"
              element={<MapOverview />}
            />
            <Route path="/map/overview/complaints" element={<MapOverview />} />

            {/* 공지사항 */}
            <Route path="/notice" element={<NoticeManage />} />
            <Route path="/notice/table" element={<NoticeManage />} />
            <Route path="/notice/form" element={<NoticeManage />} />
            <Route path="/notice/detail" element={<NoticeManage />} />

            {/* 차량 관리 */}
            <Route path="/transport/driver/form" element={<TransportManage />} />
            <Route path="/transport/driver/info" element={<TransportManage />} />
            <Route path="/transport/vehicle/info" element={<TransportManage />} />
            <Route path="/transport/vehicle/form" element={<TransportManage />} />
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
