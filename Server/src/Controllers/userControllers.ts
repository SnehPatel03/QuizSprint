import { prisma } from "../lib/prisma";
import { calculateRoundQualification } from "./QualificationLogic";
import { getQuestionsByRound } from "./questionControllers";
import {nowUTC} from '../utils/time'

const BUFFER_MS =  20 * 1000; 


const autoUpdateQuizStatus = async () => {
  const now = nowUTC(); 

  await prisma.quiz.updateMany({
    where: {
      status: "DRAFT",
      rounds: {
        some: {
          roundNumber: 1,
          roundStartTime: { lte: now },
        },
      },
    },
    data: { status: "LIVE" },
  });
};

export default autoUpdateQuizStatus;

export const getAllQuizUserUpcoming = async (req: any, res: any) => {
  try {
    await autoUpdateQuizStatus(); 
    const quizzes = await prisma.quiz.findMany({
      where: { status: "DRAFT" },
    });

    return res.status(200).json({
      message: "Upcoming quizzes fetched successfully",
      quiz: quizzes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching upcoming quizzes" });
  }
};


export const getAllQuizUserLive = async (req: any, res: any) => {
  try {
    await autoUpdateQuizStatus(); // 🔥 ADD THIS

    const quizzes = await prisma.quiz.findMany({
      where: { status: "LIVE" },
    });

    return res.status(200).json({
      message: "Live quizzes fetched successfully",
      quiz: quizzes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching live quizzes" });
  }
};


export const fetchCompletedQuizzes = async (req: any, res: any) => {
  try {
    const completedQuizzes = await prisma.quiz.findMany({
      where: { status: "COMPLETED" },
      include: {
        attempts: {
          where: { isWinner: true },
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = completedQuizzes.map((quiz) => {
      const winner = quiz.attempts.find((attempt) => attempt.isWinner);
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        completedAt: quiz.createdAt,
        winner: winner?.user.name || null,
      };
    });

    return res.status(200).json({
      message: "Completed quizzes fetched successfully",
      quiz: result,
    });
  } catch (error) {
    console.error("Fetch Completed Quizzes Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const joinQuiz = async (req: any, res: any) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.status !== "LIVE") return res.status(400).json({ message: "Quiz is not live" });

    const round1 = await prisma.round.findFirst({
      where: { quizId, roundNumber: 1 },
    });

    if (!round1 || !round1.roundStartTime) {
      return res.status(200).json({
        roundStarted: false,
        message: "Round 1 not configured",
      });
    }

    const nowMs = nowUTC().getTime();
    const roundStart = round1.roundStartTime.getTime();
    const roundEnd = roundStart + round1.timeLimit * 60 * 1000;

    if (nowMs < roundStart) {
      return res.status(200).json({
        roundStarted: false,
        message: "Round not started yet",
        startsInMs: roundStart - nowMs,
        timeLimit: round1.timeLimit,
      });
    }

    if (nowMs > roundEnd) {
      return res.status(403).json({ message: "Round 1 already ended" });
    }

    const count = await prisma.quizAttempt.count({ where: { quizId } });
    if (count >= quiz.maxParticipants)
      return res.status(400).json({ message: "Quiz is full" });

    const alreadyJoined = await prisma.quizAttempt.findUnique({
      where: { userId_quizId: { userId, quizId } },
    });

    if (alreadyJoined)
      return res.status(200).json({ roundStarted: true, message: "Already joined" });

    await prisma.quizAttempt.create({
      data: { userId, quizId },
    });

    return res.status(200).json({ roundStarted: true, message: "Joined successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const startQuizRound = async (req: any, res: any) => {
  const { quizId, roundNumber: roundNumberStr } = req.params;
  const userId = req.user.id;
  const roundNumber = Number(roundNumberStr);

  if (isNaN(roundNumber))
    return res.status(400).json({ message: "Invalid round number" });

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { rounds: { orderBy: { roundNumber: "asc" } } },
  });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  const round = quiz.rounds.find((r) => r.roundNumber === roundNumber);
  if (!round) return res.status(404).json({ message: "Round not found" });

  // Global schedule derived from Round 1 start time
  const round1 = quiz.rounds.find((r) => r.roundNumber === 1);
  if (!round1?.roundStartTime) {
    return res.status(400).json({ message: "Round 1 start time not set" });
  }

  let startTime = round1.roundStartTime.getTime();
  for (let i = 1; i < roundNumber; i++) {
    const prev = quiz.rounds.find((r) => r.roundNumber === i);
    if (!prev) return res.status(404).json({ message: `Round ${i} not found` });
    startTime += prev.timeLimit * 60 * 1000 + BUFFER_MS;
  }

  const endTime = startTime + round.timeLimit * 60 * 1000;
  const now = Date.now();

  if (now < startTime)
    return res.status(403).json({
      status: "NOT_STARTED",
      startsInMs: startTime - now,
      message: "Round not started yet",
    });

  if (now >= endTime)
    return res.status(403).json({ status: "ENDED", message: "Round already ended" });

  const quizAttempt = await prisma.quizAttempt.findUnique({
    where: { userId_quizId: { userId, quizId } },
  });
  if (!quizAttempt)
    return res.status(403).json({ message: "User has not joined quiz" });

  const existingAttempt = await prisma.roundAttempt.findUnique({
    where: { quizAttemptId_roundId: { quizAttemptId: quizAttempt.id, roundId: round.id } },
  });
  if (!existingAttempt) {
    await prisma.roundAttempt.create({
      data: {
        quizAttemptId: quizAttempt.id,
        roundId: round.id,
        isCorrect: false,
        qualified: true,
        timeTaken: round.timeLimit * 60 * 1000,
      },
    });
  }

  const questions = await prisma.question.findMany({ where: { roundId: round.id }, include: { options: true } });

  return res.status(200).json({
    status: "STARTED",
    roundId: round.id,
    roundNumber,
    timeLeft: Math.floor((endTime - now) / 1000),
    questions,
  });
};


export const submitRound = async (req: any, res: any) => {
  try {
    const { roundId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body;

    const roundAttempt = await prisma.roundAttempt.findFirst({
      where: { roundId, quizAttempt: { userId } },
    });
    if (!roundAttempt) return res.status(400).json({ message: "Round not started yet" });

    const now = new Date();
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: { quiz: { include: { rounds: { orderBy: { roundNumber: "asc" } } } } },
    });
    if (!round) return res.status(404).json({ message: "Round not found" });

    const alreadySubmitted = await prisma.answer.findFirst({
      where: { roundAttemptId: roundAttempt.id },
      select: { id: true },
    });
    if (alreadySubmitted) {
      return res.status(400).json({ message: "Round already submitted" });
    }

    const quizRounds = round.quiz.rounds;
    const round1 = quizRounds.find((r) => r.roundNumber === 1);
    if (!round1?.roundStartTime) {
      return res.status(400).json({ message: "Round 1 start time not set" });
    }

    let startTimeMs = round1.roundStartTime.getTime();
    for (let i = 1; i < round.roundNumber; i++) {
      const prev = quizRounds.find((r) => r.roundNumber === i);
      if (!prev) return res.status(404).json({ message: `Round ${i} not found` });
      startTimeMs += prev.timeLimit * 60 * 1000 + BUFFER_MS;
    }

    const timeLimitMs = round.timeLimit * 60 * 1000;
    const elapsed = Math.max(0, now.getTime() - startTimeMs);
    const timeTaken = Math.min(elapsed, timeLimitMs);

    for (const ans of answers) {
      const option = await prisma.option.findUnique({ where: { id: ans.selectedOptionId } });
      await prisma.answer.create({
        data: {
          roundAttemptId: roundAttempt.id,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId,
          isCorrect: option?.isCorrect || false,
        },
      });
    }

    await prisma.roundAttempt.update({ where: { id: roundAttempt.id }, data: { timeTaken } });

    return res.status(200).json({ message: "Answers submitted successfully" });
  } catch (error) {
    console.error("Submit Round Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoundResult = async (req: any, res: any) => {
  try {
    const { roundId } = req.params;
    const userId = req.user.id;

    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: {
        quiz: { include: { rounds: { orderBy: { roundNumber: "asc" } } } },
        roundAttempts: { include: { quizAttempt: { include: { user: true } }, answers: true } },
      },
    });

    if (!round) return res.status(404).json({ message: "Round not found" });

    const quizRounds = round.quiz.rounds;
    const round1 = quizRounds.find((r) => r.roundNumber === 1);
    if (!round1?.roundStartTime) {
      return res.status(400).json({ message: "Round 1 start time not set" });
    }

    // Global schedule derived from Round 1 start time
    let startTime = round1.roundStartTime.getTime();
    for (let i = 1; i < round.roundNumber; i++) {
      const prev = quizRounds.find((r) => r.roundNumber === i);
      if (!prev) return res.status(404).json({ message: `Round ${i} not found` });
      startTime += prev.timeLimit * 60 * 1000 + BUFFER_MS;
    }
    const endTime = startTime + round.timeLimit * 60 * 1000;

    const now = Date.now();
    const roundOngoing = now >= startTime && now < endTime;
    const roundTimeRemaining = Math.max(0, endTime - now);

    let leaderboard: any[] = [];
    let myStatus: any = null;
    let bufferTimeRemaining = 0;
    let canStartNextRound = false;

    if (!roundOngoing && now >= endTime) {
      // Qualification should be calculated AFTER round ends (not on every submit)
      await calculateRoundQualification(roundId);

      const refreshed = await prisma.round.findUnique({
        where: { id: roundId },
        include: {
          roundAttempts: { include: { quizAttempt: { include: { user: true } }, answers: true } },
        },
      });
      const attempts = refreshed?.roundAttempts || round.roundAttempts;

      leaderboard = attempts
        .map((a) => ({
          userId: a.quizAttempt.userId,
          name: a.quizAttempt.user.name,
          correctScore: a.answers.filter((ans) => ans.isCorrect).length,
          timeTaken: a.timeTaken,
          qualified: a.qualified,
        }))
        .sort((a, b) => b.correctScore - a.correctScore || a.timeTaken - b.timeTaken);

      myStatus = leaderboard.find((u) => u.userId === userId);

      if (myStatus?.qualified && round.roundNumber < quizRounds.length) {
        const bufferEnd = endTime + BUFFER_MS;
        bufferTimeRemaining = Math.max(0, bufferEnd - now);
        canStartNextRound = bufferTimeRemaining === 0;
      }
    }

    return res.status(200).json({
      roundNumber: round.roundNumber,
      roundOngoing,
      roundTimeRemaining,
      leaderboard,
      myStatus,
      bufferTimeRemaining,
      canStartNextRound,
      isFinalRound: round.roundNumber === quizRounds.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markWinner = async (req: any, res: any) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const finalRound = await prisma.round.findFirst({
      where: { quizId, roundNumber: 3 },
      include: {
        roundAttempts: {
          include: {
            quizAttempt: true,
            answers: true,
          },
        },
      },
    });

    if (!finalRound) {
      return res.status(400).json({ message: "Final round not found" });
    }

    const existingWinner = await prisma.quizAttempt.findFirst({
      where: { quizId, isWinner: true },
    });
    if (existingWinner) {
      return res.status(400).json({ message: "Winner already declared" });
    }

    const leaderboard = finalRound.roundAttempts
      .map((attempt) => ({
        userId: attempt.quizAttempt.userId,
        correctScore: attempt.answers.filter((a) => a.isCorrect).length,
        timeTaken: attempt.timeTaken,
      }))
      .sort((a, b) => b.correctScore - a.correctScore || a.timeTaken - b.timeTaken);

    if (!leaderboard.length || leaderboard[0].userId !== userId) {
      return res.status(403).json({ message: "Only top scorer can be winner" });
    }

    await prisma.quizAttempt.updateMany({
      where: { quizId, userId },
      data: { isWinner: true },
    });

    await prisma.quiz.update({
      where: { id: quizId },
      data: { status: "COMPLETED" },
    });

    return res.status(200).json({ message: "Winner declared successfully" });
  } catch (err) {
    console.error("Mark Winner Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkRound1Status = async (req: any, res: any) => {
  try {
    const { quizId } = req.params;

    const round1 = await prisma.round.findFirst({
      where: { quizId, roundNumber: 1 },
      select: { roundStartTime: true },
    });

    if (!round1 || !round1.roundStartTime) {
      return res.status(200).json({
        round: 1,
        started: false,
        startTime: null,
        message: "Round 1 start time not set",
      });
    }

    const now = new Date();
    const started = now >= round1.roundStartTime;

    return res.status(200).json({
      round: 1,
      started,
      startTime: round1.roundStartTime.toISOString(),
    });
  } catch (error) {
    console.error("Check Round 1 Status Error:", error);
    return res.status(500).json({ message: "Error checking round status" });
  }
};
