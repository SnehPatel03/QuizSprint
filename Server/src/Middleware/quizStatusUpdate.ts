import { prisma } from "../lib/prisma";

export const updateQuizStatusMiddleware = async (req: any, res: any, next: any) => {
  const now = new Date();

  try {
    const quizzes = await prisma.quiz.findMany({});

    for (const quiz of quizzes) {

      if (quiz.status === "DRAFT" && now >= quiz.startTime) {
        await prisma.quiz.update({
          where: { id: quiz.id },
          data: { status: "LIVE" },
        });
      }

      // If LIVE and endTime passed → COMPLETED
      // if (quiz.status === "LIVE" && quiz.endTime && now >= quiz.endTime) {
      //   await prisma.quiz.update({
      //     where: { id: quiz.id },
      //     data: { status: "COMPLETED" },
      //   });
      // }
    }
  } catch (err) {
    console.error("Quiz status update error:", err);
  }

  next();
};
