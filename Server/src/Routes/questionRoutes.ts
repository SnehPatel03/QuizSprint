import { Router } from "express";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByRound,
} from "../Controllers/questionControllers";
import { isAdmin } from "../Middleware/isAdmin";
import { authorize } from "../Middleware/authorize";


const router = Router();
router.use(authorize)
router.use(isAdmin)


router.post("/createQue", createQuestion);
router.put("/updateQue/:id", updateQuestion);
router.delete("/deleteQue/:id", deleteQuestion);
router.get("/fetchQue/:quizId/:roundNumber", getQuestionsByRound);

export default router;
