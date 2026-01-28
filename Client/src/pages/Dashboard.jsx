import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Play, Calendar, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

/**
 * Convert backend UTC date/time → IST epoch (ms)
 * NOTE: Date.now() is already timezone-independent
 */
const getISTTime = (utcTime) => {
  return new Date(
    new Date(utcTime).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  ).getTime();
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
        axios.get(
          "https://quizsprint-fox0.onrender.com/user/fetchQuizUserLive",
          { withCredentials: true }
        ),
        axios.get(
          "https://quizsprint-fox0.onrender.com/user/fetchQuizUserUpcoming",
          { withCredentials: true }
        ),
        axios.get(
          "https://quizsprint-fox0.onrender.com/user/fetchQuizUserCompleted",
          { withCredentials: true }
        ),
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
    // Convert backend UTC → IST ONCE
    const startTime = getISTTime(
      quiz.round1StartTime || quiz.startTime
    );

    const [timeLeft, setTimeLeft] = useState(
      Math.max(0, Math.floor((startTime - Date.now()) / 1000))
    );

    useEffect(() => {
      if (timeLeft <= 0) return;

      const t = setInterval(() => {
        setTimeLeft(
          Math.max(0, Math.floor((startTime - Date.now()) / 1000))
        );
      }, 1000);

      return () => clearInterval(t);
    }, [startTime]);

    const started = Date.now() >= startTime;

    return (
      <div className="bg-white rounded-2xl p-5 shadow flex flex-col justify-between min-h-[190px]">
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">{quiz.title}</h3>
            <span className="text-xs px-3 py-1 bg-blue-100 rounded-full">
              {status}
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-3">
            {quiz.description}
          </p>

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
              {new Date(startTime).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </div>
          )}
        </div>

        {status === "LIVE" && (
          <button
            disabled={!started || joiningQuizId === quiz.id}
            onClick={() => handleJoinQuiz(quiz.id)}
            className={`mt-4 py-2 rounded-xl text-white font-semibold ${
              !started
                ? "bg-gray-400"
                : "bg-red-500 hover:bg-red-600"
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
            <Crown className="text-yellow-500" />
            Winner: {quiz.winner}
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

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />

      <div className="p-6 bg-slate-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          Welcome 👋 {localStorage.getItem("name")}
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Live Quizzes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveQuizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} status="LIVE" />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Upcoming Quizzes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingQuizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} status="UPCOMING" />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">
            Completed Quizzes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} status="COMPLETED" />
            ))}
          </div>
        </section>

        {showPopup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl">
              <h2 className="text-center text-lg font-semibold text-gray-800">
                Round Starting Soon
              </h2>

              <div className="mt-4 text-center text-5xl font-mono font-bold text-blue-600 tracking-wider">
                {formatTime(popupTimeLeft)}
              </div>

              <p className="mt-3 text-center text-sm text-gray-500">
                Please wait while we prepare your quiz
              </p>

              <button
                onClick={() => handleJoinQuiz(popupQuizId)}
                className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
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
