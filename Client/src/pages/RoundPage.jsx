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
  const [roundStartTime, setRoundStartTime] = useState(null); // ✅ store server start time

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

        const serverTimeLeft = res.data.timeLeft; // seconds
        if (!serverTimeLeft || serverTimeLeft <= 0) {
          toast.error(`Round ${roundNumber} has already ended`);
          navigate("/dashboard");
          return;
        }
        setTimeLeft(serverTimeLeft);

        if (res.data.startTime) {
          setRoundStartTime(res.data.startTime); // ✅ store server startTime
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
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
          })),
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
      <div className="min-h-screen flex items-center justify-center">
        ⏳ Loading round...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Round {roundNumber}</h1>
          {roundStartTime && (
            <p className="text-sm text-gray-500">
              Started at: {formatIST(roundStartTime)} (IST)
            </p>
          )}
        </div>

        <div className="px-4 py-2 rounded-xl font-semibold bg-indigo-100 text-indigo-700">
          ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-4">
              Q{index + 1}. {q.text}
            </h2>

            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(q.id, opt.id)}
                className={`w-full text-left px-4 py-2 rounded-lg border mb-2 ${
                  answers[q.id] === opt.id
                    ? "bg-indigo-100 border-indigo-500"
                    : "hover:bg-slate-100"
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        ))}

        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold"
        >
          Submit Round
        </button>
      </div>
    </div>
  );
};

export default RoundPage;
