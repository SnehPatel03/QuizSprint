import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Play, Calendar, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

/* ---------- EMPTY STATE ---------- */
const EmptyState = ({ title, description }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-2xl border border-slate-800 bg-[#0b0f14]/60 text-center">
      <div className="mb-4 text-4xl opacity-60">🕒</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-xs">
        {description}
      </p>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [liveQuizzes, setLiveQuizzes] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joiningQuizId, setJoiningQuizId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupTimeLeft, setPopupTimeLeft] = useState(0);
  const [popupQuizId, setPopupQuizId] = useState(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const [live, upcoming, completed] = await Promise.all([
        axios.get("https://quiz-sprint-server.vercel.app/user/fetchQuizUserLive", { withCredentials: true }),
        axios.get("https://quiz-sprint-server.vercel.app/user/fetchQuizUserUpcoming", { withCredentials: true }),
        axios.get("https://quiz-sprint-server.vercel.app/user/fetchQuizUserCompleted", { withCredentials: true }),
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

  const handleJoinQuiz = async (quizId) => {
    if (joiningQuizId) return;
    setJoiningQuizId(quizId);

    try {
      const res = await axios.post(
        `https://quiz-sprint-server.vercel.app/user/joinQuiz/${quizId}`,
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const QuizCard = ({ quiz, status }) => {
    const startTimeMs = new Date(
      quiz.round1StartTime || quiz.startTime
    ).getTime();

    const [timeLeft, setTimeLeft] = useState(
      Math.max(0, Math.floor((startTimeMs - Date.now()) / 1000))
    );

    useEffect(() => {
      if (timeLeft <= 0) return;

      const t = setInterval(() => {
        setTimeLeft(
          Math.max(0, Math.floor((startTimeMs - Date.now()) / 1000))
        );
      }, 1000);

      return () => clearInterval(t);
    }, [startTimeMs]);

    const started = Date.now() >= startTimeMs;

    const badgeStyle = {
      LIVE: "bg-red-500/20 text-red-400 border border-red-500/30",
      UPCOMING: "bg-slate-700/40 text-slate-300 border border-slate-600",
      COMPLETED: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    };

    return (
      <div className="bg-[#0b0f14] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[190px] shadow-lg">
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold text-white">{quiz.title}</h3>
            <span className={`text-xs px-3 py-1 rounded-full ${badgeStyle[status]}`}>
              {status}
            </span>
          </div>

          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
            {quiz.description}
          </p>

          {status === "LIVE" && (
            <>
              {!started ? (
                <div className="text-sm font-semibold flex gap-2 items-center px-3 py-1 rounded-lg bg-red-500/10 text-red-400 w-fit">
                  <Play className="animate-pulse" size={16} />
                  Starts in {formatTime(timeLeft)}
                </div>
              ) : (
                <div className="text-sm font-semibold flex gap-2 items-center px-3 py-1 rounded-lg bg-green-500/10 text-green-400 w-fit">
                  <Play size={16} />
                  Live Now
                </div>
              )}
            </>
          )}

          {status === "UPCOMING" && (
            <div className="text-sm text-slate-400 flex gap-2 items-start">
              <Calendar size={16} className="mt-1" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Starts at</span>
                <span className="font-medium text-slate-200">
                  {new Date(startTimeMs).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          )}

          {status === "COMPLETED" && quiz.winner && (
            <div className="mt-2 text-sm font-semibold text-amber-400 flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-lg w-fit">
              <Crown size={16} />
              Winner: {quiz.winner}
            </div>
          )}
        </div>

        {status === "LIVE" && (
          <button
            disabled={!started || joiningQuizId === quiz.id}
            onClick={() => handleJoinQuiz(quiz.id)}
            className={`mt-4 py-3 rounded-xl text-base font-semibold transition active:scale-95 ${
              !started
                ? "bg-slate-700 text-slate-400"
                : "bg-white text-black hover:bg-slate-200"
            }`}
          >
            {!started
              ? "Round Not Started"
              : joiningQuizId === quiz.id
              ? "Joining..."
              : "Join Quiz"}
          </button>
        )}
      </div>
    );
  };

  /* ---------- LOADER ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />

      <div className="min-h-screen bg-black relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-6">
            Welcome 👋 {localStorage.getItem("name")}
          </h1>

          {/* LIVE */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Live Quizzes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveQuizzes.length > 0 ? (
                liveQuizzes.map((q) => (
                  <QuizCard key={q.id} quiz={q} status="LIVE" />
                ))
              ) : (
                <EmptyState
                  title="No live quizzes"
                  description="There are no live quizzes running right now."
                />
              )}
            </div>
          </section>

          {/* UPCOMING */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Upcoming Quizzes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingQuizzes.length > 0 ? (
                upcomingQuizzes.map((q) => (
                  <QuizCard key={q.id} quiz={q} status="UPCOMING" />
                ))
              ) : (
                <EmptyState
                  title="No upcoming quizzes"
                  description="New quizzes will appear here once scheduled."
                />
              )}
            </div>
          </section>

          {/* COMPLETED */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              Completed Quizzes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedQuizzes.length > 0 ? (
                completedQuizzes.map((q) => (
                  <QuizCard key={q.id} quiz={q} status="COMPLETED" />
                ))
              ) : (
                <EmptyState
                  title="No completed quizzes yet"
                  description="Participate in quizzes to see your history here."
                />
              )}
            </div>
          </section>
        </div>

        {/* POPUP */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0b0f14] border border-slate-800 w-[90%] max-w-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-center text-lg font-semibold text-white">
                Round Starting Soon
              </h2>

              <div className="mt-4 text-center text-5xl font-mono font-bold text-white">
                {formatTime(popupTimeLeft)}
              </div>

              <p className="mt-3 text-center text-sm text-slate-400">
                Please wait while we prepare your quiz
              </p>

              <button
                onClick={() => handleJoinQuiz(popupQuizId)}
                className="mt-6 w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition"
              >
                Check Status
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
