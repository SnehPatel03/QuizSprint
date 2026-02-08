"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkQuizLiveByqid = void 0;
const prisma_1 = require("../lib/prisma");
const checkQuizLiveByqid = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Quiz ID is required" });
        }
        const quiz = await prisma_1.prisma.quiz.findUnique({
            where: { id: id },
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
exports.checkQuizLiveByqid = checkQuizLiveByqid;
