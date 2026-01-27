import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Play, Calendar, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();

  const [liveQuizzes, setLiveQuizzes] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joiningQuizId, setJoiningQuizId] = useState(null);

  // ================= POPUP STATES =================
  const [showPopup, setShowPopup] = useState(false);
  const [popupTimeLeft, setPopupTimeLeft] = useState(0);
  const [popupQuizId, setPopupQuizId] = useState(null);

  // ================= FETCH QUIZZES =================
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const [live, upcoming, completed] = await Promise.all([
        axios.get("https://quizsprint-fox0.onrender.com/user/fetchQuizUserLive", {
          withCredentials: true,
        }),
        axios.get("https://quizsprint-fox0.onrender.com/user/fetchQuizUserUpcoming", {
          withCredentials: true,
        }),
        axios.get("https://quizsprint-fox0.onrender.com/user/fetchQuizUserCompleted", {
          withCredentials: true,
        }),
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
        setShowPopup(false);
        navigate(`/quiz/${quizId}/round/1`);
      } else {
        setPopupQuizId(quizId);
        setPopupTimeLeft(Math.max(0, Math.floor(res.data.startsInMs / 1000)));
        setShowPopup(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to join quiz");
    } finally {
      setJoiningQuizId(null);
    }
  };

  // ================= POPUP TIMER =================
  useEffect(() => {
    if (!showPopup || popupTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setPopupTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleJoinQuiz(popupQuizId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPopup, popupQuizId]);

  // ================= FORMAT TIME =================
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ================= QUIZ CARD =================
  const QuizCard = ({ quiz, status }) => {
    const startTime = new Date(quiz.round1StartTime || quiz.startTime).getTime();
    const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((startTime - Date.now()) / 1000)));

    useEffect(() => {
      const interval = setInterval(() => {
        const diff = Math.max(0, Math.floor((startTime - Date.now()) / 1000));
        setTimeLeft(diff);
      }, 1000);

      return () => clearInterval(interval);
    }, [startTime]);

    const started = Date.now() >= startTime;

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
                  <Play />
                  Live Now
                </div>
              )}
            </>
          )}

          {status === "UPCOMING" && (
            <div className="text-sm text-slate-500 flex gap-2 items-center">
              <Calendar />
              {new Date(startTime).toLocaleString()}
            </div>
          )}
        </div>

        {status === "LIVE" && (
          <button
            disabled={!started || joiningQuizId === quiz.id}
            onClick={() => handleJoinQuiz(quiz.id)}
            className={`mt-4 py-2 rounded-xl text-white font-semibold ${
              !started ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {!started ? "Round Not Started" : joiningQuizId === quiz.id ? "Joining..." : "Join Quiz"}
          </button>
        )}

        {status === "COMPLETED" && quiz.winner && (
          <div className="text-xs mt-2 flex gap-2 items-center">
            <Crown className="text-yellow-500" />
            Winner: {quiz.winner}
          </div>
        )}
      </div>
    );
  };

  // ================= LOADING =================
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
        <h1 className="text-3xl font-bold mb-6">Welcome 👋 {localStorage.getItem("name")}</h1>

        {/* LIVE QUIZZES */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Live Quizzes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveQuizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} status="LIVE" />
            ))}
          </div>
        </section>

        {/* UPCOMING QUIZZES */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Upcoming Quizzes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingQuizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} status="UPCOMING" />
            ))}
          </div>
        </section>

        {/* COMPLETED QUIZZES */}
        <section>
          <h2 className="text-xl font-bold mb-4">Completed Quizzes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} status="COMPLETED" />
            ))}
          </div>
        </section>

        {/* ================= POPUP ================= */}
        {showPopup && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 px-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Round Not Started Yet</h2>
                <p className="text-blue-100 text-sm">Please wait for the round to begin</p>
              </div>

              <div className="p-8 text-center">
                <p className="text-slate-600 mb-6 text-lg">Round will start in:</p>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-blue-100">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-mono">
                    {formatTime(popupTimeLeft)}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinQuiz(popupQuizId)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      </div>
    </>
  );
};

export default Dashboard;
