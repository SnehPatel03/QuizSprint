import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const formatIST = (utcTime) =>
  new Date(utcTime).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

const RoundPage = () => {
  const { quizId, roundNumber } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [roundId, setRoundId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [roundStartTime, setRoundStartTime] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    const startRound = async () => {
      try {
        setLoading(true);

        const res = await axios.post(
          `https://quizsprint-fox0.onrender.com/user/startRound/${quizId}/${roundNumber}`,
          {},
          { withCredentials: true }
        );

        setRoundId(res.data.roundId);
        setQuestions(res.data.questions || []);

        const serverTimeLeft = res.data.timeLeft;
        if (!serverTimeLeft || serverTimeLeft <= 0) {
          toast.error(`Round ${roundNumber} has already ended`);
          navigate("/dashboard");
          return;
        }
        setTimeLeft(serverTimeLeft);

        if (res.data.startTime) {
          setRoundStartTime(res.data.startTime);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Round not started yet");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    startRound();
  }, [quizId, roundNumber, navigate]);

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitting || !roundId) return;

      if (!auto && Object.keys(answers).length !== questions.length) {
        return toast.error("Answer all questions");
      }

      try {
        setSubmitting(true);
        clearInterval(timerRef.current);

        const payload = {
          answers: Object.entries(answers).map(
            ([questionId, selectedOptionId]) => ({
              questionId,
              selectedOptionId,
            })
          ),
        };

        await axios.post(
          `https://quizsprint-fox0.onrender.com/user/submitRound/${roundId}`,
          payload,
          { withCredentials: true }
        );

        toast.success(auto ? "Time up! Submitted" : "Round submitted");
        navigate(`/user/quiz/${quizId}/round/${roundNumber}/${roundId}`);
      } catch {
        toast.error("Submission failed");
        setSubmitting(false);
      }
    },
    [roundId, submitting, answers, questions, quizId, roundNumber, navigate]
  );

  useEffect(() => {
    if (timeLeft <= 0 || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitting, handleSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-slate-300">
        ⏳ Loading round...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 max-w-4xl mx-auto text-slate-200">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Round {roundNumber}
          </h1>
          {roundStartTime && (
            <p className="text-sm text-slate-400 mt-1">
              Started at {formatIST(roundStartTime)} (IST)
            </p>
          )}
        </div>

        <div className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-lg">
          ⏱ {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="bg-[#0b0f14] border border-slate-800 rounded-2xl p-6"
          >
            <h2 className="font-semibold text-lg mb-5 text-white">
              Q{index + 1}. {q.text}
            </h2>

            <div className="space-y-3">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(q.id, opt.id)}
                    className={`w-full text-left px-5 py-3 rounded-xl border transition ${
                      selected
                        ? "bg-slate-800 border-slate-500 text-white"
                        : "bg-transparent border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-slate-200 transition disabled:opacity-40"
        >
          Submit Round
        </button>
      </div>
    </div>
  );
};

export default RoundPage;
