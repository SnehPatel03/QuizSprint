import { Router } from "express";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByRound,
} from "../Controllers/questionControllers";
import { isAdmin } from "../Middleware/isAdmin";
import { authorize } from "../Middleware/authorize";
import { checkQuizLive } from "../Middleware/checkISquizLive";
import { updateQuizStatusMiddleware } from "../Middleware/quizStatusUpdate";

const router = Router();
router.use(authorize)
router.use(updateQuizStatusMiddleware)
router.use(isAdmin)
router.post("/createQue/:quizId", checkQuizLive, createQuestion);
router.put("/updateQue/:id",checkQuizLive, updateQuestion);
router.delete("/deleteQue/:id",checkQuizLive, deleteQuestion);
router.get("/fetchQue/:quizId/:roundNumber", getQuestionsByRound);

export default router;
