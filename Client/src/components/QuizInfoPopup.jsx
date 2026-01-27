import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Trash2, Plus, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const QuizInfoPopup = ({ quiz, onClose }) => {
  const [rounds, setRounds] = useState({ 1: [], 2: [], 3: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({}); // track saving per question

  const isLive = quiz?.status === "LIVE"; // Check if quiz is LIVE

  const fetchRound = async (round) => {
    const res = await axios.get(
      `https://quizsprint-fox0.onrender.com/admin/question/fetchQue/${quiz.id}/${round}`,
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
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRounds();
  }, []);

  const deleteQuestion = async (id, round) => {
    if (isLive) {
      toast.error("You can't delete questions while quiz is LIVE");
      return;
    }

    if (!window.confirm("Delete this question?")) return;

    try {
      await axios.delete(
        `https://quizsprint-fox0.onrender.com/admin/question/deleteQue/${id}`,
        { withCredentials: true }
      );

      setRounds((prev) => ({
        ...prev,
        [round]: prev[round].filter((q) => q.id !== id),
      }));

      toast.success("Question deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete question");
    }
  };

  const saveQuestion = async (q, round) => {
    if (isLive) {
      toast.error("You can't update questions while quiz is LIVE");
      return;
    }

    try {
      setSaving((prev) => ({ ...prev, [q.id]: true }));
      await axios.put(
        `https://quizsprint-fox0.onrender.com/admin/question/updateQue/${q.id}`,
        {
          text: q.text,
          options: q.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
        { withCredentials: true }
      );
      toast.success("Question saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save question");
    } finally {
      setSaving((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  const updateQuestionField = (round, qIndex, field, value) => {
    const updatedRound = [...rounds[round]];
    updatedRound[qIndex][field] = value;
    setRounds((prev) => ({ ...prev, [round]: updatedRound }));
  };

  const updateOptionField = (round, qIndex, optIndex, value) => {
    const updatedRound = [...rounds[round]];
    updatedRound[qIndex].options[optIndex].text = value;
    setRounds((prev) => ({ ...prev, [round]: updatedRound }));
  };

  const addOption = (round, qIndex) => {
    if (isLive) {
      toast.error("You can't add options while quiz is LIVE");
      return;
    }
    const updatedRound = [...rounds[round]];
    if (updatedRound[qIndex].options.length >= 4) return;
    updatedRound[qIndex].options.push({ text: "", isCorrect: false });
    setRounds((prev) => ({ ...prev, [round]: updatedRound }));
  };

  const removeOption = (round, qIndex, optIndex) => {
    if (isLive) {
      toast.error("You can't remove options while quiz is LIVE");
      return;
    }
    const updatedRound = [...rounds[round]];
    if (updatedRound[qIndex].options.length <= 2) {
      toast.error("At least 2 options required");
      return;
    }
    updatedRound[qIndex].options.splice(optIndex, 1);
    // ensure correct answer exists
    if (!updatedRound[qIndex].options.some((opt) => opt.isCorrect)) {
      updatedRound[qIndex].options[0].isCorrect = true;
    }
    setRounds((prev) => ({ ...prev, [round]: updatedRound }));
  };

  const setCorrectOption = (round, qIndex, optIndex) => {
    if (isLive) {
      toast.error("You can't change correct answer while quiz is LIVE");
      return;
    }
    const updatedRound = [...rounds[round]];
    updatedRound[qIndex].options = updatedRound[qIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optIndex,
    }));
    setRounds((prev) => ({ ...prev, [round]: updatedRound }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-6 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Quiz Info — {quiz.title}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto max-h-[75vh] space-y-8">
          {loading ? (
            <p className="text-center text-slate-500">Loading questions...</p>
          ) : (
            [1, 2, 3].map((round) => (
              <div key={round}>
                <h3 className="text-lg font-bold mb-4">Round {round}</h3>

                {rounds[round].length === 0 ? (
                  <p className="text-slate-400">No questions</p>
                ) : (
                  rounds[round].map((q, i) => (
                    <div
                      key={q.id}
                      className="border rounded-xl p-4 mb-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <input
                          value={q.text}
                          onChange={(e) =>
                            updateQuestionField(round, i, "text", e.target.value)
                          }
                          className="flex-1 border rounded px-2 py-1 font-semibold"
                          disabled={isLive} // disable input if LIVE
                        />
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => saveQuestion(q, round)}
                            className="text-emerald-600 hover:text-emerald-800"
                            disabled={saving[q.id] || isLive} // disable save
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteQuestion(q.id, round)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLive} // disable delete
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={opt.isCorrect}
                              onChange={() => setCorrectOption(round, i, idx)}
                              disabled={isLive} // disable correct select
                            />
                            <input
                              value={opt.text}
                              onChange={(e) =>
                                updateOptionField(round, i, idx, e.target.value)
                              }
                              className="flex-1 border rounded px-2 py-1"
                              disabled={isLive} // disable option text edit
                            />
                            {q.options.length > 2 && (
                              <button
                                onClick={() => removeOption(round, i, idx)}
                                className="text-red-600 hover:text-red-800"
                                disabled={isLive} // disable remove
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        {q.options.length < 4 && (
                          <button
                            onClick={() => addOption(round, i)}
                            className="flex items-center gap-1 text-blue-600 text-sm mt-1"
                            disabled={isLive} // disable add
                          >
                            <Plus className="w-4 h-4" /> Add Option
                          </button>
                        )}
                      </div>
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
