import express  from "express";
import { createQuiz, deleteQuiz, getAllQuiz, updateQuiz } from "../Controllers/adminControllers";
import { isAdmin } from "../Middleware/isAdmin";
import { authorize } from "../Middleware/authorize";
const routes = express.Router();

routes.use(authorize)
routes.use(isAdmin)


routes.post("/quiz", createQuiz);
routes.get("/fetchQuiz", getAllQuiz);
routes.patch("/quiz/:id",updateQuiz);
routes.delete("/quiz/:id", deleteQuiz);


export default routes;