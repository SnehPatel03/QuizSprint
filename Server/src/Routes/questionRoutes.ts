import { Router } from "express";
import {  
  updateQuestion,
  deleteQuestion,
  getQuestionsByRound,
  createQuestionfor1,
  createQuestionfor2,
  createQuestionfor3,
} from "../Controllers/questionControllers";
import { isAdmin } from "../Middleware/isAdmin";
import { authorize } from "../Middleware/authorize";

import { updateQuizStatusMiddleware } from "../Middleware/quizStatusUpdate";
import { checkQuizLiveByqid } from "../Middleware/checkISquizLive";
import { checkQuizLiveByQuizid } from "../Middleware/checkISquizLiveByQuizid";



const router = Router();
router.use(authorize)
router.use(updateQuizStatusMiddleware)
router.use(isAdmin)
router.post("/createQuefor1/:quizId", createQuestionfor1);
router.post("/createQuefor2/:quizId",createQuestionfor2);
router.post("/createQuefor3/:quizId", createQuestionfor3);
router.put("/updateQue/:id" ,updateQuestion);
router.delete("/deleteQue/:id",deleteQuestion);
router.get("/fetchQue/:quizId/:roundNumber", getQuestionsByRound);

export default router;
