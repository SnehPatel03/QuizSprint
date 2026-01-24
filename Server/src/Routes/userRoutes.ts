import express from "express";
import {
  getAllQuizUserLive,
  getAllQuizUserUpcoming,
  joinQuiz,
} from "../Controllers/userControllers";
import { authorize } from "../Middleware/authorize";

const router = express.Router();

router.use(authorize);

router.get("/fetchQuizUserLive", getAllQuizUserLive);
router.post("/joinQuiz/:quizId", joinQuiz);
router.get("/fetchQuizUserUpcoming", getAllQuizUserUpcoming);



export default router