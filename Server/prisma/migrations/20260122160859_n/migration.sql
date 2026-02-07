/*
  Warnings:

  - Added the required column `description` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxParticipants` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `round2Players` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `round3Players` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxParticipants` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passPercentage` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'LIVE', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_quizId_fkey";

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "maxParticipants" INTEGER NOT NULL,
ADD COLUMN     "round2Players" INTEGER NOT NULL,
ADD COLUMN     "round3Players" INTEGER NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "maxParticipants" INTEGER NOT NULL,
ADD COLUMN     "passPercentage" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
