import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { string, z } from "zod";

const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

const createQuestionSchema = z.object({
  quizId: z.string().uuid("Invalid quiz ID"),
  roundNumber: z.number().int().min(1).max(3),
  text: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(optionSchema).min(2, "Minimum 2 options required"),
});

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const parsed = createQuestionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues.map((i) => i.message),
      });
    }

    const { quizId, roundNumber, text, options } = parsed.data;
    const hasCorrectOption = options.some((o) => o.isCorrect);

    if (!hasCorrectOption) {
      return res.status(400).json({
        message: "At least one option must be marked as correct",
      });
    }

    const round = await prisma.round.findFirst({
      where: {
        quizId,
        roundNumber,
      },
    });

    if (!round) {
      return res.status(404).json({
        message: `Round ${roundNumber} not found for this quiz`,
      });
    }

    const question = await prisma.question.create({
      data: {
        text,
        roundId: round.id,
        options: {
          create: options,
        },
      },
      include: {
        options: true,
      },
    });

    return res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error("Create Question Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getQuestionsByRound = async (
  req: Request | any,
  res: Response,
) => {
  try {
    const { quizId, roundNumber } = req.params;

    const round = await prisma.round.findFirst({
      where: {
        quizId,
        roundNumber: Number(roundNumber),
      },
    });

    if (!round) {
      return res.status(404).json({
        message: "Round not found for this quiz",
      });
    }

    const questions = await prisma.question.findMany({
      where: { roundId: round.id },
      include: { options: true },
    });

    return res.status(200).json({
      message: "Questions fetched successfully",
      questions,
    });
  } catch (error) {
    console.error("Fetch Questions Error:", error);
    return res.status(500).json({
      message: "Error fetching questions",
    });
  }
};

export const updateQuestion = async (req: Request | any, res: Response) => {
  try {
    const { id } = req.params;
    const { text, options } = req.body;

    if (options) {
      const hasCorrect = options.some((o: any) => o.isCorrect);
      if (!hasCorrect) {
        return res.status(400).json({
          message: "At least one option must be marked as correct",
        });
      }
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        text,
        options: options
          ? {
              deleteMany: {}, // remove old options
              create: options, // add new options
            }
          : undefined,
      },
      include: { options: true },
    });

    return res.status(200).json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Update Question Error:", error);
    return res.status(500).json({
      message: "Error updating question",
    });
  }
};

export const deleteQuestion = async (req: Request | any, res: Response) => {

  try {
    
    const {id} = req.params
    await prisma.question.delete({
      where: { id },
    });
    return res.status(200).json({
      message : "Question deleted Successfully"

    })
  } catch (error) {
    console.error("Update Question Error:", error);
    return res.status(500).json({
      message: "Error Deleteing question",
    });
  }
}