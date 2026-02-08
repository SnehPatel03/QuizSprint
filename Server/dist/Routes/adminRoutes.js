"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const adminControllers_1 = require("../Controllers/adminControllers");
const isAdmin_1 = require("../Middleware/isAdmin");
const authorize_1 = require("../Middleware/authorize");
const quizStatusUpdate_1 = require("../Middleware/quizStatusUpdate");
const checkISquizLive_1 = require("../Middleware/checkISquizLive");
exports.routes = express_1.default.Router();
exports.routes.use(authorize_1.authorize);
exports.routes.use(isAdmin_1.isAdmin);
// routes.use(updateQuizStatusMiddleware)
// routes.use(checkQuizLive)
exports.routes.post("/quiz", adminControllers_1.createQuiz);
exports.routes.get("/fetchQuiz", quizStatusUpdate_1.updateQuizStatusMiddleware, adminControllers_1.getAllQuiz);
exports.routes.patch("/updateQuiz/:id", checkISquizLive_1.checkQuizLiveByqid, adminControllers_1.updateQuiz);
exports.routes.delete("/deleteQuiz/:id", checkISquizLive_1.checkQuizLiveByqid, adminControllers_1.deleteQuiz);
exports.default = exports.routes;
