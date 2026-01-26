import express  from "express";
import { createQuiz, deleteQuiz, getAllQuiz, updateQuiz } from "../Controllers/adminControllers";
import { isAdmin } from "../Middleware/isAdmin";
import { authorize } from "../Middleware/authorize";
import { updateQuizStatusMiddleware } from "../Middleware/quizStatusUpdate";
import { checkQuizLiveByqid } from "../Middleware/checkISquizLive";


export const routes = express.Router();

routes.use(authorize)
routes.use(isAdmin)
// routes.use(updateQuizStatusMiddleware)
// routes.use(checkQuizLive)

routes.post("/quiz", createQuiz);
routes.get("/fetchQuiz",updateQuizStatusMiddleware, getAllQuiz);
routes.patch("/updateQuiz/:id",checkQuizLiveByqid, updateQuiz);
routes.delete("/deleteQuiz/:id", checkQuizLiveByqid,deleteQuiz);


export default routes;