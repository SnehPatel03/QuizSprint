  import React, { useEffect, useState, useRef } from "react";
  import axios from "axios";
  import { useLocation, useNavigate, useParams } from "react-router-dom";
  import toast from "react-hot-toast";

  const RoundResult = () => {
    const { quizId, roundNumber } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { roundId } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [myStatus, setMyStatus] = useState(null);
    const [winnerMarked, setWinnerMarked] = useState(false);
    const [bufferTimeRemaining, setBufferTimeRemaining] = useState(0);
    const [canStartNextRound, setCanStartNextRound] = useState(false);

    const bufferTimerRef = useRef(null);
    const isFinalRound = Number(roundNumber) === 3;

    
    const formatTime = (ms = 0) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}m ${seconds}s`;
    };

    const formatBufferTime = (ms = 0) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // ------------------ FETCH ROUND RESULT ------------------
    useEffect(() => {
      if (!roundId) {
        toast.error("Invalid round");
        navigate("/dashboard");
        return;
      }

      const fetchRoundResult = async () => {
        try {
          const res = await axios.get(
            `https://quizsprint-fox0.onrender.com/user/roundresult/${roundId}`,
            { withCredentials: true }
          );

          setLeaderboard(res.data.leaderboard || []);
          setMyStatus(res.data.myStatus || null);
          setBufferTimeRemaining(res.data.bufferTimeRemaining || 0);
          setCanStartNextRound(res.data.canStartNextRound || false);
        } catch (error) {
          toast.error("Failed to load round results");
        } finally {
          setLoading(false);
        }
      };

      // Delay to allow backend evaluation
      const timer = setTimeout(fetchRoundResult, 4000);
      return () => clearTimeout(timer);
    }, [roundId, navigate]);

    // ------------------ BUFFER TIME COUNTDOWN ------------------
    useEffect(() => {
      if (bufferTimeRemaining <= 0 || isFinalRound || !myStatus?.qualified) {
        if (bufferTimeRemaining <= 0 && !isFinalRound && myStatus?.qualified) {
          setCanStartNextRound(true);
        }
        return;
      }

      bufferTimerRef.current = setInterval(() => {
        setBufferTimeRemaining((prev) => {
          if (prev <= 1000) {
            setCanStartNextRound(true);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => {
        if (bufferTimerRef.current) {
          clearInterval(bufferTimerRef.current);
        }
      };
    }, [bufferTimeRemaining, isFinalRound, myStatus?.qualified]);

    // ------------------ AUTO NAVIGATE TO NEXT ROUND ------------------
    useEffect(() => {
      if (canStartNextRound && !isFinalRound && myStatus?.qualified) {
        const timer = setTimeout(() => {
          navigate(`/quiz/${quizId}/round/${Number(roundNumber) + 1}`);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [canStartNextRound, isFinalRound, myStatus?.qualified, quizId, roundNumber, navigate]);

    // ------------------ MARK WINNER (FINAL ROUND ONLY) ------------------
    useEffect(() => {
      if (
        loading ||
        !isFinalRound ||
        !leaderboard.length ||
        !myStatus ||
        winnerMarked
      )
        return;

      const winner = leaderboard[0];

      if (winner.userId === myStatus.userId) {
        axios
          .post(
            `https://quizsprint-fox0.onrender.com/user/markWinner/${quizId}`,
            {},
            { withCredentials: true }
          )
          .then(() => setWinnerMarked(true))
          .catch(() => {});
      }
    }, [loading, isFinalRound, leaderboard, myStatus, quizId, winnerMarked]);

    // ------------------ LOADING UI ------------------
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-lg">
          ⏳ Calculating final standings...
        </div>
      );
    }

    const isWinner =
      isFinalRound && leaderboard[0]?.userId === myStatus?.userId;

    // ------------------ UI ------------------
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              Round {roundNumber} Results
            </h1>
            <p className="text-slate-500">
              {isFinalRound ? "Final Leaderboard" : "Leaderboard"}
            </p>
          </div>

          {/* STATUS CARD */}
          <div
            className={`mb-8 p-6 rounded-2xl text-center font-semibold text-lg shadow ${
              isWinner
                ? "bg-yellow-100 text-yellow-800"
                : myStatus?.qualified
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isWinner
              ? "🏆 You are the WINNER of this quiz!"
              : myStatus?.qualified
              ? "🎉 Qualified for next round"
              : "👏 Nice try! You are eliminated"}
          </div>

          {/* LEADERBOARD */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
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
                {leaderboard.map((user, index) => (
                  <tr key={user.userId} className="border-t">
                    <td className="p-4 font-bold">
                      {index === 0 && isFinalRound ? "🏆 " : ""}
                      {index + 1}
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

          {/* BUFFER TIME & NEXT ROUND INFO */}
          {myStatus?.qualified && !isFinalRound && (
            <div className="mt-10">
              {bufferTimeRemaining > 0 ? (
                <div className="text-center">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-4">
                    <div className="text-lg font-semibold text-blue-800 mb-2">
                      ⏳ Next Round Starting Soon
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {formatBufferTime(bufferTimeRemaining)}
                    </div>
                    <div className="text-sm text-blue-600">
                      Round {Number(roundNumber) + 1} will start automatically
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    Please wait... You cannot proceed manually during buffer time.
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-4">
                    <div className="text-lg font-semibold text-green-800 mb-2">
                      ✅ Round {Number(roundNumber) + 1} is Starting!
                    </div>
                    <div className="text-sm text-green-600">
                      Redirecting you to the next round...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  export default RoundResult;
