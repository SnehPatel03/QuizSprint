import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Zap, CheckCircle, AlertCircle } from "lucide-react";

const UpdatePopUp = ({ onClose, onSuccess, quiz }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxParticipants: "",
    round2Players: "",
    round3Players: "",
    startTime: "",
    timeLimit1: "",
    timeLimit2: "",
    timeLimit3: "",
  });

  // ================= PREFILL FORM =================
  useEffect(() => {
    if (!quiz) return;

    setFormData({
      title: quiz.title || "",
      description: quiz.description || "",
      maxParticipants: quiz.maxParticipants ?? "",
      round2Players: quiz.round2Players ?? "",
      round3Players: quiz.round3Players ?? "",
      startTime: quiz.startTime
        ? new Date(quiz.startTime).toISOString().slice(0, 16)
        : "",
      timeLimit1: quiz.timeLimit1 ?? "",
      timeLimit2: quiz.timeLimit2 ?? "",
      timeLimit3: quiz.timeLimit3 ?? "",
    });
  }, [quiz]);

  // ================= HANDLERS =================
  const handleChange = (e) => {
    if (quiz.status === "LIVE") {
      alert("You can't update quiz details when the quiz is LIVE");
      return;
    }
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "" }),
      3000
    );
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (quiz.status === "LIVE") {
      alert("You can't update quiz details when the quiz is LIVE");
      return;
    }

    if (!quiz?.id) return;

    setLoading(true);

    try {
      await axios.patch(
        `https://quizsprint-fox0.onrender.com/admin/updateQuiz/${quiz.id}`,
        {
          title: formData.title,
          description: formData.description,
          maxParticipants: Number(formData.maxParticipants),
          round2Players: Number(formData.round2Players),
          round3Players: Number(formData.round3Players),
          startTime: formData.startTime,
          timeLimit1: Number(formData.timeLimit1),
          timeLimit2: Number(formData.timeLimit2),
          timeLimit3: Number(formData.timeLimit3),
        },
        { withCredentials: true }
      );

      showToast("Quiz updated successfully", "success");

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 800);
    } catch (error) {
      console.error("Update Quiz Error:", error);
      showToast(
        error?.response?.data?.message || "Failed to update quiz",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER =================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl animate-slideDown ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Update Quiz
              </h2>
              <p className="text-blue-100 text-sm">
                Modify quiz details & round timings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center"
          >
            <X className="text-white" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Quiz Title"
            className="w-full input"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Quiz Description"
            rows={3}
            className="w-full input resize-none"
            required
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="Max Participants"
              className="input"
              required
            />
            <input
              type="number"
              name="round2Players"
              value={formData.round2Players}
              onChange={handleChange}
              placeholder="Round 2 Players"
              className="input"
              required
            />
            <input
              type="number"
              name="round3Players"
              value={formData.round3Players}
              onChange={handleChange}
              placeholder="Round 3 Players"
              className="input"
              required
            />
          </div>

          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full input"
            required
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              name="timeLimit1"
              value={formData.timeLimit1}
              onChange={handleChange}
              placeholder="Round 1 Time (sec)"
              className="input"
              required
            />
            <input
              type="number"
              name="timeLimit2"
              value={formData.timeLimit2}
              onChange={handleChange}
              placeholder="Round 2 Time (sec)"
              className="input"
              required
            />
            <input
              type="number"
              name="timeLimit3"
              value={formData.timeLimit3}
              onChange={handleChange}
              placeholder="Round 3 Time (sec)"
              className="input"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || quiz.status === "LIVE"}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:scale-105 transition"
            >
              {loading
                ? "Updating..."
                : quiz.status === "LIVE"
                ? "Cannot Update LIVE Quiz"
                : "Update Quiz"}
            </button>
          </div>
        </form>
      </div>

      {/* Styles */}
      <style jsx>{`
        .input {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          outline: none;
        }
        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UpdatePopUp;
