import React, { useState } from "react";
import axios from "axios";
import { X, Zap, CheckCircle, AlertCircle } from "lucide-react";

const PopUp = ({ onClose, onSuccess }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "https://quizsprint-fox0.onrender.com/admin/quiz",
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

      showToast("Quiz created successfully!", "success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 800);
    } catch (error) {
      console.error(error);
      showToast("Failed to create quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn">
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl animate-slideDown ${
            toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Quiz</h2>
              <p className="text-blue-100 text-sm">Configure quiz & round timings</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center">
            <X className="text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <input name="title" placeholder="Quiz Title" value={formData.title} onChange={handleChange} className="w-full input" required />
          <textarea name="description" placeholder="Quiz Description" value={formData.description} onChange={handleChange} className="w-full input resize-none" rows={3} required />

          <div className="grid md:grid-cols-3 gap-4">
            <input type="number" name="maxParticipants" placeholder="Max Participants" value={formData.maxParticipants} onChange={handleChange} className="input" required />
            <input type="number" name="round2Players" placeholder="Round 2 Players" value={formData.round2Players} onChange={handleChange} className="input" required />
            <input type="number" name="round3Players" placeholder="Round 3 Players" value={formData.round3Players} onChange={handleChange} className="input" required />
          </div>

          <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full input" required />

          <div className="grid md:grid-cols-3 gap-4">
            <input type="number" name="timeLimit1" placeholder="Round 1 Time (min)" value={formData.timeLimit1} onChange={handleChange} className="input" required />
            <input type="number" name="timeLimit2" placeholder="Round 2 Time (min)" value={formData.timeLimit2} onChange={handleChange} className="input" required />
            <input type="number" name="timeLimit3" placeholder="Round 3 Time (min)" value={formData.timeLimit3} onChange={handleChange} className="input" required />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-xl font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:scale-105 transition">
              {loading ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </form>

      </div>
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
        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
        @keyframes slideUp { from {transform:translateY(20px);opacity:0;} to {transform:translateY(0);opacity:1;} }
        @keyframes slideDown { from {transform:translateY(-20px);opacity:0;} to {transform:translateY(0);opacity:1;} }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default PopUp;
