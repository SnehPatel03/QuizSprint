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
  description: z.string().min(1),
  startTime: z.string(),
  maxParticipants: z.number().min(1),
  round2Players: z.number().min(1),
  round3Players: z.number().min(1),
  timeLimit1:z.number(),
  timeLimit2:z.number(),
  timeLimit3:z.number()
});

export const createQuiz = async (req: any, res: Response<QuizResponse>) => {
  try {
    const parsed = roundSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        quiz: parsed.error.issues.map(i => i.message),
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
            {
              roundNumber: 1,
              timeLimit: timeLimit1,
              maxParticipants,
            },
            {
              roundNumber: 2,
              timeLimit: timeLimit2,
              maxParticipants: round2Players,
            },
            {
              roundNumber: 3,
              timeLimit: timeLimit3,
              maxParticipants: round3Players,
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

export const updateQuiz = async (req:any, res:any) => {
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

    // 1️⃣ Update Quiz basic info
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

    // 2️⃣ Update rounds time limits
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