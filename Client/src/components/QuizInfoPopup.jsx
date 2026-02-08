import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Trash2, Plus, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const QuizInfoPopup = ({ quiz, onClose }) => {
  const [rounds, setRounds] = useState({ 1: [], 2: [], 3: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  const isLive = quiz?.status === "LIVE";

  const fetchRound = async (round) => {
    const res = await axios.get(
      `quiz-sprint-client.vercel.app/admin/question/fetchQue/${quiz.id}/${round}`,
      { withCredentials: true }
    );
    return res.data.questions || [];
  };

  const fetchAllRounds = async () => {
    try {
      setLoading(true);
      const [r1, r2, r3] = await Promise.all([
        fetchRound(1),
        fetchRound(2),
        fetchRound(3),
      ]);
      setRounds({ 1: r1, 2: r2, 3: r3 });
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRounds();
  }, []);

  const deleteQuestion = async (id, round) => {
    if (isLive) return toast.error("Quiz is LIVE");
    if (!window.confirm("Delete this question?")) return;

    await axios.delete(
      `quiz-sprint-client.vercel.app/admin/question/deleteQue/${id}`,
      { withCredentials: true }
    );

    setRounds((prev) => ({
      ...prev,
      [round]: prev[round].filter((q) => q.id !== id),
    }));

    toast.success("Question deleted");
  };

  const saveQuestion = async (q) => {
    if (isLive) return toast.error("Quiz is LIVE");

    try {
      setSaving((p) => ({ ...p, [q.id]: true }));
      await axios.put(
        `quiz-sprint-client.vercel.app/admin/question/updateQue/${q.id}`,
        {
          text: q.text,
          options: q.options,
        },
        { withCredentials: true }
      );
      toast.success("Saved");
    } finally {
      setSaving((p) => ({ ...p, [q.id]: false }));
    }
  };

  const updateQuestionField = (round, i, field, value) => {
    const copy = [...rounds[round]];
    copy[i][field] = value;
    setRounds((p) => ({ ...p, [round]: copy }));
  };

  const updateOptionField = (round, qi, oi, value) => {
    const copy = [...rounds[round]];
    copy[qi].options[oi].text = value;
    setRounds((p) => ({ ...p, [round]: copy }));
  };

  const setCorrectOption = (round, qi, oi) => {
    if (isLive) return;
    const copy = [...rounds[round]];
    copy[qi].options = copy[qi].options.map((o, idx) => ({
      ...o,
      isCorrect: idx === oi,
    }));
    setRounds((p) => ({ ...p, [round]: copy }));
  };

  const addOption = (round, qi) => {
    if (isLive) return;
    const copy = [...rounds[round]];
    if (copy[qi].options.length >= 4) return;
    copy[qi].options.push({ text: "", isCorrect: false });
    setRounds((p) => ({ ...p, [round]: copy }));
  };

  const removeOption = (round, qi, oi) => {
    if (isLive) return;
    const copy = [...rounds[round]];
    if (copy[qi].options.length <= 2) return;
    copy[qi].options.splice(oi, 1);
    copy[qi].options[0].isCorrect = true;
    setRounds((p) => ({ ...p, [round]: copy }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0b0f14] border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            Quiz Info <span className="text-slate-400">— {quiz.title}</span>
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
          >
            <X className="text-slate-300" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto max-h-[75vh] space-y-10">
          {loading ? (
            <p className="text-center text-slate-500">Loading questions…</p>
          ) : (
            [1, 2, 3].map((round) => (
              <div key={round}>
                <h3 className="text-lg font-bold text-white mb-4">
                  Round {round}
                </h3>

                {rounds[round].length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No questions available
                  </p>
                ) : (
                  rounds[round].map((q, i) => (
                    <div
                      key={q.id}
                      className="bg-[#111827] border border-slate-800 rounded-2xl p-5 mb-4 space-y-4"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          value={q.text}
                          disabled={isLive}
                          onChange={(e) =>
                            updateQuestionField(round, i, "text", e.target.value)
                          }
                          className="flex-1 bg-[#0b0f14] border border-slate-700 rounded-xl px-4 py-2 text-white"
                        />
                        <button
                          onClick={() => saveQuestion(q)}
                          disabled={isLive || saving[q.id]}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <CheckCircle />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id, round)}
                          disabled={isLive}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 />
                        </button>
                      </div>

                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={opt.isCorrect}
                            disabled={isLive}
                            onChange={() =>
                              setCorrectOption(round, i, oi)
                            }
                          />
                          <input
                            value={opt.text}
                            disabled={isLive}
                            onChange={(e) =>
                              updateOptionField(round, i, oi, e.target.value)
                            }
                            className="flex-1 bg-[#0b0f14] border border-slate-700 rounded-xl px-4 py-2 text-slate-200"
                          />
                          {q.options.length > 2 && (
                            <button
                              onClick={() => removeOption(round, i, oi)}
                              className="text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      {q.options.length < 4 && (
                        <button
                          onClick={() => addOption(round, i)}
                          disabled={isLive}
                          className="flex items-center gap-2 text-slate-400 text-sm hover:text-white"
                        >
                          <Plus className="w-4 h-4" /> Add option
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizInfoPopup;
