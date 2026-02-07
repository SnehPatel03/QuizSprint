import { prisma } from "../lib/prisma";
import { z } from "zod";
const optionSchema = z.object({
    text: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean(),
});
const questionSchema = z.object({
    text: z.string().min(1, "Question must be at least 1 characters"),
    options: z.array(optionSchema).min(2, "Minimum 2 options required"),
});
const bulkSchema = z.object({
    rounds: z.array(z.object({
        questions: z.array(questionSchema).min(1),
    })).min(1),
});
export const createQuestionfor1 = async (req, res) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ message: "Quiz ID is required" });
        }
        const parsed = bulkSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.issues.map(i => i.message),
            });
        }
        const ROUND_NUMBER = 1;
        // ✅ Find round 1
        const round = await prisma.round.findFirst({
            where: {
                quizId,
                roundNumber: ROUND_NUMBER,
            },
        });
        if (!round) {
            return res.status(404).json({
                message: `Round ${ROUND_NUMBER} not found for this quiz`,
            });
        }
        // 👉 Take questions from first round only
        const questions = parsed.data.rounds[0].questions;
        const createdQuestions = [];
        for (const q of questions) {
            // ✅ Validate correct option
            if (!q.options.some(o => o.isCorrect)) {
                return res.status(400).json({
                    message: `Question "${q.text}" must have at least one correct option`,
                });
            }
            const question = await prisma.question.create({
                data: {
                    text: q.text,
                    roundId: round.id,
                    options: {
                        create: q.options,
                    },
                },
                include: { options: true },
            });
            createdQuestions.push(question);
        }
        return res.status(201).json({
            message: "Questions created successfully for Round 1",
            questions: createdQuestions,
        });
    }
    catch (error) {
        console.error("Create Question Error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
export const createQuestionfor2 = async (req, res) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ message: "Quiz ID is required" });
        }
        const parsed = bulkSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.issues.map(i => i.message),
            });
        }
        const ROUND_NUMBER = 2;
        const round = await prisma.round.findFirst({
            where: {
                quizId,
                roundNumber: ROUND_NUMBER,
            },
        });
        if (!round) {
            return res.status(404).json({
                message: `Round ${ROUND_NUMBER} not found for this quiz`,
            });
        }
        // 👉 Take questions from first round only
        const questions = parsed.data.rounds[0].questions;
        const createdQuestions = [];
        for (const q of questions) {
            // ✅ Validate correct option
            if (!q.options.some(o => o.isCorrect)) {
                return res.status(400).json({
                    message: `Question "${q.text}" must have at least one correct option`,
                });
            }
            const question = await prisma.question.create({
                data: {
                    text: q.text,
                    roundId: round.id,
                    options: {
                        create: q.options,
                    },
                },
                include: { options: true },
            });
            createdQuestions.push(question);
        }
        return res.status(201).json({
            message: "Questions created successfully for Round 1",
            questions: createdQuestions,
        });
    }
    catch (error) {
        console.error("Create Question Error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
export const createQuestionfor3 = async (req, res) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ message: "Quiz ID is required" });
        }
        const parsed = bulkSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.issues.map(i => i.message),
            });
        }
        const ROUND_NUMBER = 3;
        const round = await prisma.round.findFirst({
            where: {
                quizId,
                roundNumber: ROUND_NUMBER,
            },
        });
        if (!round) {
            return res.status(404).json({
                message: `Round ${ROUND_NUMBER} not found for this quiz`,
            });
        }
        // 👉 Take questions from first round only
        const questions = parsed.data.rounds[0].questions;
        const createdQuestions = [];
        for (const q of questions) {
            // ✅ Validate correct option
            if (!q.options.some(o => o.isCorrect)) {
                return res.status(400).json({
                    message: `Question "${q.text}" must have at least one correct option`,
                });
            }
            const question = await prisma.question.create({
                data: {
                    text: q.text,
                    roundId: round.id,
                    options: {
                        create: q.options,
                    },
                },
                include: { options: true },
            });
            createdQuestions.push(question);
        }
        return res.status(201).json({
            message: "Questions created successfully for Round 1",
            questions: createdQuestions,
        });
    }
    catch (error) {
        console.error("Create Question Error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
export const getQuestionsByRound = async (req, res) => {
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
    }
    catch (error) {
        console.error("Fetch Questions Error:", error);
        return res.status(500).json({
            message: "Error fetching questions",
        });
    }
};
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, options } = req.body;
        if (options) {
            const hasCorrect = options.some((o) => o.isCorrect);
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
    }
    catch (error) {
        console.error("Update Question Error:", error);
        return res.status(500).json({
            message: "Error updating question",
        });
    }
};
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.question.delete({
            where: { id },
        });
        return res.status(200).json({
            message: "Question deleted Successfully",
        });
    }
    catch (error) {
        console.error("Update Question Error:", error);
        return res.status(500).json({
            message: "Error Deleteing question",
        });
    }
};
