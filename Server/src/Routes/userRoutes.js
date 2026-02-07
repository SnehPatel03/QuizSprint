import express from "express";
import { fetchCompletedQuizzes, getAllQuizUserLive, getAllQuizUserUpcoming, getRoundResult, 
// getRoundStatus,
joinQuiz, markWinner, startQuizRound, submitRound, } from "../Controllers/userControllers";
import { authorize } from "../Middleware/authorize";
import { updateQuizStatusMiddleware } from "../Middleware/quizStatusUpdate";
import { getQuizStatus } from "../Controllers/adminControllers";
const router = express.Router();
router.use(authorize);
router.use(updateQuizStatusMiddleware);
router.get("/fetchQuizUserLive", getAllQuizUserLive);
router.get("/fetchQuizUserUpcoming", getAllQuizUserUpcoming);
router.get("/fetchQuizUserCompleted", fetchCompletedQuizzes);
router.post("/joinQuiz/:quizId", joinQuiz);
router.post("/startRound/:quizId/:roundNumber", startQuizRound);
router.post("/submitRound/:roundId", submitRound);
// router.get("/round/:roundId/status",getRoundStatus)
router.get("/roundresult/:roundId", getRoundResult);
router.post("/markWinner/:quizId", markWinner);
router.get("quiz/:quizid/status", getQuizStatus);
export default router;
