// src/pages/RoundResult.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const formatIST = (utcTime) =>
  new Date(utcTime).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

const RoundResult = () => {
  const { roundId, quizId, roundNumber } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [roundOngoing, setRoundOngoing] = useState(false);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStatus, setMyStatus] = useState(null);
  const [bufferTimeRemaining, setBufferTimeRemaining] = useState(0);
  const [canStartNextRound, setCanStartNextRound] = useState(false);
  const [isFinalRound, setIsFinalRound] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState(null);

  const roundTimerRef = useRef(null);
  const bufferTimerRef = useRef(null);

  const formatTime = (ms = 0) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const fetchRoundResult = async () => {
    try {
      const res = await axios.get(
        `https://quiz-sprint-server.vercel.app/user/roundresult/${roundId}`,
        { withCredentials: true }
      );

      setRoundOngoing(res.data.roundOngoing);
      setRoundTimeRemaining(res.data.roundTimeRemaining);
      setIsFinalRound(res.data.isFinalRound);

      if (res.data.startTime) {
        setRoundStartTime(res.data.startTime);
      }

      if (!res.data.roundOngoing && res.data.leaderboard.length > 0) {
        setLeaderboard(res.data.leaderboard);
        setMyStatus(res.data.myStatus);
        setBufferTimeRemaining(res.data.bufferTimeRemaining);
        setCanStartNextRound(res.data.canStartNextRound);
      }
    } catch {
      toast.error("Failed to load round results");
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchRoundResult().finally(() => {
      if (mounted) setLoading(false);
    });

    const interval = setInterval(fetchRoundResult, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [roundId]);

  useEffect(() => {
    if (!roundOngoing || roundTimeRemaining <= 0) return;

    roundTimerRef.current = setInterval(() => {
      setRoundTimeRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(roundTimerRef.current);
          fetchRoundResult();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(roundTimerRef.current);
  }, [roundOngoing, roundTimeRemaining]);

  useEffect(() => {
    if (bufferTimeRemaining <= 0 || isFinalRound) {
      if (bufferTimeRemaining <= 0 && !isFinalRound && myStatus?.qualified) {
        setCanStartNextRound(true);
      }
      return;
    }

    bufferTimerRef.current = setInterval(() => {
      setBufferTimeRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(bufferTimerRef.current);
          setCanStartNextRound(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(bufferTimerRef.current);
  }, [bufferTimeRemaining, isFinalRound, myStatus]);

  useEffect(() => {
    if (canStartNextRound && !isFinalRound && myStatus?.qualified) {
      const timer = setTimeout(() => {
        navigate(`/quiz/${quizId}/round/${Number(roundNumber) + 1}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [canStartNextRound, isFinalRound, myStatus, quizId, roundNumber, navigate]);

  useEffect(() => {
    if (!isFinalRound || !leaderboard.length || !myStatus) return;
    if (leaderboard[0].userId === myStatus.userId) {
      axios.post(
        `https://quiz-sprint-server.vercel.app/user/markWinner/${quizId}`,
        {},
        { withCredentials: true }
      ).catch(() => {});
    }
  }, [leaderboard, myStatus, isFinalRound, quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-slate-300">
        ⏳ Loading...
      </div>
    );
  }

  if (roundOngoing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
        <div className="text-xl font-semibold text-white mb-2">
          ⏳ Round in Progress
        </div>
        {roundStartTime && (
          <div className="text-sm text-slate-400 mb-2">
            Started at {formatIST(roundStartTime)} (IST)
          </div>
        )}
        <div className="text-6xl font-bold text-white font-mono">
          {formatTime(roundTimeRemaining)}
        </div>
        <div className="mt-4 text-slate-500">
          Please wait until the round ends
        </div>
      </div>
    );
  }

  const isWinner =
    isFinalRound && leaderboard[0]?.userId === myStatus?.userId;

  const showDashboardButton =
    (!myStatus?.qualified && !isFinalRound) || isWinner;

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-slate-200">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Round {roundNumber} Results
        </h1>

        {roundStartTime && (
          <p className="text-sm text-slate-400 mb-6">
            Started at {formatIST(roundStartTime)} (IST)
          </p>
        )}

        {myStatus && (
          <div
            className={`mb-8 p-6 rounded-2xl font-semibold text-xl border ${
              isWinner
                ? "bg-yellow-500/10 border-yellow-500 text-yellow-300"
                : myStatus.qualified
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                : "bg-red-500/10 border-red-500 text-red-300"
            }`}
          >
            {isWinner
              ? "🏆 You are the WINNER!"
              : myStatus.qualified
              ? "🎉 Qualified for next round"
              : "👏 Nice try! You are eliminated"}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-800 mb-8">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4 text-left">Player</th>
                <th className="p-4">Score</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, idx) => (
                <tr
                  key={user.userId}
                  className="border-t border-slate-800"
                >
                  <td className="p-4 font-bold text-white">
                    {idx + 1}
                  </td>
                  <td className="p-4 text-left">{user.name}</td>
                  <td className="p-4 font-semibold">
                    {user.correctScore}
                  </td>
                  <td className="p-4">
                    {formatTime(user.timeTaken)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {myStatus?.qualified && !isFinalRound && (
          <div className="mb-8">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
              <div className="text-lg font-semibold text-white mb-2">
                ⏳ Next Round Starting Soon
              </div>
              <div className="text-5xl font-bold text-white font-mono mb-2">
                {formatTime(bufferTimeRemaining)}
              </div>
              <div className="text-sm text-slate-400">
                Redirecting automatically
              </div>
            </div>
          </div>
        )}

        {showDashboardButton && (
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-slate-200 transition"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default RoundResult;
