import { NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const updateQuizStatusMiddleware = async (req:Request | any, res:Response | any, next:NextFunction) => {
  const now = new Date();

  try {
    const quizzes = await prisma.quiz.findMany({
      include: { rounds: true },
    });

    for (const quiz of quizzes) {
      if (quiz.status === "DRAFT" && now >= quiz.startTime) {
        await prisma.quiz.update({
          where: { id: quiz.id },
          data: { status: "LIVE" },
        });
      }

    //   if (quiz.status === "LIVE") {
    //     const allRoundsCompleted = quiz.rounds.every(
    //       (round) => round.roundAttempts?.length > 0 // or other logic
    //     );
    //     if (allRoundsCompleted) {
    //       await prisma.quiz.update({
    //         where: { id: quiz.id },
    //         data: { status: "COMPLETED" },
    //       });
    //     }
    //   }
    }
  } catch (err) {
    console.error("Quiz status update error:", err);
  }

  next();
};
