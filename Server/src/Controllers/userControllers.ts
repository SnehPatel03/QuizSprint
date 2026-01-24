import { prisma } from "../lib/prisma";
export const getAllQuizUserUpcoming = async (
  req: Request,
  res: Response | any
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
    return res.status(500).json({ message: "Error fetching quizzes for users LIVE" });
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

