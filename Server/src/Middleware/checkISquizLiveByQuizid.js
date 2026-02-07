import { prisma } from "../lib/prisma";
export const checkQuizLiveByQuizid = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ message: "Quiz ID is required" });
        }
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            select: { status: true },
        });
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        if (quiz.status !== "DRAFT") {
            return res.status(403).json({
                message: "You can only edit or delete quizzes that are in DRAFT status. This quiz is already LIVE or COMPLETED.",
            });
        }
        next();
    }
    catch (error) {
        console.error("Quiz Live Middleware Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
