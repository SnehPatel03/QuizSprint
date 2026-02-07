import React, { useState } from "react";
import axios from "axios";
import {
  X,
  Plus,
  Trash2,
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

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(
        `https://quizsprint-fox0.onrender.com/admin/question/createQuefor${currentRound}/${quiz.id}`,
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
    } catch {
      showToast("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {toast.show && (
        <div
          className={`fixed top-6 right-6 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl ${
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

      <div className="relative bg-[#0b0f14] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Set Quiz Questions
              </h2>
              <p className="text-slate-400 text-sm">
                Round {currentRound} of 3
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
            >
              <X className="text-slate-300" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((r) => (
              <div
                key={r}
                className={`flex-1 h-2 rounded-full ${
                  r <= currentRound ? "bg-slate-300" : "bg-slate-700"
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
              className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">
                  Question {qi + 1}
                </h3>
                <button onClick={() => removeQuestion(qi)}>
                  <Trash2 className="text-red-400" />
                </button>
              </div>

              <input
                value={q.question}
                onChange={(e) => {
                  const copy = [...getCurrentQuestions()];
                  copy[qi].question = e.target.value;
                  setCurrentQuestions(copy);
                }}
                placeholder="Enter question"
                className="w-full bg-[#0b0f14] border border-slate-700 rounded-xl px-4 py-3 text-white"
              />

              {q.options.map((opt, oi) => (
                <div key={oi} className="flex gap-3 items-center">
                  <input
                    type="radio"
                    checked={q.correctAnswer === oi}
                    onChange={() => {
                      const copy = [...getCurrentQuestions()];
                      copy[qi].correctAnswer = oi;
                      setCurrentQuestions(copy);
                    }}
                  />
                  <input
                    value={opt}
                    onChange={(e) => {
                      const copy = [...getCurrentQuestions()];
                      copy[qi].options[oi] = e.target.value;
                      setCurrentQuestions(copy);
                    }}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 bg-[#0b0f14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full border border-dashed border-slate-700 p-4 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition"
          >
            <Plus className="inline mr-2" />
            Add Question
          </button>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-800 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-slate-200 text-black font-semibold py-3 rounded-xl hover:bg-white transition"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetQuePopUp;
