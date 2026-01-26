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

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Heropage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route
          path="/quiz/:quizId/round/:roundNumber"
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
