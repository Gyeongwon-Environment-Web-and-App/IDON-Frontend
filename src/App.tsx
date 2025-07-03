import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ComplaintRegister from "./pages/ComplaintRegister";
import Header from "./components/Header";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Header /> 
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<ComplaintRegister />} />
        {/* 다른 라우트 여기에 추가 */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;