// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Play, Calendar, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// =================== UTILS ===================
export const formatIST = (utcTime) => {
  if (!utcTime) return "-";
  return new Date(utcTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

export const getUTCms = (utcTime) => {
  return new Date(utcTime).getTime();
};

// Convert server UTC ms to IST ms for timers
export const getISTms = (utcTime) => {
  const d = new Date(utcTime);
  // IST = UTC + 5:30
  return d.getTime() + 5.5 * 60 * 60 * 1000;
};

// =================== DASHBOARD ===================
const Dashboard = () => {
  const navigate = useNavigate();

  const [liveQuizzes, setLiveQuizzes] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joiningQuizId, setJoiningQuizId] = useState(null);

  // ================= FETCH QUIZZES =================
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const [live, upcoming, completed] = await Promise.all([
        axios.get("https://quizsprint-fox0.onrender.com/user/fetchQuizUserLive", { withCredentials: true }),
        axios.get("https://quizsprint-fox0.onrender.com/user/fetchQuizUserUpcoming", { withCredentials: true }),
        axios.get("https://quizsprint-fox0.onrender.com/user/fetchQuizUserCompleted", { withCredentials: true }),
      ]);

      setLiveQuizzes(live.data.quiz || []);
      setUpcomingQuizzes(upcoming.data.quiz || []);
      setCompletedQuizzes(completed.data.quiz || []);
    } catch {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // ================= JOIN QUIZ =================
  const handleJoinQuiz = async (quizId) => {
    if (joiningQuizId) return;
    setJoiningQuizId(quizId);

    try {
      const res = await axios.post(
        `https://quizsprint-fox0.onrender.com/user/joinQuiz/${quizId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.roundStarted) {
        navigate(`/quiz/${quizId}/round/1`);
      } else {
        toast.info(`Round will start at ${formatIST(res.data.startTime)}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to join quiz");
    } finally {
      setJoiningQuizId(null);
    }
  };

  // ================= QUIZ CARD =================
  const QuizCard = ({ quiz, status }) => {
    // Calculate countdown using IST milliseconds
    const startTime = quiz.round1StartTime || quiz.startTime;
    const startTimeMs = getUTCms(startTime);
    const [timeLeft, setTimeLeft] = useState(Math.max(0, startTimeMs - Date.now()));

    const started = Date.now() >= startTimeMs;

    useEffect(() => {
      if (timeLeft <= 0) return;
      const t = setInterval(() => setTimeLeft(Math.max(0, startTimeMs - Date.now())), 1000);
      return () => clearInterval(t);
    }, [startTimeMs, timeLeft]);

    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
      <div className="bg-white rounded-2xl p-5 shadow flex flex-col justify-between min-h-[190px]">
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">{quiz.title}</h3>
            <span className="text-xs px-3 py-1 bg-blue-100 rounded-full">{status}</span>
          </div>

          <p className="text-sm text-slate-600 mb-3">{quiz.description}</p>

          {status === "LIVE" && (
            <>
              {!started ? (
                <div className="text-sm text-red-600 font-semibold flex gap-2 items-center">
                  <Play className="animate-pulse" />
                  Starts in {formatTime(timeLeft)}
                </div>
              ) : (
                <div className="text-sm text-green-600 font-semibold flex gap-2 items-center">
                  <Play /> Live Now
                </div>
              )}
            </>
          )}

          {status === "UPCOMING" && (
            <div className="text-sm text-slate-500 flex gap-2 items-center">
              <Calendar /> {formatIST(startTime)}
            </div>
          )}
        </div>

        {status === "LIVE" && (
          <button
            disabled={!started || joiningQuizId === quiz.id}
            onClick={() => handleJoinQuiz(quiz.id)}
            className={`mt-4 py-2 rounded-xl text-white font-semibold ${
              !started
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90"
            }`}
          >
            {!started
              ? "Round Not Started"
              : joiningQuizId === quiz.id
              ? "Joining..."
              : "Join Quiz"}
          </button>
        )}

        {status === "COMPLETED" && quiz.winner && (
          <div className="text-xs mt-2 flex gap-2 items-center">
            <Crown className="text-yellow-500" /> Winner: {quiz.winner}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Zap className="animate-pulse text-blue-600" />
      </div>
    );
  }

  // ================= UI =================
  return (
    <>
      <Navbar />
      <Toaster position="top-right" />

      <div className="p-6 bg-slate-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          Welcome 👋 {localStorage.getItem("name")}
        </h1>

        <p className="text-xs text-gray-400 mb-6">All times shown in IST (UTC +5:30)</p>

        {/* LIVE QUIZZES */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Live Quizzes</h2>
          {liveQuizzes.length === 0 ? (
            <p className="text-slate-500">No live quizzes available</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveQuizzes.map((q) => (
                <QuizCard key={q.id} quiz={q} status="LIVE" />
              ))}
            </div>
          )}
        </section>

        {/* UPCOMING QUIZZES */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Upcoming Quizzes</h2>
          {upcomingQuizzes.length === 0 ? (
            <p className="text-slate-500">No upcoming quizzes available</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingQuizzes.map((q) => (
                <QuizCard key={q.id} quiz={q} status="UPCOMING" />
              ))}
            </div>
          )}
        </section>

        {/* COMPLETED QUIZZES */}
        <section>
          <h2 className="text-xl font-bold mb-4">Completed Quizzes</h2>
          {completedQuizzes.length === 0 ? (
            <p className="text-slate-500">No completed quizzes available</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedQuizzes.map((q) => (
                <QuizCard key={q.id} quiz={q} status="COMPLETED" />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Dashboard;
