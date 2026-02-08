"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../Controllers/userControllers");
const authorize_1 = require("../Middleware/authorize");
const quizStatusUpdate_1 = require("../Middleware/quizStatusUpdate");
const adminControllers_1 = require("../Controllers/adminControllers");
const router = express_1.default.Router();
router.use(authorize_1.authorize);
router.use(quizStatusUpdate_1.updateQuizStatusMiddleware);
router.get("/fetchQuizUserLive", userControllers_1.getAllQuizUserLive);
router.get("/fetchQuizUserUpcoming", userControllers_1.getAllQuizUserUpcoming);
router.get("/fetchQuizUserCompleted", userControllers_1.fetchCompletedQuizzes);
router.post("/joinQuiz/:quizId", userControllers_1.joinQuiz);
router.post("/startRound/:quizId/:roundNumber", userControllers_1.startQuizRound);
router.post("/submitRound/:roundId", userControllers_1.submitRound);
// router.get("/round/:roundId/status",getRoundStatus)
router.get("/roundresult/:roundId", userControllers_1.getRoundResult);
router.post("/markWinner/:quizId", userControllers_1.markWinner);
router.get("quiz/:quizid/status", adminControllers_1.getQuizStatus);
exports.default = router;
