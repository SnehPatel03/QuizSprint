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
  const [roundStartTime, setRoundStartTime] = useState(null); // ✅ server start time

  const roundTimerRef = useRef(null);
  const bufferTimerRef = useRef(null);

  const formatTime = (ms = 0) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(1, "0")}`;
  };

  // ================= FETCH ROUND RESULT =================
  // Note: we don't toggle the page loader during polling to avoid flicker.
  const fetchRoundResult = async () => {
    try {
      const res = await axios.get(
        `https://quizsprint-fox0.onrender.com/user/roundresult/${roundId}`,
        { withCredentials: true },
      );

      setRoundOngoing(res.data.roundOngoing);
      setRoundTimeRemaining(res.data.roundTimeRemaining);
      setIsFinalRound(res.data.isFinalRound);

      if (res.data.startTime) {
        setRoundStartTime(res.data.startTime); // ✅ store server start time
      }

      if (!res.data.roundOngoing && res.data.leaderboard.length > 0) {
        setLeaderboard(res.data.leaderboard);
        setMyStatus(res.data.myStatus);
        setBufferTimeRemaining(res.data.bufferTimeRemaining);
        setCanStartNextRound(res.data.canStartNextRound);
      }
    } catch (err) {
      toast.error("Failed to load round results");
    }
  };

  // ================= INITIAL LOAD + POLLING =================
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchRoundResult()
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const interval = setInterval(() => {
      fetchRoundResult(); // silent polling
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [roundId]);

  // ================= ROUND TIMER =================
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

  // ================= BUFFER TIMER =================
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

  // ================= AUTO NAVIGATE NEXT ROUND =================
  useEffect(() => {
    if (canStartNextRound && !isFinalRound && myStatus?.qualified) {
      const timer = setTimeout(() => {
        navigate(`/quiz/${quizId}/round/${Number(roundNumber) + 1}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    canStartNextRound,
    isFinalRound,
    myStatus,
    quizId,
    roundNumber,
    navigate,
  ]);

  // ================= MARK WINNER =================
  useEffect(() => {
    if (!isFinalRound || !leaderboard.length || !myStatus) return;
    if (leaderboard[0].userId === myStatus.userId) {
      axios
        .post(
          `https://quizsprint-fox0.onrender.com/user/markWinner/${quizId}`,
          {},
          { withCredentials: true },
        )
        .catch(() => {});
    }
  }, [leaderboard, myStatus, isFinalRound, quizId]);

  // ================= LOADER =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        ⏳ Loading...
      </div>
    );
  }

  // ================= ROUND ONGOING =================
  if (roundOngoing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <div className="text-xl font-semibold mb-2">⏳ Round in Progress</div>
        {roundStartTime && (
          <div className="text-sm text-gray-500 mb-2">
            Started at: {formatIST(roundStartTime)} (IST)
          </div>
        )}
        <div className="text-5xl font-bold text-blue-600">
          {formatTime(roundTimeRemaining)}
        </div>
        <div className="mt-4 text-slate-500">
          Please wait until the round ends
        </div>
      </div>
    );
  }

  const isWinner = isFinalRound && leaderboard[0]?.userId === myStatus?.userId;

  const showDashboardButton =
    (!myStatus?.qualified && !isFinalRound) || isWinner;

  // ================= RESULT UI =================
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Round {roundNumber} Results</h1>
        {roundStartTime && (
          <p className="text-sm text-gray-500 mb-2">
            Round started at: {formatIST(roundStartTime)} (IST)
          </p>
        )}
        <p className="text-slate-500 mb-6">
          {isFinalRound ? "Final Leaderboard" : "Leaderboard"}
        </p>

        {myStatus && (
          <div
            className={`mb-6 p-6 rounded-2xl font-semibold text-lg shadow ${
              isWinner
                ? "bg-yellow-100 text-yellow-800"
                : myStatus.qualified
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {isWinner
              ? "🏆 You are the WINNER!"
              : myStatus.qualified
                ? "🎉 Qualified for next round"
                : "👏 Nice try! You are eliminated"}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4 text-left">Player</th>
                <th className="p-4">Score</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, idx) => (
                <tr key={user.userId} className="border-t">
                  <td className="p-4 font-bold">{idx + 1}</td>
                  <td className="p-4 text-left">{user.name}</td>
                  <td className="p-4 font-semibold">{user.correctScore}</td>
                  <td className="p-4">{formatTime(user.timeTaken)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {myStatus?.qualified && !isFinalRound && (
          <div className="mb-6">
            {bufferTimeRemaining > 0 ? (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="text-lg font-semibold text-blue-800 mb-2">
                  ⏳ Next Round Starting Soon
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatTime(bufferTimeRemaining)}
                </div>
                <div className="text-sm text-blue-600">
                  Round {Number(roundNumber) + 1} will start automatically
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                <div className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Next Round Starting!
                </div>
                <div className="text-sm text-green-600">Redirecting...</div>
              </div>
            )}
          </div>
        )}

        {showDashboardButton && (
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default RoundResult;
