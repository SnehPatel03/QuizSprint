import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

interface QuizResponse {
  message: string;
  quiz?: any;
}

const roundSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  startTime: z.string(),
  maxParticipants: z.number().min(1),
  round2Players: z.number().min(1),
  round3Players: z.number().min(1),
  timeLimit1: z.number(),
  timeLimit2: z.number(),
  timeLimit3: z.number(),
});


export const createQuiz = async (req: any, res: Response<QuizResponse>) => {
  try {
    const parsed = roundSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        quiz: parsed.error.issues.map((i) => i.message),
      });
    }

    const {
      title,
      description,
      startTime,
      maxParticipants,
      round2Players,
      round3Players,
      timeLimit1,
      timeLimit2,
      timeLimit3,
    } = parsed.data;

    const quizStartTime = new Date(startTime);

    
    const round1StartTime = new Date(
      quizStartTime.getTime() + 1 * 60 * 1000
    );

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        startTime: quizStartTime,
        maxParticipants,
        round2Players,
        round3Players,
        status: "DRAFT",
        createdBy: req.user.id,
        rounds: {
          create: [
            {
              roundNumber: 1,
              timeLimit: timeLimit1,
              maxParticipants,
              roundStartTime: round1StartTime,
            },
            {
              roundNumber: 2,
              timeLimit: timeLimit2,
              maxParticipants: round2Players,
              roundStartTime: null, // starts automatically after round 1
            },
            {
              roundNumber: 3,
              timeLimit: timeLimit3,
              maxParticipants: round3Players,
              roundStartTime: null, // starts automatically after round 2
            },
          ],
        },
      },
      include: { rounds: true },
    });

    return res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("Create Quiz Error:", error);
    return res.status(500).json({
      message: "Error creating quiz",
    });
  }
};

/* ---------------- GET ALL QUIZ ---------------- */
export const getAllQuiz = async (req: Request | any, res: Response) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        createdBy: req.user.id,
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
        createdAt: "desc", // ✅ FIXED
      },
    });

    const quizzesWithWinner = quizzes.map((quiz) => {
      const winner = quiz.attempts.find((attempt) => attempt.isWinner);
      return {
        ...quiz,
        winner: winner?.user.name || null,
        attempts: undefined,
      };
    });

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quiz: quizzesWithWinner,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching quizzes" });
  }
};

/* ---------------- UPDATE QUIZ ---------------- */
export const updateQuiz = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      maxParticipants,
      round2Players,
      round3Players,
      startTime,
      timeLimit1,
      timeLimit2,
      timeLimit3,
    } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        description,
        maxParticipants,
        round2Players,
        round3Players,
        startTime: new Date(startTime),
      },
    });

    await prisma.round.updateMany({
      where: { quizId: id, roundNumber: 1 },
      data: { timeLimit: Number(timeLimit1) },
    });

    await prisma.round.updateMany({
      where: { quizId: id, roundNumber: 2 },
      data: { timeLimit: Number(timeLimit2) },
    });

    await prisma.round.updateMany({
      where: { quizId: id, roundNumber: 3 },
      data: { timeLimit: Number(timeLimit3) },
    });

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Update Quiz Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quiz",
    });
  }
};

/* ---------------- DELETE QUIZ ---------------- */
export const deleteQuiz = async (
  req: Request<{ id: string }>,
  res: Response<QuizResponse>
) => {
  try {
    await prisma.quiz.delete({
      where: { id: req.params.id },
    });

    return res.status(200).json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete Quiz Error:", error);
    return res.status(500).json({ message: "Error deleting quiz" });
  }
};


// GET /user/quiz/:quizId/status
export const getQuizStatus = async (req: Request | any, res: Response) => {
  const { quizId } = req.params;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        rounds: {
          where: { roundNumber: 1 },
          take: 1,
          select: {
            roundStartTime: true,
            timeLimit: true,
            status: true,
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const round1 = quiz.rounds[0];

    if (!round1) {
      return res.status(400).json({ message: "Round 1 not configured yet" });
    }

    const now = new Date();

    if (!round1.roundStartTime || now < new Date(round1.roundStartTime)) {
      return res.json({
        canJoin: false,
        message: `Round 1 will start at ${round1.roundStartTime}`,
        secondsLeft: Math.floor(
          (new Date(round1.roundStartTime).getTime() - now.getTime()) / 1000 ),
        quizStatus: quiz.status,
        roundStatus: round1.status,
      });
    }

    // Round 1 started
    return res.json({
      canJoin: true,
      message: "You can join the quiz now",
      quizStatus: quiz.status,
      roundStatus: round1.status,
      roundTimeLimit: round1.timeLimit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
