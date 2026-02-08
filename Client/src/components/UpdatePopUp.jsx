import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Zap, CheckCircle, AlertCircle } from "lucide-react";

const UpdatePopUp = ({ onClose, onSuccess, quiz }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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

  useEffect(() => {
    if (!quiz) return;

    const toDatetimeLocalValue = (dateString) => {
      const d = new Date(dateString);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    setFormData({
      title: quiz.title || "",
      description: quiz.description || "",
      maxParticipants: quiz.maxParticipants ?? "",
      round2Players: quiz.round2Players ?? "",
      round3Players: quiz.round3Players ?? "",
      startTime: quiz.startTime
        ? toDatetimeLocalValue(quiz.startTime)
        : "",
      timeLimit1: quiz.timeLimit1 ?? "",
      timeLimit2: quiz.timeLimit2 ?? "",
      timeLimit3: quiz.timeLimit3 ?? "",
    });
  }, [quiz]);

  const handleChange = (e) => {
    if (quiz.status === "LIVE") return;
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quiz.status === "LIVE") return;

    setLoading(true);
    try {
      await axios.patch(
        `http://localhost:3000/admin/updateQuiz/${quiz.id}`,
        {
          title: formData.title,
          description: formData.description,
          maxParticipants: Number(formData.maxParticipants),
          round2Players: Number(formData.round2Players),
          round3Players: Number(formData.round3Players),
          startTime: new Date(formData.startTime).toISOString(),
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
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to update quiz",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle /> : <AlertCircle />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#0b0f14] border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <Zap className="text-slate-200" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Update Quiz</h2>
              <p className="text-slate-400 text-sm">
                Modify quiz details & timings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
          >
            <X className="text-slate-300" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Quiz Title"
            className="input-dark"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Quiz Description"
            rows={3}
            className="input-dark resize-none"
            required
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="Max Participants"
              className="input-dark"
              required
            />
            <input
              type="number"
              name="round2Players"
              value={formData.round2Players}
              onChange={handleChange}
              placeholder="Round 2 Players"
              className="input-dark"
              required
            />
            <input
              type="number"
              name="round3Players"
              value={formData.round3Players}
              onChange={handleChange}
              placeholder="Round 3 Players"
              className="input-dark"
              required
            />
          </div>

          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="input-dark"
            required
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              name="timeLimit1"
              value={formData.timeLimit1}
              onChange={handleChange}
              placeholder="Round 1 Time (min)"
              className="input-dark"
              required
            />
            <input
              type="number"
              name="timeLimit2"
              value={formData.timeLimit2}
              onChange={handleChange}
              placeholder="Round 2 Time (min)"
              className="input-dark"
              required
            />
            <input
              type="number"
              name="timeLimit3"
              value={formData.timeLimit3}
              onChange={handleChange}
              placeholder="Round 3 Time (min)"
              className="input-dark"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || quiz.status === "LIVE"}
              className="flex-1 bg-slate-200 text-black font-semibold py-3 rounded-xl hover:bg-white transition disabled:opacity-40"
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
        .input-dark {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: #0b0f14;
          border: 1px solid #334155;
          color: #e5e7eb;
          outline: none;
        }
        .input-dark:focus {
          border-color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default UpdatePopUp;
