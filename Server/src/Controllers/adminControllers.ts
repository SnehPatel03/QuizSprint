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
  quiz?: object;
}


const roundSchema = z.object({
  title: z.string().min(3, "Title must have at least 3 characters"),
  description: z.string().min(5, "Description must have least 5 characters"),
  startTime: z.string(),
  maxParticipants: z.number().min(1, "Must have at least 1 participant"),
  round2Players: z.number().min(1),
  round3Players: z.number().min(1),
});


export const createQuiz = async (
  
  req: Request<{}, QuizResponse, RoundType>,
  res: Response<QuizResponse>
) => {
  try {

    const parsed = roundSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      return res.status(400).json({ message: "Validation failed", quiz: errors });
    }

    const { title, description, startTime, maxParticipants, round2Players, round3Players } = parsed.data;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        maxParticipants,
        round2Players,
        round3Players,
        status: "DRAFT",
        rounds: {
          create: [
            { roundNumber: 1, timeLimit: 300 },
            { roundNumber: 2, timeLimit: 300 },
            { roundNumber: 3, timeLimit: 300 },
          ],
        },
      },
      include: { rounds: true },
    });

    return res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating quiz" });
  }
};

export const getAllQuiz = async (req: Request, res: Response) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: { rounds: true },
    });
    return res.status(200).json({ message: "Quizzes fetched successfully", quiz: quizzes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching quizzes" });
  }
};


export const updateQuiz = async (req: Request<{ id: string }, QuizResponse, Partial<RoundType>>, res: Response<QuizResponse>) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
      },
    });

    return res.status(200).json({ message: "Quiz updated successfully", quiz });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating quiz" });
  }
};


export const deleteQuiz = async (req: Request<{ id: string }>, res: Response<QuizResponse>) => {
  try {
    const { id } = req.params;

    await prisma.quiz.delete({ where: { id } });

    return res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting quiz" });
  }
};
