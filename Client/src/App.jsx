import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Heropage from "./pages/Heropage";
import SignUp from "./pages/SignUp";
import NoFound from "./pages/NoFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import RoundPage from "./pages/RoundPage";
import RoundResult from "./pages/RoundResult";
import OtpVerify from "./pages/OtpVerify";
import ResetPassword from "./pages/ResetPassword";
import Forgot from "./pages/Forgot";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Heropage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify" element={<OtpVerify />} />
        <Route
          path="/quiz/:quizId/round/:roundNumber/"
          element={<RoundPage />}
        />
        <Route
          path="/user/quiz/:quizId/round/:roundNumber/:roundId"
          element={<RoundResult />}
        />

        <Route path="*" element={<NoFound />} />
      </Routes>
    </>
  );
}

export default App;
