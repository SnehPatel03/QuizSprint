  import { prisma } from "../lib/prisma";

  export const calculateRoundQualification = async (roundId: string | any) => {
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: {
        quiz: true,
        roundAttempts: { include: { quizAttempt: true, answers: true } },
        questions: true,
      },
    });

    if (!round) throw new Error("Round not found");

    const totalQuestions = round.questions.length;
    const scoredList = round.roundAttempts.map((attempt: any) => {
      const correctAnswers = attempt.answers.filter((a:any) => a.isCorrect).length;
      return {
        userId: attempt.quizAttempt.userId,
        roundAttemptId: attempt.id,
        correctAnswers,
        timeTaken: attempt.timeTaken,
      };
    });

    scoredList.sort((a, b) => {
      if (b.correctAnswers !== a.correctAnswers)
        return b.correctAnswers - a.correctAnswers;
      return a.timeTaken - b.timeTaken;
    });

    let topCount =
      round.roundNumber === 1
        ? round.quiz.round2Players
        : round.quiz.round3Players;
    if (round.roundNumber == 3) {
      topCount = 3;
    }
    for (let i = 0; i < scoredList.length; i++) {
      const qualified = i < topCount;
      await prisma.roundAttempt.update({
        where: { id: scoredList[i].roundAttemptId },
        data: { qualified },
      });
    }

    // Mark round as COMPLETED after qualification is calculated
    await prisma.round.update({
      where: { id: roundId },
      data: { status: "COMPLETED" },
    });

    console.log(`Round ${roundId} qualification calculated successfully.`);
  };
