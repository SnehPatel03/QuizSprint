"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizStatus = exports.deleteQuiz = exports.updateQuiz = exports.getAllQuiz = exports.createQuiz = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
const time_1 = require("../utils/time");
const roundSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(1),
    startTime: zod_1.z.string(),
    maxParticipants: zod_1.z.number().min(1),
    round2Players: zod_1.z.number().min(1),
    round3Players: zod_1.z.number().min(1),
    timeLimit1: zod_1.z.number(),
    timeLimit2: zod_1.z.number(),
    timeLimit3: zod_1.z.number(),
});
const createQuiz = async (req, res) => {
    try {
        const parsed = roundSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                quiz: parsed.error.issues.map((i) => i.message),
            });
        }
        const { title, description, startTime, maxParticipants, round2Players, round3Players, timeLimit1, timeLimit2, timeLimit3, } = parsed.data;
        const quizStartTime = (0, time_1.istToUTC)(startTime);
        const round1StartTime = new Date(quizStartTime.getTime() + 2 * 60 * 1000);
        const quiz = await prisma_1.prisma.quiz.create({
            data: {
                title,
                description,
                startTime: quizStartTime,
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
                            roundStartTime: round1StartTime,
                        },
                        {
                            roundNumber: 2,
                            timeLimit: timeLimit2,
                            maxParticipants: round2Players,
                            roundStartTime: null,
                        },
                        {
                            roundNumber: 3,
                            timeLimit: timeLimit3,
                            maxParticipants: round3Players,
                            roundStartTime: null,
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
    }
    catch (error) {
        console.error("Create Quiz Error:", error);
        return res.status(500).json({
            message: "Error creating quiz",
        });
    }
};
exports.createQuiz = createQuiz;
const getAllQuiz = async (req, res) => {
    try {
        const quizzes = await prisma_1.prisma.quiz.findMany({
            where: {
                createdBy: req.user.id,
            },
            include: {
                attempts: {
                    where: {
                        isWinner: true,
                    },
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const quizzesWithWinner = quizzes.map((quiz) => {
            const winner = quiz.attempts.find((attempt) => attempt.isWinner);
            return {
                ...quiz,
                winner: winner?.user.name || null,
                attempts: undefined,
            };
        });
        return res.status(200).json({
            message: "Quizzes fetched successfully",
            quiz: quizzesWithWinner,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching quizzes" });
    }
};
exports.getAllQuiz = getAllQuiz;
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, maxParticipants, round2Players, round3Players, startTime, timeLimit1, timeLimit2, timeLimit3, } = req.body;
        const quiz = await prisma_1.prisma.quiz.update({
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
        await prisma_1.prisma.round.updateMany({
            where: { quizId: id, roundNumber: 1 },
            data: { timeLimit: Number(timeLimit1) },
        });
        await prisma_1.prisma.round.updateMany({
            where: { quizId: id, roundNumber: 2 },
            data: { timeLimit: Number(timeLimit2) },
        });
        await prisma_1.prisma.round.updateMany({
            where: { quizId: id, roundNumber: 3 },
            data: { timeLimit: Number(timeLimit3) },
        });
        res.status(200).json({
            success: true,
            message: "Quiz updated successfully",
            quiz,
        });
    }
    catch (error) {
        console.error("Update Quiz Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update quiz",
        });
    }
};
exports.updateQuiz = updateQuiz;
const deleteQuiz = async (req, res) => {
    try {
        await prisma_1.prisma.quiz.delete({
            where: { id: req.params.id },
        });
        return res.status(200).json({
            message: "Quiz deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete Quiz Error:", error);
        return res.status(500).json({ message: "Error deleting quiz" });
    }
};
exports.deleteQuiz = deleteQuiz;
const getQuizStatus = async (req, res) => {
    const { quizId } = req.params;
    try {
        const quiz = await prisma_1.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                rounds: {
                    where: { roundNumber: 1 },
                    take: 1,
                },
            },
        });
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        const round1 = quiz.rounds[0];
        const now = (0, time_1.nowUTC)();
        if (!round1?.roundStartTime || now < round1.roundStartTime) {
            return res.json({
                canJoin: false,
                message: `Round 1 will start at ${(0, time_1.utcToIST)(round1.roundStartTime)}`,
                secondsLeft: Math.floor((round1.roundStartTime.getTime() - now.getTime()) / 1000),
                quizStatus: quiz.status,
            });
        }
        return res.json({
            canJoin: true,
            message: "You can join the quiz now",
            quizStatus: quiz.status,
            roundTimeLimit: round1.timeLimit,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getQuizStatus = getQuizStatus;
