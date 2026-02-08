"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuizStatusMiddleware = void 0;
const prisma_1 = require("../lib/prisma");
const updateQuizStatusMiddleware = async (req, res, next) => {
    const now = new Date();
    try {
        const quizzes = await prisma_1.prisma.quiz.findMany({});
        for (const quiz of quizzes) {
            // If DRAFT and startTime passed → LIVE
            if (quiz.status === "DRAFT" && now >= quiz.startTime) {
                await prisma_1.prisma.quiz.update({
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
    }
    catch (err) {
        console.error("Quiz status update error:", err);
    }
    next();
};
exports.updateQuizStatusMiddleware = updateQuizStatusMiddleware;
