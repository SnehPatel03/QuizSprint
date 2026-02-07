import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const checkUserRoundTime = async (req: Request | any, res: Response | any, next: NextFunction) => {
  try {
    const { roundId, userId } = req.body;

    if (!roundId) return res.status(400).json({ message: "Round ID required" });

    const roundAttempt: any = await prisma.roundAttempt.findFirst({
      where: { roundId, quizAttempt: { userId } },
      include: { round: true },
    });

    if (!roundAttempt) {
      return res.status(404).json({ message: "Round not started for this user" });
    }

    const roundEndTime = new Date(roundAttempt.getTime() + roundAttempt.round.timeLimit * 1000);
    const now = new Date();

    if (now > roundEndTime || roundAttempt.round.status === "COMPLETED") {
      return res.status(403).json({ message: "Time is up for this round" });
    }

    next();
  } catch (error) {
    console.error("User Round Time Check Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
