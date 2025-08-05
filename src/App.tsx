import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ComplaintManage from "./pages/ComplaintManage";
import MapOverview from "./pages/MapOverview";
import MainPage from "./pages/MainPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/complaints" element={<ComplaintManage />} />
        <Route path="/complaints/table" element={<ComplaintManage />} />
        <Route path="/complaints/form" element={<ComplaintManage />} />
        <Route path="/map/overview" element={<MapOverview />} />
        <Route path="/" element={<MainPage />} />
        {/* 다른 라우트 여기에 추가 */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
