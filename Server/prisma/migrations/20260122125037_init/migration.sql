/*
  Warnings:

  - A unique constraint covering the columns `[userId,quizId]` on the table `QuizAttempt` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quizId,roundNumber]` on the table `Round` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttempt_userId_quizId_key" ON "QuizAttempt"("userId", "quizId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_quizId_roundNumber_key" ON "Round"("quizId", "roundNumber");
