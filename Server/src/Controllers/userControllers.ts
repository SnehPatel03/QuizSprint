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

    if (quiz.status !== "LIVE") {
      return res.status(400).json({
        message: "Quiz is not live yet",
      });
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
    console.log("req", req.params);
    const roundNumber = Number(roundNumberStr);

    if (isNaN(roundNumber)) {
      return res.status(400).json({ message: "Invalid roundNumber" });
    }

    // Check if user has joined the quiz
    const quizAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId, userId },
    });

    if (!quizAttempt) {
      return res.status(403).json({ message: "User has not joined quiz" });
    }

    // Find the round
    const round = await prisma.round.findFirst({
      where: { quizId, roundNumber },
    });

    if (!round) {
      return res.status(404).json({ message: "Round not found for this quiz" });
    }

    // Check if round attempt already exists
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

    return res.status(200).json({ message: "Answers submitted successfully" });
    calculateRoundQualification(roundId);
  } catch (error) {
    console.error("Submit Round Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoundStatus = async (req: Request | any, res: Response | any) => {
  const { roundId } = req.params;
  const userId = req.user.id;

  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }

  const attempt = await prisma.roundAttempt.findFirst({
    where: {
      roundId,
      quizAttempt: { userId }, // ✅ correct
    },
    select: { qualified: true },
  });

  if (!attempt) {
    return res.status(404).json({ message: "Attempt not found" });
  }

  return res.json({ status: attempt.qualified ? "QUALIFIED" : "ELIMINATED" });
};

