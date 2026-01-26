import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Play, Calendar, Trophy, Zap, Crown, X } from "lucide-react";
import Navbar from "../../../Server/src/Controllers/NavBar";

const Dashboard = () => {
  const [liveQuizzes, setLiveQuizzes] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningQuizId, setJoiningQuizId] = useState(null);

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    success: false,
    quizId: null,
  });

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const [liveRes, draftRes, completedRes] = await Promise.all([
        axios.get("http://localhost:3000/user/fetchQuizUserLive", { withCredentials: true }),
        axios.get("http://localhost:3000/user/fetchQuizUserUpcoming", { withCredentials: true }),
        axios.get("http://localhost:3000/user/fetchQuizUserCompleted", { withCredentials: true }),
      ]);

      setLiveQuizzes(liveRes.data.quiz || []);
      setUpcomingQuizzes(draftRes.data.quiz || []);
      setCompletedQuizzes(completedRes.data.quiz || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load quizzes");
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
    try {
      setJoiningQuizId(quizId);

      const res = await axios.post(
        `http://localhost:3000/user/joinQuiz/${quizId}`,
        {},
        { withCredentials: true }
      );

      setPopup({ show: true, message: res.data.message || "Joined quiz successfully", success: true, quizId });
    } catch (err) {
      setPopup({ show: true, message: err?.response?.data?.message || "Failed to join quiz", success: false, quizId: null });
    } finally {
      setJoiningQuizId(null);
    }
  };

  const closePopup = () => setPopup({ show: false, message: "", success: false, quizId: null });

  // ================= QUIZ CARD =================
  const QuizCard = ({ quiz, status }) => (
    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200 shadow hover:shadow-xl transition flex flex-col justify-between min-h-[180px]">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-800">{quiz.title}</h3>
          <span className="px-3 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-700">{status}</span>
        </div>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{quiz.description}</p>

        {(status === "UPCOMING" || status === "DRAFT") && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4 text-blue-500" />
            Starts at {new Date(quiz.startTime).toLocaleString()}
          </div>
        )}

        {status === "LIVE" && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-red-600 font-semibold">
              <Play className="w-4 h-4 text-red-500 animate-pulse" />
              {Math.floor((new Date() - new Date(quiz.startTime)) / (1000 * 60)) < 1
                ? "Just started"
                : `Started ${Math.floor((new Date() - new Date(quiz.startTime)) / (1000 * 60))} min ago`}
            </div>
            <button
              onClick={() => handleJoinQuiz(quiz.id)}
              disabled={joiningQuizId === quiz.id}
              className={`px-4 py-1.5 text-xs font-semibold text-white rounded-full shadow transition-all ${
                joiningQuizId === quiz.id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-orange-500 hover:scale-105"
              }`}
            >
              {joiningQuizId === quiz.id ? "Joining..." : "Join Quiz"}
            </button>
          </div>
        )}

        {status === "COMPLETED" && quiz.winner && (
          <div className="flex items-center gap-2 text-xs mt-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-amber-600">Winner: {quiz.winner}</span>
          </div>
        )}
      </div>
    </div>
  );

  const QuizSection = ({ title, data, status, icon }) => (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">{icon}</div>
        <h2 className="text-2xl font-bold text-slate-800">{title} ({data.length})</h2>
      </div>
      {data.length === 0 ? (
        <div className="bg-white/60 p-6 rounded-xl text-center text-slate-500">No quizzes available</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} status={status} />)}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Zap className="w-8 h-8 animate-pulse text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-6 py-8">
        <Toaster position="top-right" />

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Welcome 👋</h1>
          <span className="text-2xl font-bold text-slate-800">{localStorage.getItem("name")}</span>
          <p className="text-slate-500">Participate in quizzes and track results</p>
        </div>

        <QuizSection title="Live Quizzes" data={liveQuizzes} status="LIVE" icon={<Play />} />
        <QuizSection title="Upcoming Quizzes" data={upcomingQuizzes} status="UPCOMING" icon={<Calendar />} />
        <QuizSection title="Completed Quizzes" data={completedQuizzes} status="COMPLETED" icon={<Trophy />} />

        {popup.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={closePopup} />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Quiz Status</h2>
                <button onClick={closePopup}><X /></button>
              </div>
              <p className="mb-4 text-slate-700">{popup.message}</p>
              {popup.success ? (
                <button
                  onClick={() => (window.location.href = `/quiz/${popup.quizId}/round/1`)}
                  className="w-full py-2 bg-blue-600 text-white font-semibold rounded-xl hover:scale-105 transition"
                >
                  Go to Quiz
                </button>
              ) : (
                <button onClick={closePopup} className="w-full py-2 bg-gray-300 text-gray-700 font-semibold rounded-xl">Close</button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
