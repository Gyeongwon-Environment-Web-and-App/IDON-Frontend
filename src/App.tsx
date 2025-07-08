import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ComplaintRegister from "./pages/ComplaintManage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<ComplaintRegister />} />
        {/* 다른 라우트 여기에 추가 */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
