import { prisma } from "../lib/prisma";
import { calculateRoundQualification } from "./QualificationLogic";
import { getQuestionsByRound } from "./questionControllers";
export const getAllQuizUserUpcoming = async (
  req: Request,
  res: Response | any,
) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        status: "DRAFT",
      },
    });

    return res.status(200).json({
      message: "Quizzes fetched successfully for users Upcoming quizzes",
      quiz: quizzes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching quizzes for users Upcoming",
    });
  }
};

export const getAllQuizUserLive = async (req: Request, res: Response | any) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        status: "LIVE",
      },
    });

    return res.status(200).json({
      message: "Quizzes fetched successfully for users LIVE quizzes",
      quiz: quizzes,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching quizzes for users LIVE" });
  }
};

export const fetchCompletedQuizzes = async (req: any, res: any) => {
  try {
    const completedQuizzes = await prisma.quiz.findMany({
      where: {
        status: "COMPLETED",
      },
      include: {
        attempts: {
          where: {
            isWinner: true,
          },
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const joinQuiz = async (req: Request | any, res: Response | any) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // ✅ Normalize status
    if (quiz.status?.trim().toUpperCase() !== "LIVE") {
      return res.status(400).json({ message: "Quiz is not live" });
    }

    const firstRound = await prisma.round.findFirst({
      where: {
        quizId,
        roundNumber: 1,
      },
    });

    if (!firstRound) {
      return res.status(400).json({
        message: "First round not configured",
      });
    }

    const firstRoundAttempt = await prisma.roundAttempt.findFirst({
      where: {
        roundId: firstRound.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (firstRoundAttempt) {
      const now = new Date();
      const startedAt = firstRoundAttempt.createdAt;
      const timeLimitMs = firstRound.timeLimit * 60 * 1000;
      const elapsedTime = now.getTime() - startedAt.getTime();

      if (elapsedTime >= timeLimitMs) {
        return res.status(403).json({
          message: "Cannot join. First round already ended",
        });
      }
    }

    const participantCount = await prisma.quizAttempt.count({
      where: { quizId },
    });

    if (participantCount >= quiz.maxParticipants) {
      return res.status(400).json({
        message: "Quiz is full",
      });
    }

    const alreadyJoined = await prisma.quizAttempt.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId,
        },
      },
    });

    if (alreadyJoined) {
      return res.status(400).json({
        message: "You already joined this quiz",
      });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
      },
    });

    return res.status(201).json({
      message: "Joined quiz successfully",
      attempt,
    });
  } catch (error) {
    console.error("Join Quiz Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const startQuizRound = async (
  req: Request | any,
  res: Response | any,
) => {
  try {
    const { quizId, roundNumber: roundNumberStr } = req.params;
    const userId = req.user.id;

    const roundNumber = Number(roundNumberStr);

    if (isNaN(roundNumber)) {
      return res.status(400).json({ message: "Invalid roundNumber" });
    }

    const quizAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId, userId },
    });

    if (!quizAttempt) {
      return res.status(403).json({ message: "User has not joined quiz" });
    }

    const round = await prisma.round.findFirst({
      where: { quizId, roundNumber },
      include: {
        quiz: true,
      },
    });

    if (!round) {
      return res.status(404).json({ message: "Round not found for this quiz" });
    }

    // Check if user is qualified for this round (for rounds 2 and 3)
    if (roundNumber > 1) {
      const previousRound = await prisma.round.findFirst({
        where: { quizId, roundNumber: roundNumber - 1 },
      });

      if (previousRound) {
        const previousRoundAttempt = await prisma.roundAttempt.findFirst({
          where: {
            roundId: previousRound.id,
            quizAttemptId: quizAttempt.id,
          },
        });

        if (!previousRoundAttempt || !previousRoundAttempt.qualified) {
          return res.status(403).json({
            message: "You are not qualified for this round",
          });
        }

        // Check buffer time (5 minutes) for rounds 2 and 3
        const BUFFER_TIME_MS = 5 * 60 * 1000;
        const previousRoundAnswers = await prisma.answer.findMany({
          where: {
            roundAttempt: {
              roundId: previousRound.id,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        });

        if (previousRoundAnswers.length > 0) {
          const lastAnswerTime = new Date(previousRoundAnswers[0].createdAt);
          const bufferEndTime = new Date(
            lastAnswerTime.getTime() + BUFFER_TIME_MS,
          );
          const now = new Date();

          if (now < bufferEndTime) {
            const remainingMs = bufferEndTime.getTime() - now.getTime();
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            return res.status(403).json({
              message: `Next round will start in ${remainingMinutes} minute(s). Please wait.`,
              bufferTimeRemaining: remainingMs,
            });
          }
        }
      }
    }

    const alreadyStarted = await prisma.roundAttempt.findFirst({
      where: { roundId: round.id, quizAttemptId: quizAttempt.id },
    });

    if (!alreadyStarted) {
      await prisma.roundAttempt.create({
        data: {
          roundId: round.id,
          quizAttemptId: quizAttempt.id,
          isCorrect: false,
          timeTaken: 0,
          qualified: true,
        },
      });
    }

    const questions = await prisma.question.findMany({
      where: { roundId: round.id },
      include: { options: true },
    });

    return res.status(201).json({
      roundId: round.id,
      roundNumber: round.roundNumber,
      timeLimit: round.timeLimit,
      questions,
    });
  } catch (err) {
    console.error("Start Round Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const submitRound = async (req: Request | any, res: Response | any) => {
  try {
    const { roundId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body;

    const roundAttempt = await prisma.roundAttempt.findFirst({
      where: {
        roundId,
        quizAttempt: { userId },
      },
    });

    if (!roundAttempt) {
      return res.status(400).json({ message: "Round not started yet" });
    }

    const now = new Date();
    const startedAt = roundAttempt.createdAt;
    const round = await prisma.round.findUnique({ where: { id: roundId } });

    if (!round) return res.status(404).json({ message: "Round not found" });

    const timeLimit = round.timeLimit * 60 * 1000; // minutes → ms
    const timeTaken = Math.min(now.getTime() - startedAt.getTime(), timeLimit);

    for (const ans of answers) {
      const option = await prisma.option.findUnique({
        where: { id: ans.selectedOptionId },
      });
      await prisma.answer.create({
        data: {
          roundAttemptId: roundAttempt.id,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId,
          isCorrect: option?.isCorrect || false,
        },
      });
    }

    await prisma.roundAttempt.update({
      where: { id: roundAttempt.id },
      data: { timeTaken },
    });
    await calculateRoundQualification(roundId);

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
        roundAttempts: {
          include: {
            quizAttempt: { include: { user: true } },
            answers: true,
          },
        },
        quiz: true,
      },
    });

    if (!round) return res.status(404).json({ message: "Round not found" });

    const now = Date.now();
    const roundEndTime = new Date(round.createdAt).getTime() + round.timeLimit * 1000;
    const roundOngoing = now < roundEndTime;
    const roundTimeRemaining = Math.max(0, roundEndTime - now);


    let leaderboard = [];
    let myStatus = null;
    let bufferTimeRemaining = 0;
    let canStartNextRound = false;

    if (!roundOngoing) {
      // Build leaderboard
      leaderboard = round.roundAttempts
        .map((attempt) => ({
          userId: attempt.quizAttempt.userId,
          name: attempt.quizAttempt.user.name,
          correctScore: attempt.answers.filter((a) => a.isCorrect).length,
          timeTaken: attempt.timeTaken,
          qualified: attempt.qualified,
        }))
        .sort((a, b) => {
          if (b.correctScore !== a.correctScore) return b.correctScore - a.correctScore;
          return a.timeTaken - b.timeTaken;
        });

      myStatus = leaderboard.find((u) => u.userId === userId);

      // Buffer time after round
      const MIN_BUFFER_MS = 2 * 60 * 1000; // 2 minutes
      bufferTimeRemaining = MIN_BUFFER_MS;
    }

    return res.status(200).json({
      roundNumber: round.roundNumber,
      roundOngoing,
      roundTimeRemaining,
      leaderboard,
      myStatus,
      bufferTimeRemaining,
      canStartNextRound,
      isFinalRound: round.roundNumber === 3,
    });
  } catch (err) {
    console.error("Round Result Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// ---------------- MARK WINNER ----------------
export const markWinner = async (req: Request | any, res: Response | any) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const finalRound = await prisma.round.findFirst({
      where: { quizId, roundNumber: 3 },
      include: {
        roundAttempts: { include: { quizAttempt: true, answers: true } },
      },
    });

    if (!finalRound)
      return res.status(400).json({ message: "Final round not found" });

    const existingWinner = await prisma.quizAttempt.findFirst({
      where: { quizId, isWinner: true },
    });

    if (existingWinner)
      return res.status(400).json({ message: "Winner already declared" });

    const leaderboard = finalRound.roundAttempts
      .map((attempt) => ({
        userId: attempt.quizAttempt.userId,
        correctScore: attempt.answers.filter((a) => a.isCorrect).length,
        timeTaken: attempt.timeTaken,
      }))
      .sort((a, b) => {
        if (b.correctScore !== a.correctScore)
          return b.correctScore - a.correctScore;
        return a.timeTaken - b.timeTaken;
      });

    if (!leaderboard.length || leaderboard[0].userId !== userId)
      return res.status(403).json({ message: "Only top scorer can be winner" });

    await prisma.quizAttempt.updateMany({
      where: { quizId, userId },
      data: { isWinner: true },
    });

    await prisma.quiz.update({
      where: { id: quizId },
      data: { status: "COMPLETED" },
    });

    return res.status(200).json({ message: "Winner declared successfully 🎉" });
  } catch (err) {
    console.error("Mark Winner Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
