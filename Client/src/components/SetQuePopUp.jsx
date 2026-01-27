import React, { useState } from "react";
import axios from "axios";
import {
  X,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const SetQuePopUp = ({ quiz, onClose, onSuccess }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [round1Questions, setRound1Questions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [round2Questions, setRound2Questions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [round3Questions, setRound3Questions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  /* ================= TOAST ================= */
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const showApiError = (error) => {
    const data = error?.response?.data;
    if (data?.message) return showToast(data.message, "error");
    showToast("Something went wrong", "error");
  };

  /* ================= HELPERS ================= */
  const getCurrentQuestions = () =>
    currentRound === 1
      ? round1Questions
      : currentRound === 2
      ? round2Questions
      : round3Questions;

  const setCurrentQuestions = (q) =>
    currentRound === 1
      ? setRound1Questions(q)
      : currentRound === 2
      ? setRound2Questions(q)
      : setRound3Questions(q);

  const buildBackendPayload = () => ({
    rounds: [
      {
        questions: getCurrentQuestions().map((q) => ({
          text: q.question,
          options: q.options.map((opt, i) => ({
            text: opt,
            isCorrect: i === q.correctAnswer,
          })),
        })),
      },
    ],
  });

  /* ================= CRUD ================= */
  const addQuestion = () =>
    setCurrentQuestions([
      ...getCurrentQuestions(),
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);

  const removeQuestion = (i) => {
    if (getCurrentQuestions().length === 1)
      return showToast("At least one question required");
    setCurrentQuestions(getCurrentQuestions().filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i, field, value) => {
    const q = [...getCurrentQuestions()];
    q[i][field] = value;
    setCurrentQuestions(q);
  };

  const updateOption = (qi, oi, val) => {
    const q = [...getCurrentQuestions()];
    q[qi].options[oi] = val;
    setCurrentQuestions(q);
  };

  /* ================= VALIDATION ================= */
  const validateQuestions = () => {
    for (let i = 0; i < getCurrentQuestions().length; i++) {
      const q = getCurrentQuestions()[i];
      if (!q.question.trim()) {
        showToast(`Question ${i + 1} is empty`);
        return false;
      }
      if (q.options.filter((o) => o.trim()).length < 2) {
        showToast(`Question ${i + 1} needs 2 options`);
        return false;
      }
    }
    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validateQuestions()) return;

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:3000/admin/question/createQuefor${currentRound}/${quiz.id}`,
        buildBackendPayload(),
        { withCredentials: true }
      );

      showToast(`Round ${currentRound} saved`, "success");

      currentRound < 3
        ? setTimeout(() => setCurrentRound((r) => r + 1), 600)
        : setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {toast.show && (
        <div
          className={`fixed top-6 right-6 flex gap-3 px-6 py-4 rounded-xl shadow-xl ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle /> : <AlertCircle />}
          {toast.message}
        </div>
      )}

      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Set Quiz Questions</h2>
              <p className="text-blue-100">Round {currentRound} of 3</p>
            </div>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((r) => (
              <div
                key={r}
                className={`flex-1 h-2 rounded-full ${
                  r <= currentRound ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto max-h-[65vh] space-y-6">
          {getCurrentQuestions().map((q, qi) => (
            <div
              key={qi}
              className="bg-slate-50 border rounded-2xl p-6"
            >
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">Question {qi + 1}</h3>
                <button onClick={() => removeQuestion(qi)}>
                  <Trash2 className="text-red-500" />
                </button>
              </div>

              <input
                value={q.question}
                onChange={(e) =>
                  updateQuestion(qi, "question", e.target.value)
                }
                placeholder="Enter question"
                className="w-full mb-4 px-4 py-3 border rounded-xl"
              />

              {q.options.map((opt, oi) => (
                <div key={oi} className="flex gap-3 mb-2">
                  <input
                    type="radio"
                    checked={q.correctAnswer === oi}
                    onChange={() =>
                      updateQuestion(qi, "correctAnswer", oi)
                    }
                  />
                  <input
                    value={opt}
                    onChange={(e) =>
                      updateOption(qi, oi, e.target.value)
                    }
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full border-dashed border-2 p-4 rounded-xl text-blue-600 font-semibold"
          >
            <Plus className="inline mr-2" /> Add Question
          </button>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 py-3 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetQuePopUp;
