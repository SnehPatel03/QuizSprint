import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  FileText,
  Play,
  Trophy,
  Calendar,
  Crown,
  Zap,
  Trash2,
  Settings2,
  Edit2,
} from "lucide-react";

import PopUp from "../components/PopUp";
import UpdatePopUp from "../components/UpdatePopUp.jsx";
import SetQuePopUp from "../components/SetQuePopUp.jsx";
import QuizInfoPopup from "../components/QuizInfoPopup.jsx";
import Navbar from "../../../Server/src/Controllers/NavBar.jsx";

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showQuePopup, setShowQuePopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/admin/fetchQuiz", {
        withCredentials: true,
      });

      setQuizzes(res.data.quiz || []);
      setAdminName(localStorage.getItem("name") || "Admin");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Normalize status for safe filtering
  const getStatus = (status) => status?.toUpperCase().trim();

  const draftQuizzes = quizzes.filter((q) => getStatus(q.status) === "DRAFT");
  const liveQuizzes = quizzes.filter((q) => getStatus(q.status) === "LIVE");
  const completedQuizzes = quizzes.filter((q) => getStatus(q.status) === "COMPLETED");

  const QuizCard = ({ quiz }) => {
    const [deleting, setDeleting] = useState(false);

    const statusColor = {
      DRAFT: "bg-slate-200 text-slate-700",
      LIVE: "bg-blue-100 text-blue-700",
      COMPLETED: "bg-emerald-100 text-emerald-700",
    };

    const handleDelete = async () => {
      if (getStatus(quiz.status) !== "DRAFT") {
        toast.error("Only DRAFT quizzes can be deleted");
        return;
      }

      if (!window.confirm("Delete this quiz?")) return;

      setDeleting(true);
      try {
        await axios.delete(
          `http://localhost:3000/admin/deleteQuiz/${quiz.id}`,
          { withCredentials: true }
        );
        setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
        toast.success("Quiz deleted");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Delete failed");
      } finally {
        setDeleting(false);
      }
    };

    const handleUpdate = () => {
      if (getStatus(quiz.status) !== "DRAFT") {
        toast.error("Only DRAFT quizzes can be updated");
        return;
      }
      setEditingQuiz(quiz);
      setShowUpdatePopup(true);
    };

    const handleSetQuestions = () => {
      if (getStatus(quiz.status) !== "DRAFT") {
        toast.error("Quiz is not in DRAFT. Cannot set questions.");
        return;
      }
      setEditingQuiz(quiz);
      setShowQuePopup(true);
    };

    const handleInfo = () => {
      setEditingQuiz(quiz);
      setShowInfoPopup(true);
    };

    return (
      <div className="bg-white rounded-2xl p-5 shadow flex flex-col justify-between">
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="font-bold text-lg">{quiz.title}</h3>
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                statusColor[getStatus(quiz.status)]
              }`}
            >
              {getStatus(quiz.status)}
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-3">{quiz.description}</p>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(quiz.startTime).toLocaleString()}
          </div>

          {getStatus(quiz.status) === "COMPLETED" && quiz.winner && (
            <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
              <Crown className="w-4 h-4" />
              Winner: {quiz.winner}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleSetQuestions}
            disabled={getStatus(quiz.status) !== "DRAFT"}
            className="px-3 py-1 rounded-full bg-indigo-500 text-white text-sm disabled:opacity-40"
          >
            Set Ques
          </button>

          <button
            onClick={handleUpdate}
            disabled={getStatus(quiz.status) !== "DRAFT"}
            className="p-2 bg-blue-100 rounded-full disabled:opacity-40"
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting || getStatus(quiz.status) !== "DRAFT"}
            className="p-2 bg-red-100 rounded-full disabled:opacity-40"
          >
            <Trash2 size={16} />
          </button>

          <button
            onClick={handleInfo}
            className="p-2 bg-slate-100 rounded-full"
          >
            <FileText size={16} />
          </button>
        </div>
      </div>
    );
  };

  const QuizSection = ({ title, data, icon }) => (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">
          {title} ({data.length})
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="bg-white p-6 rounded-xl text-center text-slate-500">
          No quizzes
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Zap className="animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />

      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Hi, {adminName} 👋</h1>
            <p className="text-slate-500">Manage your quizzes</p>
          </div>

          <button
            onClick={() => setShowCreatePopup(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl"
          >
            <Plus />
            Create Quiz
          </button>
        </div>

        {showCreatePopup && (
          <PopUp onClose={() => setShowCreatePopup(false)} onSuccess={fetchQuizzes} />
        )}
        {showUpdatePopup && editingQuiz && (
          <UpdatePopUp
            quiz={editingQuiz}
            onClose={() => setShowUpdatePopup(false)}
            onSuccess={fetchQuizzes}
          />
        )}
        {showQuePopup && editingQuiz && (
          <SetQuePopUp
            quiz={editingQuiz}
            onClose={() => setShowQuePopup(false)}
            onSuccess={fetchQuizzes}
          />
        )}
        {showInfoPopup && editingQuiz && (
          <QuizInfoPopup
            quiz={editingQuiz}
            onClose={() => setShowInfoPopup(false)}
          />
        )}

        <QuizSection title="Draft Quizzes" data={draftQuizzes} icon={<FileText />} />
        <QuizSection title="Live Quizzes" data={liveQuizzes} icon={<Play />} />
        <QuizSection title="Completed Quizzes" data={completedQuizzes} icon={<Trophy />} />
      </div>
    </>
  );
};

export default AdminDashboard;
