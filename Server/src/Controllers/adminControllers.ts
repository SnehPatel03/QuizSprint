import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { istToUTC, utcToIST, nowUTC } from "../utils/time";

interface QuizType {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  startTime: Date;
  status: string;
  maxParticipants: number;
  round2Players: number;
  round3Players: number;
  createdBy: string;
  admin: User;
  attempts: QuizAttempt[];
  rounds: Round[];
}
interface User {
  id: string;
  name: string;
}

interface Round {
  id: string;
  roundNumber: number;
  timeLimit: number;

}

interface QuizAttempt {
  id: string;
  isWinner: boolean;
}


interface QuizResponse {
  message: string;
  quiz?: QuizType;
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

export const createQuiz = async (req: Request, res: Response) => {
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

    const quizStartTime = istToUTC(startTime);

    const round1StartTime = new Date(quizStartTime.getTime() + 2 * 60 * 1000);

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
              roundStartTime: null,
            },
            {
              roundNumber: 3,
              timeLimit: timeLimit3,
              maxParticipants: round3Players,
              roundStartTime: null,
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

export const getAllQuiz = async (req: Request, res: Response) => {
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
        createdAt: "desc",
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

export const updateQuiz = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
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

export const deleteQuiz = async (
  req: Request<{ id: string }>,
  res: Response<QuizResponse>,
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

export const getQuizStatus = async (
  req: Request<{ quizId: string }>,
  res: Response,
) => {
  const { quizId } = req.params;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        rounds: {
          where: { roundNumber: 1 },
          take: 1,
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const round1:any = quiz.rounds[0];
    const now = nowUTC();

    if (!round1?.roundStartTime || now < round1.roundStartTime) {
      return res.json({
        canJoin: false,
        message: `Round 1 will start at ${utcToIST(round1.roundStartTime)}`,
        secondsLeft: Math.floor(
          (round1.roundStartTime.getTime() - now.getTime()) / 1000,
        ),
        quizStatus: quiz.status,
      });
    }

    return res.json({
      canJoin: true,
      message: "You can join the quiz now",
      quizStatus: quiz.status,
      roundTimeLimit: round1.timeLimit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
