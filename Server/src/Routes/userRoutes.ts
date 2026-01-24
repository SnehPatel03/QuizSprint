import express from "express";
import {
  getAllQuizUserLive,
  getAllQuizUserUpcoming,
  getRoundStatus,
  joinQuiz,
  startQuizRound,
  submitRound,
} from "../Controllers/userControllers";
import { authorize } from "../Middleware/authorize";

const router = express.Router();

router.use(authorize);

router.get("/fetchQuizUserLive", getAllQuizUserLive);
router.get("/fetchQuizUserUpcoming", getAllQuizUserUpcoming);
router.post("/joinQuiz/:quizId", joinQuiz);
router.post("/startRound/:quizId/:roundNumber",startQuizRound)
router.post("/submitRound/:roundId",submitRound)
router.get("/round/:roundId/status",getRoundStatus)



export default router