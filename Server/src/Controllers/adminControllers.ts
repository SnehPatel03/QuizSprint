import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

interface RoundType {
  title: string;
  description: string;
  startTime: string;
  maxParticipants: number;
  round2Players: number;
  round3Players: number;
}

interface QuizResponse {
  message: string;
  quiz?: any;
}

const roundSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  startTime: z.string(),
  maxParticipants: z.number().min(1),
  round2Players: z.number().min(1),
  round3Players: z.number().min(1),
});

export const createQuiz = async (
  req:
    | Request<
        {},
        QuizResponse,
        RoundType,
        {
          user: {
            role?: string;
            id?: string;
          };
        }
      >
    | any,
  res: Response<QuizResponse>,
) => {
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
    } = parsed.data;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        maxParticipants,
        round2Players,
        round3Players,
        status: "DRAFT",
        createdBy: req.user.id,
        rounds: {
          create: [
            { roundNumber: 1, timeLimit: 900, maxParticipants },
            { roundNumber: 2, timeLimit: 300, maxParticipants: round2Players },
            { roundNumber: 3, timeLimit: 300, maxParticipants: round3Players },
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
    return res.status(500).json({ message: "Error creating quiz" });
  }
};

export const getAllQuiz = async (req: Request | any, res: Response) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        createdBy: req.user.id,
      },
    });

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quiz: quizzes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching quizzes" });
  }
};

export const updateQuiz = async (
  req: Request<{ id: string }, QuizResponse, Partial<RoundType>>,
  res: Response<QuizResponse>,
) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...req.body,
        startTime: req.body.startTime
          ? new Date(req.body.startTime)
          : undefined,
      },
    });

    return res.status(200).json({
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating quiz" });
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
    console.error(error);
    return res.status(500).json({ message: "Error deleting quiz" });
  }
};